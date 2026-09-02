"use client";

import React, { useState } from "react";
import { Cloud, Server, HardDrive, Database, Shield, Zap, Globe, Cpu, Layers } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface OrbitService {
  name: string;
  code: string;
  slug: string;
  category: string;
  icon: any;
  angle: number;
  radius: number;
  color: string;
}

export function ServiceOrbit() {
  const [hoveredService, setHoveredService] = useState<OrbitService | null>(null);

  const services: OrbitService[] = [
    { name: "Amazon EC2", code: "EC2", slug: "ec2", category: "Compute", icon: Server, angle: 0, radius: 140, color: "#FFA826" },
    { name: "Amazon S3", code: "S3", slug: "s3", category: "Storage", icon: HardDrive, angle: 60, radius: 140, color: "#10B981" },
    { name: "AWS Lambda", code: "Lambda", slug: "lambda", category: "Serverless", icon: Zap, angle: 120, radius: 140, color: "#FF9900" },
    { name: "Amazon RDS", code: "RDS", slug: "rds-aurora", category: "Database", icon: Database, angle: 180, radius: 140, color: "#3B82F6" },
    { name: "Amazon VPC", code: "VPC", slug: "vpc", category: "Networking", icon: Globe, angle: 240, radius: 140, color: "#8B5CF6" },
    { name: "AWS IAM", code: "IAM", slug: "iam", category: "Security", icon: Shield, angle: 300, radius: 140, color: "#EF4444" },
    
    // Outer Orbit
    { name: "Amazon Bedrock", code: "Bedrock", slug: "bedrock-sagemaker", category: "AI & ML", icon: Cpu, angle: 30, radius: 210, color: "#EC4899" },
    { name: "Amazon DynamoDB", code: "DynamoDB", slug: "dynamodb", category: "NoSQL", icon: Layers, angle: 150, radius: 210, color: "#06B6D4" },
    { name: "Amazon ECS/EKS", code: "ECS", slug: "ecs-eks", category: "Containers", icon: Server, angle: 270, radius: 210, color: "#F59E0B" },
  ];

  return (
    <div className="relative w-full max-w-2xl h-[460px] mx-auto flex items-center justify-center select-none">
      {/* Background Radiance */}
      <div className="absolute w-72 h-72 rounded-full bg-aws-orange/10 blur-3xl pointer-events-none" />

      {/* Orbit Track 1 (Inner) */}
      <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-aws-orange/20 animate-spin-slow pointer-events-none" />

      {/* Orbit Track 2 (Outer) */}
      <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-white/10 animate-spin-reverse pointer-events-none" />

      {/* Central Core AWS Cloud Node */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="relative z-20 w-24 h-24 rounded-xl bg-gradient-to-br from-aws-orange to-amber-600 flex flex-col items-center justify-center shadow-xl shadow-aws-orange/30 border-2 border-amber-300/40 cursor-pointer"
      >
        <Cloud className="w-10 h-10 text-navy-950 stroke-[2.2]" />
        <span className="text-[11px] font-mono font-bold text-navy-950 uppercase tracking-tight mt-0.5">
          AWS Core
        </span>
      </motion.div>

      {/* Orbiting Service Badges */}
      {services.map((service, index) => {
        const Icon = service.icon;
        const rad = (service.angle * Math.PI) / 180;
        const x = Math.cos(rad) * service.radius;
        const y = Math.sin(rad) * service.radius;

        return (
          <motion.div
            key={service.slug + index}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            whileHover={{ scale: 1.25, zIndex: 50 }}
            onMouseEnter={() => setHoveredService(service)}
            onMouseLeave={() => setHoveredService(null)}
            className="absolute z-10"
          >
            <div
              className="group flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-navy-900/90 border border-white/15 hover:border-aws-orange shadow-lg hover:shadow-aws-orange/20 transition-all cursor-pointer backdrop-blur-md"
            >
              <Icon className="w-5 h-5 text-slate-300 group-hover:text-aws-orange transition-colors" />
              <span className="text-[9px] font-mono text-slate-400 group-hover:text-white font-medium">
                {service.code}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Live Tooltip / Card for Hovered Service */}
      {hoveredService && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-2 z-40 px-4 py-2 rounded-xl bg-navy-950/95 border border-aws-orange/40 backdrop-blur-xl shadow-2xl text-center min-w-[200px]"
        >
          <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredService.color }} />
            {hoveredService.name}
          </div>
          <div className="text-[11px] text-aws-orange font-mono">{hoveredService.category} • Click to learn</div>
        </motion.div>
      )}
    </div>
  );
}
