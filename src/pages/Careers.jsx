import React from "react";

export default function Careers() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Careers</h1>
        <p className="mt-4 text-white/70 max-w-3xl">
          Join a team building the future of interview preparation. We value curiosity, ownership, and impact.
        </p>

        <div className="mt-10 space-y-4">
          {[
            { title: "Frontend Engineer", location: "Remote · Full-time" },
            { title: "AI/ML Engineer", location: "Remote · Full-time" },
            { title: "Product Designer", location: "Hybrid · Bengaluru" }
          ].map((role) => (
            <div key={role.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
              <div>
                <div className="text-lg font-semibold">{role.title}</div>
                <div className="text-sm text-white/60">{role.location}</div>
              </div>
              <button className="text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full transition">
                View role
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
