import React from "react";

export default function Company() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Company
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">
            We build AI-first tools that help candidates prepare, practice, and perform with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Mission</h3>
            <p className="mt-2 text-sm text-white/60">
              Deliver smart, accessible interview practice that shortens the path to hiring success.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Vision</h3>
            <p className="mt-2 text-sm text-white/60">
              Make world-class interview coaching available to every candidate, everywhere.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Values</h3>
            <p className="mt-2 text-sm text-white/60">
              Clarity, fairness, and measurable impact for both candidates and employers.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
          <h2 className="text-2xl font-semibold">What we do</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            HireMate combines AI interview simulations, instant feedback, and tailored question generation
            to help users practice realistically and improve faster. Our tools are designed for outcomes—
            helping candidates land roles with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}
