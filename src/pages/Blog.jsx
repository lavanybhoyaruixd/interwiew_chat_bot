import React from "react";

export default function Blog() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
        <p className="mt-4 text-white/70 max-w-3xl">
          Insights, guides, and updates on interviews, AI, and career growth.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "How to Structure STAR Answers", date: "Jan 2026" },
            { title: "Top 5 Interview Mistakes", date: "Dec 2025" },
            { title: "AI Feedback: What It Means", date: "Dec 2025" }
          ].map((post) => (
            <article key={post.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs text-white/50">{post.date}</div>
              <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm text-white/60">
                Short, practical tips to improve your interview performance and confidence.
              </p>
              <button className="mt-4 text-sm font-semibold text-white/90 hover:text-white transition">
                Read more →
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
