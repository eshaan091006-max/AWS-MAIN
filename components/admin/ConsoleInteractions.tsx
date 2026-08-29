"use client";

import { useEffect } from "react";

/**
 * Pointer-driven depth and panel lighting.
 *
 * Two effects, both driven from one listener:
 *
 *  - The 3D corridor's vanishing point follows the cursor. Moving
 *    perspective-origin rather than the planes' own transform means this
 *    composes with the drift animation instead of fighting it — the planes
 *    keep animating while the camera shifts.
 *
 *  - The panel under the cursor gets a soft light at that exact point.
 *
 * Everything is written as CSS custom properties, so React never re-renders on
 * pointer move, and the work is one rAF-throttled style write per frame at
 * most. A state update per mousemove would be an easy way to make a console
 * with a 122-row table feel broken.
 */
export function ConsoleInteractions() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".adm");
    if (!root) return;

    // Honour the OS setting: no camera drift for anyone who asked for stillness.
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Coarse pointers have no hover, so a cursor spotlight is meaningless and
    // the listener would only cost battery.
    const fine = window.matchMedia("(pointer: fine)");

    let frame = 0;
    let pending: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const e = pending;
      pending = null;
      if (!e) return;

      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      // The console's own toggle wins over the OS setting in both directions;
      // with neither set, the OS decides.
      const root2 = document.documentElement;
      const motionOn = root2.classList.contains("adm-motion-on");
      const motionOff = root2.classList.contains("adm-motion-off");
      const allowDrift = motionOn || (!motionOff && !stillness.matches);

      if (allowDrift) {
        // -1..1, then damped. Full range would swing the vanishing point far
        // enough to be motion sickness rather than depth.
        const px = (e.clientX / w - 0.5) * 2;
        const py = (e.clientY / h - 0.5) * 2;
        root.style.setProperty("--adm-px", px.toFixed(3));
        root.style.setProperty("--adm-py", py.toFixed(3));
      } else {
        // Park it centred rather than leaving whatever offset was last set.
        root.style.setProperty("--adm-px", "0");
        root.style.setProperty("--adm-py", "0");
      }

      const panel = (e.target as Element | null)?.closest?.(".adm-panel") as HTMLElement | null;
      if (panel) {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--adm-mx", `${e.clientX - r.left}px`);
        panel.style.setProperty("--adm-my", `${e.clientY - r.top}px`);
        // -1..1 from the panel's centre, for the lean.
        panel.style.setProperty("--adm-tx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        panel.style.setProperty("--adm-ty", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
        panel.dataset.lit = "true";
      }
    };

    const onMove = (e: PointerEvent) => {
      pending = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeavePanel = (e: PointerEvent) => {
      const panel = (e.target as Element | null)?.closest?.(".adm-panel") as HTMLElement | null;
      if (panel) delete panel.dataset.lit;
    };

    if (!fine.matches) return;

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeavePanel, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeavePanel);
    };
  }, []);

  return null;
}
