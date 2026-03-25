"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/app/lib/motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
