export default function StatCard({
  children,
  title,
  subtitle,
  iconColor,
  glow
}) {
  return (
    <div className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
      <div className="relative rounded-3xl p-8 bg-gradient-to-br from-[#0b1220]/95 to-[#121a2b]/95 
        backdrop-blur-xl border border-white/10 transition-all duration-500
        hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_30px_80px_-35px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      
        <div className="relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconColor} 
            flex items-center justify-center shadow-lg ${glow} mb-6 ring-1 ring-white/10`}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="text-5xl font-bold text-white font-[Space_Grotesk] mb-2 tracking-tight">
            {children}
          </div>
          <h3 className="text-lg font-semibold text-white/95">{title}</h3>
          <p className="text-sm text-slate-400/90 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
