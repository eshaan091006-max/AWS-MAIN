/** Height of the fixed navbar, so a section never lands underneath it. */
const HEADER_OFFSET = 104;
const DEFAULT_DURATION = 850;

/** How long the arriving section stays highlighted, in ms. */
const ARRIVAL_MS = 1100;

let activeAnimation: number | null = null;
let detachAbort: (() => void) | null = null;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cancelActive() {
  if (activeAnimation !== null) cancelAnimationFrame(activeAnimation);
  activeAnimation = null;
  detachAbort?.();
  detachAbort = null;
}

/**
 * Eased scroll to a section, with an arrival cue.
 *
 * Written as a rAF loop rather than `scrollTo({ behavior: "smooth" })` for two
 * reasons: the native version gives no control over duration or easing, and it
 * is switched off entirely by the CSS `scroll-behavior` rule this file
 * temporarily suspends — so on a machine with reduced motion enabled the nav
 * links simply teleported, with no animation to speak of.
 *
 * Any wheel, touch or key input aborts it immediately. A scroll animation that
 * fights the person trying to scroll out of it is worse than no animation: it
 * feels like the page has stopped responding.
 */
export function scrollToSection(
  id: string,
  { duration = DEFAULT_DURATION, offset = HEADER_OFFSET } = {}
): boolean {
  if (typeof window === "undefined") return false;

  const target = document.getElementById(id);
  if (!target) return false;

  cancelActive();

  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(maxY, target.getBoundingClientRect().top + startY - offset));
  const distance = endY - startY;

  markArrival(target);

  // Already there — nothing to animate, but still flag arrival so clicking the
  // current section gives some acknowledgement.
  if (Math.abs(distance) < 2) return true;

  // The CSS rule would otherwise try to smooth every per-frame jump this loop
  // makes, which lands somewhere between sluggish and stuck.
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const abort = () => cancelActive();
  window.addEventListener("wheel", abort, { passive: true, once: true });
  window.addEventListener("touchstart", abort, { passive: true, once: true });
  window.addEventListener("keydown", abort, { once: true });

  detachAbort = () => {
    window.removeEventListener("wheel", abort);
    window.removeEventListener("touchstart", abort);
    window.removeEventListener("keydown", abort);
    root.style.scrollBehavior = previousBehavior;
  };

  const startedAt = performance.now();

  const step = (now: number) => {
    const elapsed = now - startedAt;
    const progress = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));

    if (progress < 1) {
      activeAnimation = requestAnimationFrame(step);
    } else {
      activeAnimation = null;
      detachAbort?.();
      detachAbort = null;
    }
  };

  activeAnimation = requestAnimationFrame(step);
  return true;
}

/**
 * Briefly flags the section so it can announce itself on arrival.
 *
 * An attribute rather than a class, so the styling lives entirely in CSS and
 * nothing here needs to know what the cue looks like.
 */
function markArrival(target: HTMLElement) {
  target.setAttribute("data-arriving", "true");
  window.setTimeout(() => target.removeAttribute("data-arriving"), ARRIVAL_MS);
}

/**
 * Handles landing on a page that already carries a hash — the case where a nav
 * link was followed from a different page, so the browser has jumped straight
 * to the anchor before any of this runs.
 *
 * Starts from slightly above the target and eases in, so the arrival still
 * reads as a movement rather than the page simply being there.
 */
export function scrollToHashOnLoad(offset = HEADER_OFFSET) {
  if (typeof window === "undefined") return;
  const id = window.location.hash.slice(1);
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset - 120));
  root.style.scrollBehavior = previousBehavior;

  requestAnimationFrame(() => scrollToSection(id, { duration: 700, offset }));
}
