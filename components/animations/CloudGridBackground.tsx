"use client";

import React from "react";

export function CloudGridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid-bg opacity-70" />

      {/* Radiant Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-aws-orange/10 rounded-full blur-[140px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-aws-blue/15 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-purple-900/10 rounded-full blur-[160px]" />
      <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-aws-cyan/10 rounded-full blur-[130px]" />

      {/* Top Gradient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060A14] via-transparent to-[#060A14] opacity-90" />
    </div>
  );
}
