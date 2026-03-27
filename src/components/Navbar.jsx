import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css"; // warm dog-lover theme

export default function Navbar({ onMenuClick, onSignInClick, onSignUpClick, user }) {
  const guestTabClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wide transition-colors ${
      isActive ? "text-[#5b4a45]" : "text-[#7d6e66] hover:text-[#5b4a45]"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#f7efe4]/90 border-b border-[#eadfce]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {!user && (
            <Link
              to="/"
              className="font-extrabold text-xl sm:text-2xl text-[#6f5853] hover:opacity-80 transition-opacity shrink-0"
            >
              <span className="mr-2" aria-hidden>
                🐾
              </span>
              <span>DaBreeder</span>
            </Link>
          )}

          {user && (
            <button
              aria-label="Open menu"
              className="p-2 rounded-md hover:bg-[#f4e9d8] text-[#6f5853]"
              onClick={() => onMenuClick && onMenuClick()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M3.75 5.25A.75.75 0 0 1 4.5 4.5h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 7.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 6.75a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {!user && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
            <NavLink to="/" className={guestTabClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={guestTabClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={guestTabClass}>
              Contact
            </NavLink>
          </div>
        )}

        {user && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              to="/my-dog"
              className="font-extrabold text-xl sm:text-2xl text-[#6f5853] hover:opacity-80 transition-opacity"
            >
              <span className="mr-2" aria-hidden>
                🐾
              </span>
              <span>DaBreeder</span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {!user ? (
            <>
              <button
                onClick={onSignInClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[#6f5853] bg-[#fffaf2] border border-[#e8dbc7] hover:bg-[#f8eddc] shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={onSignUpClick}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#f9b3a7] to-[#f3a090] hover:from-[#f6a89a] hover:to-[#ef9585] shadow-md"
              >
                Sign Up
              </button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
