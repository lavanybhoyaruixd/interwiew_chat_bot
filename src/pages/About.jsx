import React from "react";

export default function About() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About</h1>
        <p className="mt-4 text-white/70 max-w-3xl">
          HireMate is an AI-driven interview preparation platform built to help candidates practice better
          and receive high-quality feedback instantly.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Our Story</h3>
            <p className="mt-2 text-sm text-white/60">
              We started with a simple goal: make interview prep realistic and measurable. Today, HireMate
              supports job seekers across domains with AI-powered coaching.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">What makes us different</h3>
            <p className="mt-2 text-sm text-white/60">
              Practical simulations, instant feedback, and personalized insights—built to improve outcomes,
              not just confidence.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
