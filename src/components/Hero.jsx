import React from "react";

export default function Hero({ onGetStarted }) {
  return (
    <section id="hero" className="relative w-full overflow-hidden bg-[#f8f1e6]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(241,208,178,0.35), transparent 28%), radial-gradient(circle at 85% 30%, rgba(243,163,146,0.22), transparent 24%), radial-gradient(circle at 80% 80%, rgba(205,182,149,0.24), transparent 30%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid gap-12 items-center lg:grid-cols-[1.05fr_1fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-[#e8ddca] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#7d6e66]">
              Welcome to DaBreeder
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-[#5b4a45]">
              Where Smart Matching Meets
              <span className="block text-[#f2a392]">Wagging Tails</span>
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[#7c6a62] mx-auto lg:mx-0">
              Discover trusted breeding matches with confidence. DaBreeder helps responsible owners
              connect, review health history, and start safer conversations in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => onGetStarted && onGetStarted()}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-bold text-white bg-[linear-gradient(135deg,#f7b6aa,#f0a08f)] shadow-md shadow-[#d8998f]/40 hover:bg-[linear-gradient(135deg,#f4a899,#eb937f)] focus:outline-none focus:ring-4 focus:ring-[#f0c1b7]"
                aria-label="Start your breeding journey today"
              >
                <span aria-hidden>🐾</span>
                <span>Get Started</span>
              </button>

              <button
                type="button"
                onClick={() => onGetStarted && onGetStarted()}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-semibold text-[#685750] bg-[#fff8ef] border border-[#e8dbc7] hover:bg-[#f8efdf]"
              >
                Meet the Dogs
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#8f7f78] justify-center lg:justify-start">
              <div>
                <p className="font-extrabold text-[#de9382] text-lg leading-none">120+</p>
                <p>Registered Dogs</p>
              </div>
              <div>
                <p className="font-extrabold text-[#de9382] text-lg leading-none">50+</p>
                <p>Active Users</p>
              </div>
              <div>
                <p className="font-extrabold text-[#de9382] text-lg leading-none">4.9</p>
                <p>Average Rating</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[28px] bg-[#f5eadb] p-3 shadow-[0_18px_40px_rgba(110,86,68,0.18)]">
              <div className="relative overflow-hidden rounded-2xl border border-[#eadfce] bg-white">
                <img
                  src="/heroPup.jpg"
                  alt="Friendly dog waiting for a perfect match"
                  className="h-[280px] sm:h-[360px] w-full object-cover"
                />
              </div>
            </div>

            <div className="absolute -top-4 -right-3 rounded-xl bg-white px-3 py-2 shadow-md border border-[#f0e4d4]">
              <p className="text-[11px] uppercase tracking-wide text-[#9e8e86]">Dog Friendly</p>
              <p className="text-xs font-semibold text-[#63504a]">Always welcome</p>
            </div>

            <div className="absolute -bottom-4 left-4 rounded-xl bg-white px-3 py-2 shadow-md border border-[#f0e4d4]">
              <p className="text-[11px] uppercase tracking-wide text-[#9e8e86]">Fresh Matches</p>
              <p className="text-xs font-semibold text-[#63504a]">Updated daily</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
