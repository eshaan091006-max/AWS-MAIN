"use client";

import React, { useState } from "react";
import {
  Shield,
  Crown,
  ArrowDown,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";
import { teamHierarchy } from "@/config/teamHierarchy";

export function OrganizationalTree() {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const { faculty, chairperson, departments } = teamHierarchy;

  return (
    <div className="relative w-full">
      {/* Main Tree Container */}
      <div className="w-full flex flex-col items-center">
        {/* ================= LEVEL 1: FACULTY IN CHARGE ================= */}
        <div className="flex flex-col items-center">
          <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/90 border-2 border-amber-500/30 backdrop-blur-xl shadow-2xl text-center min-w-[280px] sm:min-w-[340px] relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
              <Shield className="w-3 h-3" />
              <span>{faculty.title}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {faculty.members.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border bg-navy-950/80 border-white/5"
                >
                  <div className="text-xs sm:text-sm font-bold text-white tracking-tight">{fac.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">{fac.designation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Stem 1: Faculty -> Chairperson */}
          <div className="flex flex-col items-center text-aws-orange my-1">
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500 to-aws-orange" />
            <ArrowDown className="w-4 h-4 -mt-1 text-aws-orange" />
          </div>
        </div>

        {/* ================= LEVEL 2: CHAIRPERSON ================= */}
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-5 sm:p-6 rounded-3xl backdrop-blur-2xl text-center min-w-[300px] sm:min-w-[380px] border-2 shadow-2xl transition-all relative bg-gradient-to-b from-navy-900 to-navy-950 border-aws-orange/50 shadow-aws-orange/10"
          >
            {/* Glowing Accent */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-aws-orange/15 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black bg-gradient-to-r from-aws-orange to-amber-500 text-black shadow-md mb-2">
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>{chairperson.title}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {chairperson.name}
            </h3>

            <div className="text-xs font-mono text-aws-orange-light mt-0.5 flex items-center justify-center gap-1.5">
              <span>SXC AWS Community Lead</span>
              <span>•</span>
              <span className="text-[10px] text-emerald-400">Active</span>
            </div>
          </motion.div>

          {/* Connection Stem 2: Chairperson -> Horizontal Branch Bus */}
          <div className="w-0.5 h-8 bg-gradient-to-b from-aws-orange to-white/30" />
        </div>

        {/* ================= LEVEL 3: 4 DEPARTMENTS HIERARCHY TREE ================= */}
        <div className="w-full relative">
          {/* Desktop Horizontal Connecting Bus Line */}
          <div className="hidden lg:block relative w-full mb-6">
            <div className="mx-auto w-[76%] h-0.5 bg-gradient-to-r from-transparent via-aws-orange to-transparent opacity-80" />

            {/* 4 Vertical drop lines from the bus */}
            <div className="w-full grid grid-cols-4 px-4">
              <div className="flex justify-center"><div className="w-0.5 h-6 bg-aws-orange/60" /></div>
              <div className="flex justify-center"><div className="w-0.5 h-6 bg-aws-orange/60" /></div>
              <div className="flex justify-center"><div className="w-0.5 h-6 bg-aws-orange/60" /></div>
              <div className="flex justify-center"><div className="w-0.5 h-6 bg-aws-orange/60" /></div>
            </div>
          </div>

          {/* Department Columns Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 w-full">
            {departments.map((dept, index) => {
              const isHovered = hoveredDept === dept.id;
              const isDimmed = hoveredDept !== null && !isHovered;

              return (
                <div
                  key={dept.id}
                  onMouseEnter={() => setHoveredDept(dept.id)}
                  onMouseLeave={() => setHoveredDept(null)}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    isDimmed ? "opacity-40 scale-98" : "opacity-100 scale-100"
                  }`}
                >
                  {/* Department Container Card */}
                  <div
                    className={`w-full rounded-3xl p-5 sm:p-6 bg-navy-900/80 border transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative overflow-hidden ${
                      isHovered
                        ? "border-aws-orange shadow-aws-orange/20 bg-navy-900"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Header: Department Title */}
                    <div className="pb-3 border-b border-white/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${dept.badgeColor}`}>
                          {dept.code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">DEPT 0{index + 1}</span>
                      </div>
                      <h4 className="text-base font-extrabold text-white leading-snug">
                        {dept.name}
                      </h4>
                    </div>

                    {/* VCP Node(s) Structure (Without extra header text) */}
                    <div className="py-3 flex flex-col items-center">
                      {/* Single VCP vs 2 VCPs (Marketing) */}
                      {dept.vcps.length === 1 ? (
                        /* Standard 1 VCP Node */
                        <div className="w-full flex flex-col items-center">
                          <div className="w-full p-3 rounded-2xl border text-center bg-navy-950/90 border-aws-orange/40 shadow-md">
                            <div className="text-[9px] font-mono uppercase text-aws-orange font-bold">VCP</div>
                            <div className="text-sm font-bold text-white mt-0.5">{dept.vcps[0].name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{dept.vcps[0].role.split("—")[1]?.trim() || dept.name}</div>
                          </div>

                          {/* Connecting stem from VCP to Coordinators */}
                          <div className="w-0.5 h-4 bg-aws-orange/50 my-1" />

                          {/* Coordinator Nodes (ABC, XYZ) */}
                          <div className="w-full pt-1">
                            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5 text-center">
                              Coordinators
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {dept.vcps[0].coordinators?.map((coord, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="p-2.5 rounded-xl border text-center bg-navy-950/60 border-white/10"
                                >
                                  <div className="text-[9px] font-mono text-slate-400">Coord.</div>
                                  <div className="text-xs font-semibold text-slate-200">{coord}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Marketing Department: 2 VCPs Side-by-Side */
                        <div className="w-full flex flex-col items-center">
                          <div className="grid grid-cols-2 gap-2 w-full">
                            {dept.vcps.map((vcp, vIdx) => (
                              <div
                                key={vIdx}
                                className="p-2.5 rounded-2xl border text-center bg-navy-950/90 border-aws-orange/40 shadow-md"
                              >
                                <div className="text-[9px] font-mono uppercase text-aws-orange font-bold">VCP</div>
                                <div className="text-xs font-bold text-white truncate mt-0.5">{vcp.name}</div>
                                <div className="text-[9px] text-slate-400 font-mono truncate">Marketing</div>
                              </div>
                            ))}
                          </div>

                          {/* Unified connecting stem from both VCPs */}
                          <div className="flex flex-col items-center my-1">
                            <div className="w-20 h-0.5 bg-aws-orange/40" />
                            <div className="w-0.5 h-3 bg-aws-orange/50" />
                          </div>

                          {/* 3 Marketing Coordinators (ABC, PQR, XYZ) */}
                          <div className="w-full pt-1">
                            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5 text-center">
                              Coordinators
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {dept.coordinators?.map((coord, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="p-2 rounded-xl border text-center bg-navy-950/60 border-white/10"
                                >
                                  <div className="text-[8px] font-mono text-slate-400">Coord.</div>
                                  <div className="text-xs font-semibold text-slate-200 truncate">{coord}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Roles & Responsibilities Section directly inside the Card (3-4 lines) */}
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-aws-orange font-semibold flex items-center gap-1">
                        <ListChecks className="w-3 h-3" />
                        <span>Key Responsibilities</span>
                      </div>
                      <div className="space-y-1 text-left">
                        {dept.responsibilities.slice(0, 4).map((resp, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug">
                            <CheckCircle2 className="w-3 h-3 text-aws-orange shrink-0 mt-0.5" />
                            <span>{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
