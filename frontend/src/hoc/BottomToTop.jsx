import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, easeOut } from "framer-motion";
import { ArrowUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BottomToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      lastY.current = window.scrollY;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          setIsVisible(lastY.current > 300);
          ticking.current = false;
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    shown: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.9 },
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: easeOut };

  return (
    <TooltipProvider delayDuration={150}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="back-to-top-wrap"
            initial="hidden"
            animate="shown"
            exit="exit"
            variants={variants}
            transition={transition}
            className="fixed bottom-6 right-6 z-50"
            style={{ willChange: "transform, opacity" }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={scrollToTop}
                  aria-label="Return to top"
                  className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-[box-shadow,transform] duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 active:translate-y-[1px]"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                align="center"
                sideOffset={8}
                avoidCollisions
                className="select-none"
              >
                Return to top
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default BottomToTop;
