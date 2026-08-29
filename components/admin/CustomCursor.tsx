"use client";

import { useEffect } from "react";

/**
 * A reticle cursor for the console.
 *
 * Two parts: a dot pinned to the pointer, and a ring that trails it. The lag is
 * what makes it feel like an instrument rather than a repainted arrow.
 *
 * Only ever replaces the cursor on a fine pointer. On touch there is no cursor
 * to replace, and hiding the system one there would be pure loss.
 *
 * The native cursor is kept for text inputs and left visible over them, because
 * a reticle gives you no idea where a caret will land.
 */
export function CustomCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = document.createElement("div");
    dot.className = "adm-cursor-dot";
    const ring = document.createElement("div");
    ring.className = "adm-cursor-ring";
    document.body.append(dot, ring);
    document.documentElement.classList.add("adm-has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // The ring reports what is under the pointer, so the cursor itself tells
      // you whether something is clickable.
      const el = e.target as Element | null;
      const interactive = el?.closest?.(
        "button, a, input, select, textarea, [role='button']"
      );
      ring.dataset.over = interactive ? "control" : "";
      ring.dataset.text = el?.closest?.("input, textarea") ? "true" : "";
    };

    // The ring eases toward the dot; the dot is exact.
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    const onDown = () => ring.setAttribute("data-down", "true");
    const onUp = () => ring.removeAttribute("data-down");
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "";
      ring.style.opacity = "";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      dot.remove();
      ring.remove();
      document.documentElement.classList.remove("adm-has-cursor");
    };
  }, []);

  return null;
}
