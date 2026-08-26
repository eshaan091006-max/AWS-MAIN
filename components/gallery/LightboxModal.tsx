"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from "lucide-react";
import { GalleryImageData } from "@/lib/data/initialData";

interface LightboxModalProps {
  images: GalleryImageData[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({ images, currentIndex, onClose, onNavigate }: LightboxModalProps) {
  useEffect(() => {
    if (currentIndex === null) return;

    // Lock body scroll while lightbox is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        onNavigate(currentIndex - 1);
      }
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        e.preventDefault();
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const current = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/95 backdrop-blur-2xl select-none"
      onClick={onClose}
    >
      {/* Top Bar with Close Button */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[10000] flex items-center gap-3">
        <button
          type="button"
          aria-label="Close Lightbox"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-3 rounded-full bg-navy-900/90 hover:bg-aws-orange text-white hover:text-black border border-white/20 hover:border-aws-orange transition-all duration-200 shadow-2xl cursor-pointer hover:scale-110 active:scale-95"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Prev button */}
      {currentIndex > 0 && (
        <button
          type="button"
          aria-label="Previous Image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[10000] p-3 rounded-full bg-navy-900/90 hover:bg-aws-orange text-white hover:text-black border border-white/20 hover:border-aws-orange transition-all duration-200 shadow-2xl cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Next button */}
      {currentIndex < images.length - 1 && (
        <button
          type="button"
          aria-label="Next Image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[10000] p-3 rounded-full bg-navy-900/90 hover:bg-aws-orange text-white hover:text-black border border-white/20 hover:border-aws-orange transition-all duration-200 shadow-2xl cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Image & Details Container (Clicking inside does NOT close modal) */}
      <div
        className="max-w-5xl w-full flex flex-col items-center relative z-[9999]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[58vh] sm:h-[65vh] md:h-[72vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black/60">
          <Image
            src={current.imageUrl}
            alt={current.title}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        {/* Caption bar */}
        <div className="mt-4 w-full p-4 sm:p-5 rounded-2xl bg-navy-900/95 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left shadow-2xl backdrop-blur-xl">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{current.title}</h3>
            {current.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">{current.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 shrink-0">
            <span className="px-3 py-1 rounded-full bg-aws-orange/20 text-aws-orange border border-aws-orange/40 font-semibold flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              {current.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {current.date}
            </span>
            <span className="text-slate-400 font-bold">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
