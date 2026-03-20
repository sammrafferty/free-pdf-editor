"use client";
import SplitCard from "./features/SplitCard";
import MergeCard from "./features/MergeCard";
import ConvertCard from "./features/ConvertCard";
import CompressCard from "./features/CompressCard";
import PrivacyCard from "./features/PrivacyCard";
import WorkflowCard from "./features/WorkflowCard";

export default function FeatureShowcase() {
  return (
    <section className="mt-16 sm:mt-20 mb-8">
      <div className="text-center mb-10">
        <h2
          className="hero-animate text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          style={{ color: "var(--text-primary)", animationDelay: "0.1s" }}
        >
          Everything You Need
        </h2>
        <p
          className="hero-animate text-sm sm:text-base max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)", animationDelay: "0.2s" }}
        >
          Powerful PDF tools that run entirely in your browser. No uploads, no accounts, no limits.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="hero-animate" style={{ animationDelay: "0.3s" }}>
          <SplitCard />
        </div>
        <div className="hero-animate" style={{ animationDelay: "0.35s" }}>
          <MergeCard />
        </div>
        <div className="hero-animate" style={{ animationDelay: "0.4s" }}>
          <ConvertCard />
        </div>
        <div className="hero-animate" style={{ animationDelay: "0.45s" }}>
          <CompressCard />
        </div>
        <div className="hero-animate" style={{ animationDelay: "0.5s" }}>
          <PrivacyCard />
        </div>
        <div className="hero-animate" style={{ animationDelay: "0.55s" }}>
          <WorkflowCard />
        </div>
      </div>
    </section>
  );
}
