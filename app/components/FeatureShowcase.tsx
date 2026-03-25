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
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Everything You Need
        </h2>
        <p
          className="text-sm sm:text-base max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Powerful PDF tools that run entirely in your browser. No uploads, no accounts, no limits.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <SplitCard />
        </div>
        <div>
          <MergeCard />
        </div>
        <div>
          <ConvertCard />
        </div>
        <div>
          <CompressCard />
        </div>
        <div>
          <PrivacyCard />
        </div>
        <div>
          <WorkflowCard />
        </div>
      </div>
    </section>
  );
}
