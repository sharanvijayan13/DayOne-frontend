"use client";

import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Calendar,
  Target,
  FileEdit,
  Share2,
  User,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  BookOpen,
} from "lucide-react";
import { getGravatarUrl, getUserInitials } from "../utils/gravatar";

export default function Navigation({
  activeTab,
  setActiveTab,
  notesCount = 0,
  privateNotesCount = 0,
  draftsCount = 0,
  habitsCount = 0,
  todayHabitsCount = 0,
  profile,
  onLogout,
}) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "today",
      label: "Today",
      count: todayHabitsCount,
      icon: Calendar,
    },
    {
      id: "habits",
      label: "Habits",
      count: habitsCount,
      icon: Target
    },
    {
      id: "notes",
      label: "Notes",
      count: notesCount + privateNotesCount + draftsCount,
      icon: FileEdit,
    },
    {
      id: "share",
      label: "Share",
      count: 0,
      icon: Share2
    },
  ];

  return (
    <nav className="nav-container">
      {/* Desktop Navigation */}
      <div className="nav-desktop">
        <div className="nav-brand">
          <BookOpen size={24} />
          <h1>DayOne</h1>
        </div>

        <div className="nav-tabs">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab ${activeTab === item.id ? "nav-tab-active" : ""
                  }`}
              >
                <IconComponent size={18} className="nav-tab-icon" />
                <span className="nav-tab-label">{item.label}</span>
                {item.count > 0 && (
                  <span className="nav-tab-count">{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {profile && (
            <div className="profile-dropdown">
              <button 
                className="profile-trigger"
                onClick={() => setActiveTab("profile")}
                title="Profile"
              >
                <img
                  src={profile.avatar_url 
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${profile.avatar_url}`
                    : getGravatarUrl(profile.email, 32)
                  }
                  alt="Profile"
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="profile-avatar-fallback" style={{ display: 'none' }}>
                  {getUserInitials(profile.name)}
                </div>
              </button>
            </div>
          )}

          <button onClick={onLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="nav-mobile">
        <div className="nav-mobile-header">
          <div className="nav-mobile-brand">
            <BookOpen size={20} />
            <h1>DayOne</h1>
          </div>
          <div className="nav-mobile-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="nav-mobile-menu">
            <div className="nav-mobile-tabs">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`nav-mobile-tab ${activeTab === item.id ? "nav-mobile-tab-active" : ""
                      }`}
                  >
                    <IconComponent size={18} className="nav-tab-icon" />
                    <span className="nav-tab-label">{item.label}</span>
                    {item.count > 0 && (
                      <span className="nav-tab-count">{item.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {profile && (
              <div className="nav-mobile-profile">
                <div className="mobile-profile-info">
                  <div className="mobile-profile-avatar">
                    <img
                      src={profile.avatar_url 
                        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${profile.avatar_url}`
                        : getGravatarUrl(profile.email, 48)
                      }
                      alt="Profile"
                      className="mobile-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="mobile-avatar-fallback" style={{ display: 'none' }}>
                      {getUserInitials(profile.name)}
                    </div>
                  </div>
                  <div className="mobile-profile-details">
                    <div className="mobile-profile-name">{profile.name}</div>
                    <div className="mobile-profile-email">{profile.email}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="mobile-profile-btn"
                >
                  <User size={16} />
                  Profile Settings
                </button>
                
                <button
                  onClick={onLogout}
                  className="logout-btn"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .nav-container {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          margin: 0 auto;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .nav-brand h1 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-tab:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-tab-active {
          background: var(--accent-primary);
          color: white;
        }

        .nav-tab-active:hover {
          background: var(--accent-hover);
          color: white;
        }

        .nav-tab-icon {
          flex-shrink: 0;
          color: inherit;
        }

        .nav-tab-count {
          background: rgba(255, 255, 255, 0.2);
          color: inherit;
          padding: 0.125rem 0.375rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 1.25rem;
          text-align: center;
        }

        .nav-tab:not(.nav-tab-active) .nav-tab-count {
          background: var(--bg-accent);
          color: var(--text-secondary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .theme-toggle {
          padding: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 6px;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }

        .theme-toggle:hover {
          background: var(--bg-accent);
        }



        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          background: var(--bg-primary);
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }

        .logout-btn-simple {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }

        .logout-btn-simple:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        /* Mobile Navigation */
        .nav-mobile {
          display: none;
        }

        .nav-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
        }

        .nav-mobile-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }

        .nav-mobile-header h1 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .nav-mobile-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-menu-toggle {
          padding: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 6px;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-primary);
        }

        .mobile-menu-toggle:hover {
          background: var(--bg-accent);
        }

        .nav-mobile-menu {
          border-top: 1px solid var(--border-primary);
          background: var(--bg-primary);
        }

        .nav-mobile-tabs {
          padding: 1rem;
        }

        .nav-mobile-tab {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }

        .nav-mobile-tab:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .nav-mobile-tab-active {
          background: var(--accent-primary);
          color: white;
        }

        .nav-mobile-profile {
          padding: 1rem;
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-profile-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .mobile-profile-avatar {
          position: relative;
        }

        .mobile-avatar-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-primary);
        }

        .mobile-avatar-fallback {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
          border: 2px solid var(--border-primary);
        }

        .mobile-profile-details {
          flex: 1;
        }

        .mobile-profile-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .mobile-profile-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .mobile-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-profile-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-secondary);
        }

        .nav-mobile-profile .logout-btn {
          width: 100%;
        }

        /* Profile Dropdown Styles */
        .profile-dropdown {
          position: relative;
        }

        .profile-trigger {
          padding: 0.25rem;
          border: none;
          background: transparent;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-trigger:hover {
          background: var(--bg-tertiary);
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-primary);
        }

        .profile-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          border: 2px solid var(--border-primary);
        }

        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .nav-mobile {
            display: block;
          }
        }

        @media (max-width: 480px) {
          .nav-mobile-header {
            padding: 0.75rem;
          }

          .nav-mobile-header h1 {
            font-size: 1rem;
          }

          .nav-mobile-tabs {
            padding: 0.75rem;
          }

          .nav-mobile-tab {
            padding: 1rem 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}
