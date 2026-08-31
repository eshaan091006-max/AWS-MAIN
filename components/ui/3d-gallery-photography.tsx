"use client";

import type React from "react";
import { useRef, useMemo, useCallback, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

type ImageItem = string | { src: string; alt?: string };

interface FadeSettings {
  fadeIn: { start: number; end: number };
  fadeOut: { start: number; end: number };
}

interface BlurSettings {
  blurIn: { start: number; end: number };
  blurOut: { start: number; end: number };
  maxBlur: number;
}

interface InfiniteGalleryProps {
  images: ImageItem[];
  speed?: number;
  visibleCount?: number;
  fadeSettings?: FadeSettings;
  blurSettings?: BlurSettings;
  className?: string;
  style?: React.CSSProperties;
}

interface PlaneData {
  index: number;
  z: number;
  imageIndex: number;
  x: number;
  y: number;
}

const DEFAULT_DEPTH_RANGE = 50;

/**
 * Frame shapes, cycled by plane index.
 *
 * Every source photo is a wide Unsplash crop, so deriving the plane size from
 * the texture — as the original does — makes all of them the same shape and the
 * field reads as a stack of identical rectangles. Each frame instead gets a
 * fixed aspect and scale, and the photo is cover-cropped into it in the shader.
 *
 * Cropping rather than stretching: scaling a landscape photo into a portrait
 * frame by changing the mesh dimensions squashes the people in it.
 *
 * The shape belongs to the frame, not to the photo, so a frame keeps its
 * proportions as images cycle through it instead of resizing mid-flight.
 */
const FRAME_PRESETS = [
  { aspect: 1.5, scale: 1.15 },
  { aspect: 0.72, scale: 1.0 },
  { aspect: 1.0, scale: 0.8 },
  { aspect: 1.78, scale: 1.35 },
  { aspect: 0.8, scale: 0.7 },
  { aspect: 1.33, scale: 0.95 },
  { aspect: 0.62, scale: 1.1 },
  { aspect: 1.2, scale: 0.72 },
];
const MAX_HORIZONTAL_OFFSET = 8;
const MAX_VERTICAL_OFFSET = 8;

/**
 * Cloth shader for the image planes.
 *
 * `texelSize` is a uniform rather than a `textureSize(map, 0)` call. That
 * built-in only exists in GLSL ES 3.00, and three compiles ShaderMaterial as
 * GLSL ES 1.00 unless `glslVersion: GLSL3` is set — so the original shader
 * fails to compile, and a shader that fails to compile shows up as silently
 * black planes plus a wall of console noise, not an obvious error.
 */
const createClothMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
      texelSize: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
      uvScale: { value: new THREE.Vector2(1, 1) },
      uvOffset: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;

        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;

        float flagWave = 0.0;
        if (isHovered > 0.5) {
          float wavePhase = pos.x * 3.0 + time * 8.0;
          float dampening = smoothstep(-0.5, 0.5, pos.x);
          flagWave = sin(wavePhase) * 0.1 * dampening;
          flagWave += sin(pos.x * 5.0 + time * 12.0) * 0.03 * dampening;
        }

        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      uniform vec2 texelSize;
      uniform vec2 uvScale;
      uniform vec2 uvOffset;
      varying vec2 vUv;

      void main() {
        // Cover-crop into the frame's own aspect, so the photo fills it without
        // being stretched.
        vec2 uv = vUv * uvScale + uvOffset;
        vec4 color = texture2D(map, uv);

        if (blurAmount > 0.0) {
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, uv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }

        color.rgb += vec3(abs(scrollForce) * 0.005);
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });

function ImagePlane({
  texture,
  position,
  scale,
  material,
  frameAspect,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  scale: [number, number, number];
  material: THREE.ShaderMaterial;
  frameAspect: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!material || !texture) return;
    material.uniforms.map.value = texture;

    const img = texture.image as { width?: number; height?: number } | undefined;
    if (!img?.width || !img?.height) return;
    material.uniforms.texelSize.value.set(1 / img.width, 1 / img.height);

    // Cover-fit: take the largest centred rectangle of the source that has the
    // frame's aspect. Wider source than frame means cropping the sides;
    // narrower means cropping top and bottom.
    const sourceAspect = img.width / img.height;
    const sx = sourceAspect > frameAspect ? frameAspect / sourceAspect : 1;
    const sy = sourceAspect > frameAspect ? 1 : sourceAspect / frameAspect;
    material.uniforms.uvScale.value.set(sx, sy);
    material.uniforms.uvOffset.value.set((1 - sx) / 2, (1 - sy) / 2);
  }, [material, texture, frameAspect]);

  useEffect(() => {
    if (material?.uniforms) {
      material.uniforms.isHovered.value = isHovered ? 1.0 : 0.0;
    }
  }, [material, isHovered]);

  return (
    <mesh
      position={position}
      scale={scale}
      material={material}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <planeGeometry args={[1, 1, 32, 32]} />
    </mesh>
  );
}

