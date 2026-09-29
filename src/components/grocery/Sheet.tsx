"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C } from "./theme";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** A bottom sheet that slides up over the list, like the fruit info card. */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(62,39,35,0.45)" }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full rounded-t-3xl flex flex-col"
            style={{
              background: C.cream,
              maxHeight: "88dvh",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1.5 rounded-full" style={{ background: C.earthLight }} />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 pt-1 pb-2">
                <h2 className="text-lg font-extrabold" style={{ color: C.brown }}>
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full text-sm font-bold"
                  style={{ background: C.line, color: C.earth }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-5 pb-2 flex-1" style={{ WebkitOverflowScrolling: "touch" }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
