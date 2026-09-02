"use client";

import * as React from "react";
import { HTMLMotionProps, MotionConfig, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hover slider: a list of titles on one side, the matching visual on the other.
 *
 * Two changes from the upstream component:
 *
 * 1. Imports from `framer-motion` rather than `motion/react`. They are the same
 *    library — `motion` is the newer package name — and framer-motion is
 *    already a dependency here. Adding the alias would mean a second copy of
 *    the same code in the bundle, and this project's npm peer resolution is
 *    already delicate enough.
 * 2. Selection is not hover-only. Hover does not exist on a phone, so the
 *    titles are real buttons that also respond to focus and tap; keyboard users
 *    can tab through them and the panel follows.
 */

interface TextStaggerHoverProps {
  text: string;
  index: number;
}

interface HoverSliderContextValue {
  activeSlide: number;
  changeSlide: (index: number) => void;
}

/**
 * Splits into words, each carrying its characters and the index that character
 * has in the whole string.
 *
 * Animating per character means every letter is its own inline-block, and the
 * browser will happily break a line between any two of them — titles came out
 * as "SOMEWH / ERE". Keeping each word in one nowrap box moves the break
 * opportunities back to the spaces, while the flat index keeps the stagger
 * running left to right across the whole title rather than restarting per word.
 */
function splitIntoWords(text: string) {
  let cursor = 0;
  return text.split(" ").map((word) => {
    const characters = word.split("").map((char) => ({ char, index: cursor++ }));
    // The space that followed this word occupies an index too, so the stagger
    // stays in step with the original per-character timing.
    cursor += 1;
    return characters;
  });
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | undefined>(undefined);

function useHoverSliderContext() {
  const context = React.useContext(HoverSliderContext);
  if (context === undefined) {
    throw new Error("useHoverSliderContext must be used within a HoverSlider");
  }
  return context;
}

export const HoverSlider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const [activeSlide, setActiveSlide] = React.useState<number>(0);
    const changeSlide = React.useCallback((index: number) => setActiveSlide(index), []);
    const value = React.useMemo(() => ({ activeSlide, changeSlide }), [activeSlide, changeSlide]);
    return (
      <HoverSliderContext.Provider value={value}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </HoverSliderContext.Provider>
    );
  }
);
HoverSlider.displayName = "HoverSlider";

/** Reads the active index, so a caller can render detail beside the slider. */
export function useActiveSlide() {
  return useHoverSliderContext().activeSlide;
}

export const TextStaggerHover = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & TextStaggerHoverProps
>(({ text, index, className, ...props }, ref) => {
  const { activeSlide, changeSlide } = useHoverSliderContext();
  const words = splitIntoWords(text);
  const isActive = activeSlide === index;
  const select = () => changeSlide(index);

  return (
    <button
      type="button"
      ref={ref}
      // Pointer, focus and tap all select. Focus matters as much as hover: the
      // list is the only way to reach the other slides with a keyboard.
      onMouseEnter={select}
      onFocus={select}
      onClick={select}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "relative inline-block origin-bottom overflow-hidden text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aws-orange focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded-lg",
        className
      )}
      {...props}
    >
      {words.map((characters, wordIndex) => (
        <React.Fragment key={wordIndex}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {characters.map(({ char, index: i }) => (
              <span key={i} className="relative inline-block overflow-hidden">
                <MotionConfig
                  transition={{
                    delay: i * 0.025,
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <motion.span
                    className="inline-block opacity-20"
                    initial={{ y: "0%" }}
                    animate={isActive ? { y: "-110%" } : { y: "0%" }}
                  >
                    {char}
                  </motion.span>

                  <motion.span
                    className="absolute left-0 top-0 inline-block opacity-100"
                    initial={{ y: "110%" }}
                    animate={isActive ? { y: "0%" } : { y: "110%" }}
                  >
                    {char}
                  </motion.span>
                </MotionConfig>
              </span>
            ))}
          </span>
        </React.Fragment>
      ))}
    </button>
  );
});
TextStaggerHover.displayName = "TextStaggerHover";

export const clipPathVariants = {
  visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
  hidden: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0px)" },
};

export const HoverSliderImageWrap = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid overflow-hidden [&>*]:col-start-1 [&>*]:col-end-1 [&>*]:row-start-1 [&>*]:row-end-1 [&>*]:size-full",
        className
      )}
      {...props}
    />
  );
});
HoverSliderImageWrap.displayName = "HoverSliderImageWrap";

export const HoverSliderImage = React.forwardRef<
  HTMLImageElement,
  HTMLMotionProps<"img"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext();
  return (
    <motion.img
      className={cn("inline-block align-middle", className)}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      animate={activeSlide === index ? "visible" : "hidden"}
      ref={ref}
      {...props}
    />
  );
});
HoverSliderImage.displayName = "HoverSliderImage";

/**
 * The same reveal, for a slide with no artwork to show.
 *
 * Three slides in the deck are pure typography — the title, the group activity
 * and the closing quote. A screenshot of those would just be text rendered as a
 * picture, so they get laid out as real markup instead and wipe in identically.
 */
export const HoverSliderPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, children, ...props }, ref) => {
  const { activeSlide } = useHoverSliderContext();
  return (
    <motion.div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      animate={activeSlide === index ? "visible" : "hidden"}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
});
HoverSliderPanel.displayName = "HoverSliderPanel";
