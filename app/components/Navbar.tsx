"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { ThemeToggle } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ease } from "@/app/lib/motion";

interface NavbarProps {
  onLogoClick?: () => void;
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-expand hint on first visit to teach the interaction
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);

    const hinted = sessionStorage.getItem("nav-hinted");
    if (!hinted) {
      setIsHinting(true);
      setIsExpanded(true);
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setIsHinting(false);
        sessionStorage.setItem("nav-hinted", "1");
      }, 2800);
      return () => {
        clearTimeout(timer);
        mq.removeEventListener("change", handler);
      };
    }

    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setIsExpanded((prev) => !prev);
    }
  };

  const logoContent = (
    <div className="navbar-logo-wrap">
      <Logo size={44} />
      <motion.span
        className="navbar-brand"
        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
        transition={{ duration: 0.35, ease }}
      >
        Free PDF Editor
      </motion.span>
    </div>
  );

  return (
    <header
      className={`navbar-float ${isExpanded ? "navbar-open" : ""} ${isHinting ? "navbar-hinting" : ""}`}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && !isHinting && setIsExpanded(false)}
    >
      <div className="navbar-pill">
        {/* Logo area */}
        {onLogoClick ? (
          <button
            onClick={(e) => {
              if (isMobile) {
                handleToggle();
              } else {
                onLogoClick();
              }
              e.currentTarget.blur();
            }}
            className="navbar-logo-btn"
            aria-label="Scroll to top"
          >
            {logoContent}
          </button>
        ) : (
          <div className="navbar-logo-clickable">
            <Link href="/" className="navbar-logo-btn" aria-label="Home">
              {logoContent}
            </Link>
            {isMobile && (
              <button
                onClick={handleToggle}
                className="navbar-mobile-trigger"
                aria-label="Toggle menu"
              >
                <div className={`navbar-burger ${isExpanded ? "navbar-burger-open" : ""}`}>
                  <span /><span /><span />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Hint dots — visible when collapsed, pulse to signal expandability */}
        <div className="navbar-hint-dots" aria-hidden="true">
          <motion.span
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          />
          <motion.span
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.span
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: 0.4 }}
          />
        </div>

        {/* Expandable nav content */}
        <motion.nav
          className="navbar-links"
          aria-label="Main navigation"
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -12 }}
          transition={{ duration: 0.35, ease }}
        >
          <AnimatePresence>
            {(!isMobile || isExpanded) && (
              <motion.div
                className="navbar-links-inner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
              >
                <Link href="/" className="navbar-link" onClick={() => isMobile && setIsExpanded(false)}>Home</Link>
                <Link href="/about" className="navbar-link" onClick={() => isMobile && setIsExpanded(false)}>About</Link>
                <Link href="/faq" className="navbar-link" onClick={() => isMobile && setIsExpanded(false)}>FAQ</Link>
                <Link href="/guides" className="navbar-link" onClick={() => isMobile && setIsExpanded(false)}>Guides</Link>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="navbar-end">
            <div className="navbar-separator" />
            <ThemeToggle />
          </div>
        </motion.nav>
      </div>

      {/* Glow ring — subtle animated border glow */}
      <div className="navbar-glow" aria-hidden="true" />
    </header>
  );
}
