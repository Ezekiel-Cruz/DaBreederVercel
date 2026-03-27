import React, { useState } from "react";
import AuthModal from "./AuthModal";

const steps = [
  {
    title: "Sign Up Free",
    text: "Create your account in under 2 minutes. Add your basic info and tell us about your breeding experience.",
    time: "2 minutes",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    title: "Add Your Dog",
    text: "Upload photos and create a detailed profile. Include breed, age, health records, and personality traits.",
    time: "10 minutes",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    title: "Get Matches",
    text: "See potential breeding partners instantly. Our system gives you real-time compatibility scores.",
    time: "Instant",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    ),
  },
  {
    title: "Start Conversations",
    text: "Message other breeders directly. Share additional photos, discuss health testing, and arrange safe meetups.",
    time: "Your pace",
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signup");

  return (
    <section id="how" className="py-24 bg-[#f8f1e6]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#5b4a45] mb-6">
            Getting Started is Easy
          </h2>
          <div className="w-20 h-1 rounded-full bg-gradient-to-r from-[#f4b3a4] to-[#ddb998] mx-auto mb-8"></div>
          <p className="text-lg sm:text-xl text-[#7c6a62] max-w-3xl mx-auto leading-relaxed">
            From signup to first conversation in less than 15 minutes
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-[#fff8ef] rounded-full border border-[#ead8c2]">
            <svg
              className="w-5 h-5 text-[#c98a76] mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-[#7e685d] font-semibold">100% Free to Start</span>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-[#f0cdb2] to-[#e7b6a3] transform translate-x-6"></div>
              )}

              <div className="text-center group bg-[#fff9f1] rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#ecdcc8] hover:-translate-y-1">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#f8ddc7] to-[#f4c4b6] rounded-3xl flex items-center justify-center text-[#7f5f52] group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#f1aa97] to-[#d8a37f] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-[#f8eddf] text-[#7e685d] text-xs font-semibold rounded-full border border-[#ead8c2]">
                    {step.time}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#5b4a45] mb-4">{step.title}</h3>
                <p className="text-[#7c6a62] leading-relaxed text-sm">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => {
              setAuthMode("signup");
              setShowAuthModal(true);
            }}
            className="inline-flex items-center px-8 py-4 bg-[linear-gradient(135deg,#f7b6aa,#f0a08f)] text-white font-bold rounded-full hover:bg-[linear-gradient(135deg,#f4a899,#eb937f)] transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
            Start Step 1 Now
          </button>
        </div>

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitch={(m) => {
            setAuthMode(m);
            setShowAuthModal(true);
          }}
          onAuthSuccess={() => {
            setShowAuthModal(false);
            // Redirect to dashboard or dog adding page
          }}
        />
      </div>
    </section>
  );
}