function GalleryScene({
  images,
  speed = 1,
  visibleCount = 10,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}: Omit<InfiniteGalleryProps, "className" | "style">) {
  // Velocity lives in a ref, not state.
  //
  // The original calls setScrollVelocity twice inside useFrame, which queues a
  // React re-render on every animation frame — 120 renders a second, each one
  // rebuilding the whole plane list, for a value only the render loop reads.
  const velocity = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // The canvas this scene is actually drawing into.
  //
  // The original does `document.querySelector('canvas')`, which takes the FIRST
  // canvas in the document. This site paints an ambient particle field into its
  // own canvas in the root layout, so that lookup binds the wheel handler to a
  // decorative background element and the gallery never responds.
  const glCanvas = useThree((state) => state.gl.domElement);

  const normalizedImages = useMemo(
    () => images.map((img) => (typeof img === "string" ? { src: img, alt: "" } : img)),
    [images]
  );

  const textures = useTexture(normalizedImages.map((img) => img.src));

  const materials = useMemo(
    () => Array.from({ length: visibleCount }, () => createClothMaterial()),
    [visibleCount]
  );

  // Shader materials hold GPU programs; without disposal they leak on unmount.
  useEffect(() => {
    return () => materials.forEach((m) => m.dispose());
  }, [materials]);

  const spatialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const horizontalAngle = (i * 2.618) % (Math.PI * 2);
      const verticalAngle = (i * 1.618 + Math.PI / 3) % (Math.PI * 2);
      const horizontalRadius = (i % 3) * 1.2;
      const verticalRadius = ((i + 1) % 4) * 0.8;
      positions.push({
        x: (Math.sin(horizontalAngle) * horizontalRadius * MAX_HORIZONTAL_OFFSET) / 3,
        y: (Math.cos(verticalAngle) * verticalRadius * MAX_VERTICAL_OFFSET) / 4,
      });
    }
    return positions;
  }, [visibleCount]);

  const totalImages = normalizedImages.length;
  const depthRange = DEFAULT_DEPTH_RANGE;

  const planesData = useRef<PlaneData[]>([]);
  if (planesData.current.length !== visibleCount) {
    planesData.current = Array.from({ length: visibleCount }, (_, i) => ({
      index: i,
      z: visibleCount > 0 ? ((depthRange / visibleCount) * i) % depthRange : 0,
      imageIndex: totalImages > 0 ? i % totalImages : 0,
      x: spatialPositions[i]?.x ?? 0,
      y: spatialPositions[i]?.y ?? 0,
    }));
  }

  const nudge = useCallback((amount: number) => {
    velocity.current += amount;
  }, []);

  useEffect(() => {
    if (!glCanvas) return;

    // While the pointer is over the canvas the wheel belongs to the gallery, so
    // the page underneath is held still. The listener has to be non-passive for
    // preventDefault to have any effect — a passive listener cannot cancel
    // scrolling, and the browser ignores the call without warning.
    //
    // Scoped to the canvas rather than the window, so moving the pointer off the
    // gallery hands scrolling straight back to the page.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      nudge(event.deltaY * 0.01 * speed);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") nudge(-2 * speed);
      else if (event.key === "ArrowDown" || event.key === "ArrowRight") nudge(2 * speed);
    };

    // Drag to scrub, which is the only direct control a touch device has.
    let dragging = false;
    let lastY = 0;
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      nudge((lastY - e.clientY) * 0.04 * speed);
      lastY = e.clientY;
    };
    const endDrag = () => {
      dragging = false;
    };

    glCanvas.addEventListener("wheel", onWheel, { passive: false });
    glCanvas.addEventListener("pointerdown", onPointerDown);
    glCanvas.addEventListener("pointermove", onPointerMove);
    glCanvas.addEventListener("pointerup", endDrag);
    glCanvas.addEventListener("pointerleave", endDrag);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      glCanvas.removeEventListener("wheel", onWheel);
      glCanvas.removeEventListener("pointerdown", onPointerDown);
      glCanvas.removeEventListener("pointermove", onPointerMove);
      glCanvas.removeEventListener("pointerup", endDrag);
      glCanvas.removeEventListener("pointerleave", endDrag);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [glCanvas, nudge, speed]);

  useFrame((state, delta) => {
    // No idle auto-play. It was pleasant in a demo that owns the screen, but on
    // a real page it means the gallery starts moving on its own a few seconds
    // after you stop touching it, including while you are reading something
    // else. The gallery moves when someone moves it.
    velocity.current *= 0.95;

    const time = state.clock.getElapsedTime();
    for (const material of materials) {
      if (!material?.uniforms) continue;
      material.uniforms.time.value = time;
      material.uniforms.scrollForce.value = velocity.current;
    }

    const imageAdvance = totalImages > 0 ? visibleCount % totalImages || totalImages : 0;
    const halfRange = depthRange / 2;
    const group = groupRef.current;

    planesData.current.forEach((plane, i) => {
      let newZ = plane.z + velocity.current * delta * 10;
      let wrapsForward = 0;
      let wrapsBackward = 0;

      if (newZ >= depthRange) {
        wrapsForward = Math.floor(newZ / depthRange);
        newZ -= depthRange * wrapsForward;
      } else if (newZ < 0) {
        wrapsBackward = Math.ceil(-newZ / depthRange);
        newZ += depthRange * wrapsBackward;
      }

      if (wrapsForward > 0 && imageAdvance > 0 && totalImages > 0) {
        plane.imageIndex = (plane.imageIndex + wrapsForward * imageAdvance) % totalImages;
      }
      if (wrapsBackward > 0 && imageAdvance > 0 && totalImages > 0) {
        const step = plane.imageIndex - wrapsBackward * imageAdvance;
        plane.imageIndex = ((step % totalImages) + totalImages) % totalImages;
      }

      plane.z = ((newZ % depthRange) + depthRange) % depthRange;

      // Depth is written straight onto the mesh rather than through React
      // state, so the loop never triggers a render.
      const mesh = group?.children[i];
      if (mesh) mesh.position.z = plane.z - halfRange;

      const t = plane.z / depthRange;
      let opacity = 1;
      if (t < fadeSettings.fadeIn.start) opacity = 0;
      else if (t <= fadeSettings.fadeIn.end) {
        opacity =
          (t - fadeSettings.fadeIn.start) /
          (fadeSettings.fadeIn.end - fadeSettings.fadeIn.start);
      } else if (t >= fadeSettings.fadeOut.start && t <= fadeSettings.fadeOut.end) {
        opacity =
          1 -
          (t - fadeSettings.fadeOut.start) /
            (fadeSettings.fadeOut.end - fadeSettings.fadeOut.start);
      } else if (t > fadeSettings.fadeOut.end) opacity = 0;

      let blur = 0;
      if (t < blurSettings.blurIn.start) blur = blurSettings.maxBlur;
      else if (t <= blurSettings.blurIn.end) {
        blur =
          blurSettings.maxBlur *
          (1 -
            (t - blurSettings.blurIn.start) /
              (blurSettings.blurIn.end - blurSettings.blurIn.start));
      } else if (t >= blurSettings.blurOut.start && t <= blurSettings.blurOut.end) {
        blur =
          blurSettings.maxBlur *
          ((t - blurSettings.blurOut.start) /
            (blurSettings.blurOut.end - blurSettings.blurOut.start));
      } else if (t > blurSettings.blurOut.end) blur = blurSettings.maxBlur;

      const material = materials[i];
      if (material?.uniforms) {
        material.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
        material.uniforms.blurAmount.value = Math.max(0, Math.min(blurSettings.maxBlur, blur));
      }
    });
  });

  if (normalizedImages.length === 0) return null;

  return (
    <group ref={groupRef}>
      {planesData.current.map((plane, i) => {
        const texture = Array.isArray(textures) ? textures[plane.imageIndex] : textures;
        const material = materials[i];
        if (!texture || !material) return null;

        const frame = FRAME_PRESETS[i % FRAME_PRESETS.length];
        const height = 2.2 * frame.scale;
        const scale: [number, number, number] = [height * frame.aspect, height, 1];

        return (
          <ImagePlane
            key={plane.index}
            texture={texture}
            position={[plane.x, plane.y, plane.z - depthRange / 2]}
            scale={scale}
            material={material}
            frameAspect={frame.aspect}
          />
        );
      })}
    </group>
  );
}

