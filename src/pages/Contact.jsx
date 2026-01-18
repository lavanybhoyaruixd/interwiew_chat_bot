import React from "react";

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white">
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Contact</h1>
        <p className="mt-4 text-white/70 max-w-3xl">
          Reach out to our team for support, partnerships, or press inquiries.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Support</h3>
            <p className="mt-2 text-sm text-white/60">support@hiremate.ai</p>
            <p className="text-sm text-white/60">Mon–Fri · 9:00–18:00</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Office</h3>
            <p className="mt-2 text-sm text-white/60">Bengaluru, India</p>
            <p className="text-sm text-white/60">+91 90000 00000</p>
          </div>
        </div>

        <form className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg bg-[#0f1524] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-lg bg-[#0f1524] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
          <textarea
            rows="5"
            placeholder="Your message"
            className="mt-4 w-full rounded-lg bg-[#0f1524] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
          />
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-5 py-2.5 transition"
          >
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
