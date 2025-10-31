"use client";

import { useState, useEffect } from 'react';
import { Calendar, Target, FileEdit, Share2 } from 'lucide-react';

export default function MobileNavigation({ 
  activeTab, 
  setActiveTab, 
  notesCount = 0, 
  privateNotesCount = 0,
  draftsCount = 0,
  habitsCount = 0,
  todayHabitsCount = 0
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { id: 'today', label: 'Today', count: todayHabitsCount, icon: Calendar },
    { id: 'habits', label: 'Habits', count: habitsCount, icon: Target },
    { id: 'notes', label: 'Notes', count: notesCount + privateNotesCount + draftsCount, icon: FileEdit },
    { id: 'share', label: 'Share', count: 0, icon: Share2 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`mobile-nav ${isVisible ? 'mobile-nav-visible' : 'mobile-nav-hidden'}`}>
      <div className="mobile-nav-content">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${activeTab === item.id ? 'mobile-nav-item-active' : ''}`}
            >
              <IconComponent size={20} className="mobile-nav-icon" />
              <span className="mobile-nav-label">{item.label}</span>
              {item.count > 0 && (
                <span className="mobile-nav-badge">{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-primary);
          z-index: 1000;
          transform: translateY(0);
          transition: transform 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .mobile-nav-hidden {
          transform: translateY(100%);
        }

        .mobile-nav-visible {
          transform: translateY(0);
        }

        .mobile-nav-content {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.75rem 1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-width: 60px;
        }

        .mobile-nav-item:hover {
          background: var(--bg-tertiary);
          color: white;
        }

        .mobile-nav-item-active {
          background: var(--accent-primary);
          color: white;
        }

        .mobile-nav-item-active:hover {
          background: var(--accent-hover);
        }

        .mobile-nav-icon {
          flex-shrink: 0;
          color: inherit;
        }

        .mobile-nav-label {
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }

        .mobile-nav-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: var(--error);
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 1rem;
          height: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-nav-item-active .mobile-nav-badge {
          background: rgba(255, 255, 255, 0.3);
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}