/** Shown when WebGL is unavailable, and while the textures are still loading. */
function FallbackGallery({ images }: { images: ImageItem[] }) {
  const normalized = images.map((img) =>
    typeof img === "string" ? { src: img, alt: "" } : img
  );

  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {normalized.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.src}
            alt={img.alt ?? ""}
            loading="lazy"
            className="w-full h-40 object-cover rounded-xl border border-white/10"
          />
        ))}
      </div>
    </div>
  );
}

export default function InfiniteGallery({
  images,
  speed = 1.2,
  visibleCount = 10,
  className = "h-96 w-full",
  style,
  fadeSettings = {
    fadeIn: { start: 0.05, end: 0.25 },
    fadeOut: { start: 0.4, end: 0.43 },
  },
  blurSettings = {
    blurIn: { start: 0.0, end: 0.1 },
    blurOut: { start: 0.4, end: 0.43 },
    maxBlur: 8.0,
  },
}: InfiniteGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className={className} style={style}>
      {/* `fallback` is R3F's own no-WebGL path.
          The hand-rolled probe this replaced created a second WebGL context to
          test support and then called loseContext() to release it — which took
          the renderer's context down with it. The symptom was a canvas that
          mounted, sized itself correctly and drew nothing, with a single
          "THREE.WebGLRenderer: Context Lost." in the log and no error anywhere. */}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        fallback={<FallbackGallery images={images} />}
      >
        {/* useTexture suspends until every image has decoded; without this the
            first frame throws instead of waiting. */}
        <Suspense fallback={null}>
          <GalleryScene
            images={images}
            speed={speed}
            visibleCount={visibleCount}
            fadeSettings={fadeSettings}
            blurSettings={blurSettings}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
