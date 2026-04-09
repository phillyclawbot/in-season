"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Fruit } from "@/data/fruits";
import FruitCard from "./FruitCard";

interface CardStackProps {
  fruits: Fruit[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onCardTap: () => void;
}

export default function CardStack({ fruits, currentIndex, onIndexChange, onCardTap }: CardStackProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const nextScale = useTransform(x, [-200, 0, 200], [1, 0.95, 1]);
  const nextOpacity = useTransform(x, [-200, 0, 200], [1, 0.8, 1]);

  const goTo = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < fruits.length) {
        onIndexChange(newIndex);
      }
    },
    [fruits.length, onIndexChange]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 100;
      const velocityThreshold = 500;
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset < -threshold || velocity < -velocityThreshold) {
        // Swipe left = next
        animate(x, -400, { type: "spring", stiffness: 300, damping: 30 }).then(() => {
          x.set(0);
          goTo(currentIndex + 1);
        });
      } else if (offset > threshold || velocity > velocityThreshold) {
        // Swipe right = previous
        animate(x, 400, { type: "spring", stiffness: 300, damping: 30 }).then(() => {
          x.set(0);
          goTo(currentIndex - 1);
        });
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    },
    [x, currentIndex, goTo]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(currentIndex + 1);
      if (e.key === "ArrowRight") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, goTo]);

  const current = fruits[currentIndex];
  const next = fruits[currentIndex + 1];
  const prev = fruits[currentIndex > 0 ? currentIndex - 1 : fruits.length - 1];

  if (!current) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Next card (behind) */}
      {next && (
        <motion.div
          className="absolute w-[calc(100%-32px)] max-w-[380px] h-[calc(100%-32px)] max-h-[680px]"
          style={{ scale: nextScale, opacity: nextOpacity }}
        >
          <FruitCard fruit={next} />
        </motion.div>
      )}

      {/* Current card (front, draggable) */}
      <motion.div
        className="absolute w-[calc(100%-32px)] max-w-[380px] h-[calc(100%-32px)] max-h-[680px] z-10 cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
      >
        <FruitCard fruit={current} onTap={onCardTap} />
      </motion.div>
    </div>
  );
}
