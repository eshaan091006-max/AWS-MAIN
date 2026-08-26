import React from "react";
import Link from "next/link";
import { Cloud, ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 pt-28 pb-20">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-navy-900/80 border border-aws-orange/30 backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-aws-orange/15 border border-aws-orange/30 flex items-center justify-center mx-auto text-aws-orange shadow-lg shadow-aws-orange/10">
          <Cloud className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-aws-orange uppercase tracking-widest">
            404 • Resource Not Found
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Lost in the Cloud?
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            The cloud architecture node or page you are attempting to reach does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-aws-orange hover:bg-aws-orange-light text-black font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-md"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all flex items-center gap-2"
          >
            <Compass className="w-3.5 h-3.5 text-aws-orange" />
            <span>Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
