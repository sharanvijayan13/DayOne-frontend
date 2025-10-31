"use client";

import { useRouter } from "next/navigation";
import { LogOut } from 'lucide-react';

export default function LogoutButton({ className = "", variant = "default" }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // Redirect to home page
  };

  const baseClasses = "logout-button";
  const variantClasses = {
    default: "logout-default",
    simple: "logout-simple",
    danger: "logout-danger"
  };

  return (
    <button 
      onClick={handleLogout} 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <LogOut size={16} />
      Logout
      
      <style jsx>{`
        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .logout-default {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-primary);
        }

        .logout-default:hover {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }

        .logout-simple {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid transparent;
        }

        .logout-simple:hover {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }

        .logout-danger {
          background: var(--error);
          color: white;
          border: 1px solid var(--error);
        }

        .logout-danger:hover {
          background: #dc2626;
          border-color: #dc2626;
        }
      `}</style>
    </button>
  );
}