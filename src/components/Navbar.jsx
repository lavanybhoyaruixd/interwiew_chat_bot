export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-center px-8 py-4 bg-transparent">
      {/* Center: Nav Links */}
      <div className="flex gap-8 px-8 py-2 rounded-full glassmorphism shadow-lg">
        <a href="#" className="text-accent font-semibold">About</a>
        <a href="#" className="text-white font-semibold">Articles</a>
        <a href="#" className="text-white font-semibold">Projects</a>
        <a href="#" className="text-white font-semibold">Speaking</a>
        <a href="#" className="text-white font-semibold">Uses</a>
      </div>
    </nav>
  );
} 