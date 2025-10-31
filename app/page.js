"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import LogoutButton from "../components/LogoutButton";
import {
  Sprout,
  Sun,
  Moon,
  ArrowRight,
  Calendar,
  Target,
  Flame,
  Share2,
  FileEdit,
  CheckCircle,
  Users,
  Zap,
  Menu,
  X,
  Shield,
  Smartphone,
  Heart,
  TrendingUp
} from 'lucide-react';
import "./globals.css";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicNotes, setPublicNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Fetch public notes
    fetchPublicNotes();
  }, []);

  const fetchPublicNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setPublicNotes(data.slice(0, 6)); // Show only first 6 notes
      }
    } catch (err) {
      console.error('Failed to fetch public notes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="brand">
            <Sprout size={24} />
            <h1>DayOne</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <button onClick={() => scrollToSection('features')} className="nav-link">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="nav-link">
              Why us?
            </button>
          </nav>

          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isLoggedIn ? (
              <LogoutButton variant="simple" />
            ) : (
              <Link href="/login" className="btn btn-secondary btn-small">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <button onClick={() => scrollToSection('features')} className="mobile-nav-link">
              Features
            </button>
            <button onClick={() => scrollToSection('community')} className="mobile-nav-link">
              Community
            </button>
            <button onClick={() => scrollToSection('about')} className="mobile-nav-link">
              About
            </button>
            {!isLoggedIn && (
              <Link href="/login" className="mobile-nav-link">
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="home-main">
        <section id="hero" className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Simple. Powerful. Private.</span>
            </div>

            <h2 className="hero-title">
              Build Better Habits,<br />Track Your Progress
            </h2>

            <p className="hero-description">
              Track daily habits, maintain streaks, and reflect on your journey with private notes.
              Everything you need to build lasting habits in one clean, distraction-free app.
            </p>

            <div className="hero-actions">
              {isLoggedIn ? (
                <Link href="/profile" className="btn btn-primary btn-large">
                  <Calendar size={18} />
                  Open DayOne
                </Link>
              ) : (
                <div className="auth-buttons">
                  <Link href="/signup" className="btn btn-primary btn-large">
                    Get Started Free
                  </Link>
                  <Link href="/login" className="btn btn-ghost btn-large">
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            <div className="hero-preview">
              <div className="preview-card">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="preview-title">Today's Habits</span>
                </div>
                <div className="preview-content">
                  <div className="habit-preview">
                    <div className="habit-check completed">
                      <CheckCircle size={16} />
                    </div>
                    <span className="habit-name">Morning Exercise</span>
                    <span className="habit-streak">🔥 7</span>
                  </div>
                  <div className="habit-preview">
                    <div className="habit-check">
                      <div className="habit-circle"></div>
                    </div>
                    <span className="habit-name">Read 30 minutes</span>
                    <span className="habit-streak">🔥 3</span>
                  </div>
                  <div className="habit-preview">
                    <div className="habit-check">
                      <div className="habit-circle"></div>
                    </div>
                    <span className="habit-name">Drink 8 glasses water</span>
                    <span className="habit-streak">🔥 12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {publicNotes.length > 0 && (
          <section id="community" className="public-notes-section">
            <div className="public-notes-content">
              <h2 className="section-title">Community Notes</h2>
              <p className="section-description">
                See what others are sharing about their habit journey
              </p>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading notes...</p>
                </div>
              ) : (
                <div className="public-notes-grid">
                  {publicNotes.map((note) => (
                    <article key={note.id} className="public-note-card">
                      <h3 className="public-note-title">{note.title}</h3>
                      <div className="public-note-body">
                        {note.body.length > 120
                          ? `${note.body.substring(0, 120)}...`
                          : note.body
                        }
                      </div>



                      <div className="public-note-meta">
                        <span className="public-note-author">
                          {note.users?.name || 'Anonymous'}
                        </span>
                        <span className="public-note-date">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {isLoggedIn && (
                <div className="public-notes-cta">
                  <Link href="/profile" className="btn btn-secondary">
                    Share Your Notes
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        <section id="features" className="features-section">
          <div className="features-content">
            <h2 className="section-title">Every habit counts</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <Calendar size={24} />
                </div>
                <div className="feature-text">
                  <h3>Daily Check-ins</h3>
                  <p>One-tap habit completion with automatic streak tracking</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Target size={24} />
                </div>
                <div className="feature-text">
                  <h3>Custom Habits</h3>
                  <p>Create personalized habits with colors and descriptions</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Flame size={24} />
                </div>
                <div className="feature-text">
                  <h3>Streak Motivation</h3>
                  <p>Visual progress tracking to keep you motivated</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FileEdit size={24} />
                </div>
                <div className="feature-text">
                  <h3>Private Notes</h3>
                  <p>Reflect on your journey with personal notes and drafts</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Share2 size={24} />
                </div>
                <div className="feature-text">
                  <h3>Share Progress</h3>
                  <p>Celebrate milestones and inspire others</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <div className="feature-text">
                  <h3>Community</h3>
                  <p>Connect with others through public notes and tips</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Why DayOne?</h2>
              <p className="section-description">
                Built for people who want to build lasting habits without the complexity
              </p>

              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-text">
                    <h3>Simple & Effective</h3>
                    <p>No overwhelming features, just what you need to build habits</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Shield size={24} />
                  </div>
                  <div className="stat-text">
                    <h3>Privacy First</h3>
                    <p>Your data stays private. Share only what you want to share</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Smartphone size={24} />
                  </div>
                  <div className="stat-text">
                    <h3>Works Everywhere</h3>
                    <p>Responsive design that works perfectly on all your devices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        <section className="cta-section">
          <div className="cta-content">
            <h2>Start building yourself</h2>
            <p>Join others who are already transforming their daily routines</p>
            {!isLoggedIn && (
              <Link href="/signup" className="btn btn-primary btn-large">
                Get Started Free
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="brand">
                <Sprout size={24} />
                <h3>DayOne</h3>
              </div>
              <p>Build better habits, one day at a time.</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <button onClick={() => scrollToSection('features')} className="footer-link">Features</button>
                <button onClick={() => scrollToSection('about')} className="footer-link">Why us?</button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 DayOne. All rights reserved.</p>
            <div className="footer-credits">
              <span>Created by Sharan Vijayan</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
        }

        .home-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          padding: 1rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .desktop-nav {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 0.5rem 0;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-primary);
          padding: 1rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 100;
        }

        .mobile-nav-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-primary);
          text-decoration: none;
        }

        .mobile-nav-link:hover {
          color: var(--text-primary);
        }

        .mobile-nav-link:last-child {
          border-bottom: none;
        }

        .btn-small {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .header-content h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .theme-toggle {
          padding: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
        }

        .theme-toggle:hover {
          background: var(--bg-accent);
        }

        .home-main {
          flex: 1;
        }

        .hero-section {
          padding: 6rem 2rem 4rem;
          text-align: center;
          background: var(--bg-primary);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 50px;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-actions {
          margin-bottom: 4rem;
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-ghost {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-primary);
        }

        .btn-ghost:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .hero-preview {
          display: flex;
          justify-content: center;
        }

        .preview-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          overflow: hidden;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .preview-header {
          background: var(--bg-tertiary);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .preview-dots {
          display: flex;
          gap: 0.25rem;
        }

        .preview-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .preview-dots span:nth-child(1) { background: #ef4444; }
        .preview-dots span:nth-child(2) { background: #f59e0b; }
        .preview-dots span:nth-child(3) { background: #10b981; }

        .preview-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .preview-content {
          padding: 1.5rem;
        }

        .habit-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-primary);
        }

        .habit-preview:last-child {
          border-bottom: none;
        }

        .habit-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .habit-check.completed {
          color: var(--success);
        }

        .habit-circle {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-secondary);
          border-radius: 50%;
        }

        .habit-name {
          flex: 1;
          color: var(--text-primary);
          font-size: 0.875rem;
          text-align: left;
        }

        .habit-streak {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .public-notes-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .public-notes-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 1rem;
        }

        .section-description {
          font-size: 1.125rem;
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 3rem;
        }

        .public-notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .public-note-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .public-note-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
          transform: translateY(-2px);
        }

        .public-note-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .public-note-body {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }



        .public-note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .public-note-author {
          font-weight: 500;
        }

        .public-notes-cta {
          text-align: center;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid var(--border-primary);
          border-top: 2px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .features-section {
          padding: 4rem 2rem;
          background: var(--bg-primary);
        }

        .features-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .feature-item:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .feature-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .feature-text h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feature-text p {
          color: var(--text-secondary);
          line-height: 1.5;
          font-size: 0.875rem;
        }

        .cta-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        /* About Section */
        .about-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .about-content {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .about-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .stat-item:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
          transform: translateY(-2px);
        }

        .stat-icon {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .stat-text h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .stat-text p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }



        /* Footer */
        .home-footer {
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-primary);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 1rem;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-brand .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .footer-brand h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .footer-brand p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }



        .footer-links {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .footer-column h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-link {
          display: block;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.25rem 0;
          transition: color 0.2s ease;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .footer-link:hover {
          color: var(--text-primary);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .footer-credits {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .heart {
          color: #ef4444;
        }

        .home-footer {
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border-primary);
          padding: 2rem;
          text-align: center;
        }

        .home-footer p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 0 1rem;
          }

          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-nav {
            padding: 1rem;
          }

          .hero-section {
            padding: 4rem 1rem 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .auth-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-large {
            width: 100%;
            max-width: 300px;
          }

          .preview-card {
            max-width: 100%;
          }

          .public-notes-section {
            padding: 3rem 1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .public-notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .features-section {
            padding: 3rem 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .feature-item {
            padding: 1rem;
          }

          .cta-section {
            padding: 3rem 1rem;
          }

          .cta-content h2 {
            font-size: 2rem;
          }

          .about-section {
            padding: 3rem 1rem;
          }

          .about-stats {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-item {
            padding: 1.5rem;
          }



          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 1rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 3rem 1rem 2rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-badge {
            font-size: 0.8125rem;
            padding: 0.375rem 0.75rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .cta-content h2 {
            font-size: 1.75rem;
          }

          .preview-content {
            padding: 1rem;
          }

          .habit-preview {
            padding: 0.5rem 0;
          }

          .about-section {
            padding: 2rem 1rem;
          }



          .footer-content {
            padding: 2rem 1rem 1rem;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}