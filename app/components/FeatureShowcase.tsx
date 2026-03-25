"use client";
import { motion } from "framer-motion";
import { fadeUp, entranceTransition } from "@/app/lib/motion";
import SplitCard from "./features/SplitCard";
import MergeCard from "./features/MergeCard";
import ConvertCard from "./features/ConvertCard";
import CompressCard from "./features/CompressCard";
import PrivacyCard from "./features/PrivacyCard";
import WorkflowCard from "./features/WorkflowCard";

const cards = [
  SplitCard,
  MergeCard,
  ConvertCard,
  CompressCard,
  PrivacyCard,
  WorkflowCard,
];

export default function FeatureShowcase() {
  return (
    <section className="mt-16 sm:mt-20 mb-8">
      <div className="text-center mb-10">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          style={{ color: "var(--text-primary)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ ...entranceTransition, delay: 0.1 }}
        >
          Everything You Need
        </motion.h2>
        <motion.p
          className="text-sm sm:text-base max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ ...entranceTransition, delay: 0.2 }}
        >
          Powerful PDF tools that run entirely in your browser. No uploads, no
          accounts, no limits.
        </motion.p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {cards.map((Card, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ ...entranceTransition, delay: 0.15 + i * 0.08 }}
          >
            <Card />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
