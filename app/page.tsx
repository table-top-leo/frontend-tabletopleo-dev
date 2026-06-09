function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 shadow-2xl shadow-black/80">
          
          {/* Top Accent Line */}
          <div className="w-12 h-[3px] bg-white mx-auto mb-8 rounded-full" />

          {/* Title */}
          <h1 className="text-6xl font-bold text-white tracking-[-2px] text-center leading-none mb-3">
            Table Top Leo
          </h1>

          <p className="text-center text-white/60 text-sm tracking-[3px] font-medium mb-10">
            DEVELOPMENT STARTED
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

          {/* Description */}
          <p className="text-white/70 text-center leading-relaxed text-[17px]">
            Welcome to the official development environment.<br />
            Project setup completed successfully.<br />
            Development is now in progress.
          </p>

          {/* Button */}
          <div className="mt-12">
            <button className="w-full bg-white text-black font-semibold py-4 rounded-2xl text-lg tracking-wider hover:bg-white/90 active:scale-[0.985] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg">
              PROJECT INITIALIZED 
              <span className="text-xl">✓</span>
            </button>
          </div>

          {/* Bottom Text */}
          <p className="text-center text-white/30 text-xs tracking-widest mt-10">
            PREMIUM • MINIMAL • READY
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;