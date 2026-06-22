export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0d0a1a]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 text-center">
        <p className="text-xs text-[#a0a0b0]">
          &copy; {new Date().getFullYear()} Chess for Kids. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
