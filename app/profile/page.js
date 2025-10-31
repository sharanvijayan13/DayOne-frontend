"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import MobileNavigation from "../../components/MobileNavigation";

import HabitForm from "../../components/HabitForm";
import { useTheme } from "../../contexts/ThemeContext";
import { getGravatarUrl, getUserInitials } from "../../utils/gravatar";
import {
  Lock,
  LogIn,
  UserPlus,
  FileEdit,
  Edit3,
  Trash2,
  Send,
  Save,
  X,
  Calendar,
  Check,
  Flame,
  Target,
  Plus,
  Sun,
  Moon,
  LogOut,
  Filter,
  ChevronDown,
  Upload,
  Camera,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("today");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showDraftButton, setShowDraftButton] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notesSubTab, setNotesSubTab] = useState("public"); // public, private, drafts
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Habit filtering and sorting states
  const [habitFilter, setHabitFilter] = useState("all"); // all, completed-today, not-completed, active, archived
  const [habitSort, setHabitSort] = useState("name"); // name, current-streak, created

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchHabits();
    fetchNotes();
    fetchPrivateNotes();
    fetchDrafts();
  }, [token]);

  useEffect(() => {
    setShowDraftButton(!!(title.trim() || body.trim()) && !editingId);
  }, [title, body, editingId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      // Set profile editing states
      setProfileName(data.name || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      console.log('📥 Fetched public notes:', data);

      // This now returns only public notes (not drafts, not private)
      const notesData = Array.isArray(data) ? data : (data.data || []);
      setNotes(notesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/drafts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch drafts");

      const data = await res.json();
      const draftsData = Array.isArray(data) ? data : (data.data || []);
      setDrafts(draftsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchPrivateNotes = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/private/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch private notes");

      const data = await res.json();
      const privateData = Array.isArray(data) ? data : (data.data || []);
      setPrivateNotes(privateData);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/habits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch habits");
      const data = await res.json();
      console.log('📥 Fetched habits:', data);

      const habitsData = Array.isArray(data) ? data : (data.data || []);
      setHabits(habitsData);

      // Set today's habits (all active habits for today's checklist)
      const today = new Date().toISOString().split('T')[0];
      const todayHabitsWithCompletion = habitsData
        .filter(habit => habit.is_active)
        .map(habit => ({
          ...habit,
          completed_today: habit.completions?.some(c => c.date === today) || false
        }));
      setTodayHabits(todayHabitsWithCompletion);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (!title?.trim()) return setError("Please provide a title");
    if (!body?.trim()) return setError("Please provide content");

    // Debug logging
    console.log('🔍 Creating/updating note');

    try {
      if (editingId) {
        const requestData = {
          title,
          body,
          is_draft: editingType === "draft" ? false : undefined
        };
        console.log('📤 Update request data:', requestData);

        const res = await fetch(`${BACKEND}/api/posts/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Request failed");
        }

        const data = await res.json();

        if (editingType === "draft") {
          setDrafts(prev => prev.filter(d => d.id !== editingId));
          if (data.is_private) {
            setPrivateNotes(prev => [data, ...prev]);
          } else {
            setNotes(prev => [data, ...prev]);
          }
        } else if (editingType === "private") {
          setPrivateNotes(prev => prev.map(n => n.id === editingId ? data : n));
        } else {
          setNotes(prev => prev.map(n => n.id === editingId ? data : n));
        }

        clearForm();
      } else {
        const postData = {
          title: title.trim(),
          body: body.trim(),
          is_draft: false,
          is_private: isPrivate
        };
        console.log('📤 Create request data:', postData);

        const res = await fetch(`${BACKEND}/api/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });

        if (!res.ok) {
          let errorMessage = "Failed to create note";
          try {
            const err = await res.json();
            errorMessage = err.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            errorMessage = `Server error (${res.status})`;
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();
        console.log('✅ Note created with response:', data);

        if (data.is_private) {
          setPrivateNotes(prev => [data, ...prev]);
        } else {
          setNotes(prev => [data, ...prev]);
        }
        clearForm();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveDraft = async () => {
    setError("");
    if (!title?.trim()) return setError("Please provide a title");
    if (!body?.trim()) return setError("Please provide content");

    const requestData = {
      title: title.trim(),
      body: body.trim(),
      is_draft: true
    };
    console.log('📤 Draft request data:', requestData);

    try {
      const res = await fetch(`${BACKEND}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      console.log('✅ Draft created with response:', data);
      setDrafts(prev => [data, ...prev]);
      clearForm();
      setNotesSubTab("drafts");
    } catch (err) {
      setError(err.message);
    }
  };

  const clearForm = () => {
    setTitle("");
    setBody("");
    setEditingId(null);
    setEditingType(null);
    setIsPrivate(false);
  };

  const handleEdit = (item, type = "note") => {
    setTitle(item.title || "");
    setBody(item.body || "");
    setIsPrivate(item.is_private || false);
    setEditingId(item.id);
    setEditingType(type);
    setActiveTab("notes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, type = "note") => {
    const itemType = type === "draft" ? "draft" : type === "private" ? "private note" : "note";
    if (!confirm(`Delete this ${itemType}?`)) return;

    try {
      const res = await fetch(`${BACKEND}/api/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }

      if (type === "draft") {
        setDrafts(prev => prev.filter(d => d.id !== id));
      } else if (type === "private") {
        setPrivateNotes(prev => prev.filter(n => n.id !== id));
      } else {
        setNotes(prev => prev.filter(n => n.id !== id));
      }

    } catch (err) {
      setError(`Failed to delete ${itemType}: ${err.message}`);
    }
  };

  const handlePublishDraft = async (draft) => {
    try {
      const res = await fetch(`${BACKEND}/api/posts/${draft.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: draft.title,
          body: draft.body,
          labels: draft.labels || [],
          is_draft: false
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Request failed");
      }

      const data = await res.json();
      setDrafts(prev => prev.filter(d => d.id !== draft.id));

      if (data.is_private) {
        setPrivateNotes(prev => [data, ...prev]);
      } else {
        setNotes(prev => [data, ...prev]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`${BACKEND}/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: today }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Request failed");
      }

      const result = await res.json();

      // Update today's habits
      setTodayHabits(prev => prev.map(habit =>
        habit.id === habitId
          ? { ...habit, completed_today: result.completed }
          : habit
      ));

      // Refresh habits data to update streaks
      fetchHabits();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      const res = await fetch(`${BACKEND}/api/habits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create habit");
      }

      const newHabit = await res.json();
      setHabits(prev => [newHabit, ...prev]);

      // Add to today's habits if it's active
      if (newHabit.is_active) {
        setTodayHabits(prev => [{
          ...newHabit,
          completed_today: false
        }, ...prev]);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleEditHabit = async (habitData) => {
    try {
      const res = await fetch(`${BACKEND}/api/habits/${editingHabit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update habit");
      }

      const updatedHabit = await res.json();
      setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
      setTodayHabits(prev => prev.map(h => h.id === updatedHabit.id ? { ...updatedHabit, completed_today: h.completed_today } : h));
      setEditingHabit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit? This will also delete all completion history.')) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND}/api/habits/${habitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete habit");
      }

      setHabits(prev => prev.filter(h => h.id !== habitId));
      setTodayHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    // Reset to original values
    setProfileName(profile?.name || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setError("");
  };

  const getAvatarUrl = (profile, size = 80) => {
    if (profile?.avatar_url) {
      return `${BACKEND}${profile.avatar_url}`;
    }
    return getGravatarUrl(profile?.email, size);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setAvatarUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await fetch(`${BACKEND}/api/auth/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to upload avatar');
      }

      const data = await res.json();
      setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setAvatarUploading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND}/api/auth/avatar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to remove avatar');
      }

      setProfile(prev => ({ ...prev, avatar_url: null }));
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setProfileLoading(true);

    try {
      const res = await fetch(`${BACKEND}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditingProfile(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
    setNotes([]);
    setDrafts([]);
    router.push("/"); // Redirect to home page instead of login
  }, [router]);

  // Helper functions for Share tab
  const getWeeklyProgress = useCallback(() => {
    const today = new Date();
    const weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      weekDays.push(date.toISOString().split('T')[0]);
    }

    return habits.map(habit => ({
      ...habit,
      weeklyData: weekDays.map(date => ({
        date,
        completed: habit.completions?.some(c => c.date === date) || false
      }))
    }));
  }, [habits]);

  const getTodayHabitsForShare = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return habits
      .filter(habit => habit.is_active)
      .map(habit => ({
        ...habit,
        completed_today: habit.completions?.some(c => c.date === today) || false
      }));
  }, [habits]);

  const exportHabitsData = useCallback(() => {
    const csvData = [];
    csvData.push(['Habit Name', 'Date', 'Completed', 'Current Streak', 'Best Streak']);

    habits.forEach(habit => {
      if (habit.completions && habit.completions.length > 0) {
        habit.completions.forEach(completion => {
          csvData.push([
            habit.name,
            completion.date,
            'Yes',
            habit.current_streak || 0,
            habit.best_streak || 0
          ]);
        });
      } else {
        csvData.push([
          habit.name,
          'No completions',
          'No',
          habit.current_streak || 0,
          habit.best_streak || 0
        ]);
      }
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habits-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [habits]);

  const downloadProgressCard = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('My Habit Progress', canvas.width / 2, 60);

    // User name
    ctx.font = '20px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(profile?.name || 'User', canvas.width / 2, 90);

    // Date
    ctx.font = '16px Arial';
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, 115);

    // Stats section
    const activeHabits = habits.filter(h => h.is_active);
    const totalStreaks = habits.reduce((sum, h) => sum + (h.current_streak || 0), 0);
    const bestStreak = Math.max(...habits.map(h => h.best_streak || 0), 0);

    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'left';

    // Active habits
    ctx.fillText(`${activeHabits.length}`, 100, 180);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Active Habits', 100, 200);

    // Total streaks
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${totalStreaks}`, 300, 180);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Total Streak Days', 300, 200);

    // Best streak
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${bestStreak}`, 500, 180);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Best Streak', 500, 200);

    // Habits list
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Current Streaks:', 100, 260);

    let yPos = 290;
    habits.filter(h => h.current_streak > 0).slice(0, 8).forEach((habit, index) => {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(`${habit.name}`, 120, yPos);

      ctx.fillStyle = habit.color || '#3b82f6';
      ctx.fillText(`${habit.current_streak} days`, 500, yPos);

      yPos += 25;
    });

    // Footer
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by Habit Tracker', canvas.width / 2, canvas.height - 30);

    // Download
    canvas.toBlob((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-progress-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  }, [habits, profile]);

  // Filter and sort habits
  const getFilteredAndSortedHabits = useCallback(() => {
    let filteredHabits = [...habits];
    const today = new Date().toISOString().split('T')[0];

    // Apply filters
    switch (habitFilter) {
      case "completed-today":
        filteredHabits = filteredHabits.filter(habit =>
          habit.completions?.some(c => c.date === today)
        );
        break;
      case "not-completed":
        filteredHabits = filteredHabits.filter(habit =>
          !habit.completions?.some(c => c.date === today)
        );
        break;
      case "active":
        filteredHabits = filteredHabits.filter(habit => habit.is_active);
        break;
      case "archived":
        filteredHabits = filteredHabits.filter(habit => !habit.is_active);
        break;
      default:
        // "all" - no filtering
        break;
    }

    // Apply sorting
    switch (habitSort) {
      case "current-streak":
        filteredHabits.sort((a, b) => (b.current_streak || 0) - (a.current_streak || 0));
        break;
      case "created":
        filteredHabits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "name":
      default:
        filteredHabits.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filteredHabits;
  }, [habits, habitFilter, habitSort]);

  if (!token) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <div className="auth-icon">
            <Lock size={48} />
          </div>
          <h2>Authentication Required</h2>
          <p>Please login to access your notes and drafts.</p>
          <div className="auth-actions">
            <a href="/login" className="btn btn-primary">
              <LogIn size={16} />
              Login
            </a>
            <a href="/signup" className="btn btn-secondary">
              <UserPlus size={16} />
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (!editingId) clearForm();
        }}
        notesCount={notes.length}
        privateNotesCount={privateNotes.length}
        draftsCount={drafts.length}
        habitsCount={habits.length}
        todayHabitsCount={todayHabits.length}
        profile={profile}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <div className="content-container">
          {activeTab === "today" && (
            <div className="today-section">
              <div className="today-header">
                <h2>Today's Habits</h2>
                <p className="today-date">{new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading habits...</p>
                </div>
              ) : todayHabits.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} className="empty-icon" />
                  <h3>No habits yet</h3>
                  <p>Create your first habit to start tracking!</p>
                  <button
                    onClick={() => setActiveTab("habits")}
                    className="btn btn-primary"
                  >
                    Create Habit
                  </button>
                </div>
              ) : (
                <div className="habits-checklist">
                  {todayHabits.map((habit) => (
                    <div key={habit.id} className={`habit-item ${habit.completed_today ? 'completed' : ''}`}>
                      <button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className="habit-toggle"
                      >
                        <div className="habit-checkbox">
                          {habit.completed_today && <Check size={16} />}
                        </div>
                      </button>

                      <div className="habit-info">
                        <div className="habit-header">
                          <h3 className="habit-name">{habit.name}</h3>
                          <div className="habit-streak">
                            <Flame size={16} />
                            <span>{habit.current_streak || 0}</span>
                          </div>
                        </div>
                        {habit.description && (
                          <p className="habit-description">{habit.description}</p>
                        )}
                      </div>

                      <div
                        className="habit-color-indicator"
                        style={{ backgroundColor: habit.color }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {todayHabits.length > 0 && (
                <div className="today-stats">
                  <div className="stat-card">
                    <span className="stat-number">
                      {todayHabits.filter(h => h.completed_today).length}
                    </span>
                    <span className="stat-label">Completed Today</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{todayHabits.length}</span>
                    <span className="stat-label">Total Habits</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">
                      {Math.round((todayHabits.filter(h => h.completed_today).length / todayHabits.length) * 100)}%
                    </span>
                    <span className="stat-label">Completion</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {(activeTab === "notes") && (
            <form className="note-form" onSubmit={handleCreateOrUpdate}>
              <div className="form-header">
                <div className="form-header-left">
                  <h2>{editingId ? (editingType === "draft" ? "Edit Draft" : "Edit Note") : "Create New Note"}</h2>
                </div>
                <div className="form-header-right">
                  <label className="privacy-toggle-header">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="privacy-checkbox"
                    />
                    <span className="privacy-label-header">
                      <Lock size={16} />
                      Make Private
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <input
                  className="form-input"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <textarea
                  className="form-input form-textarea"
                  placeholder="Write your note content..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                />
              </div>



              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? (editingType === "draft" ? "Publish Draft" : "Update Note") : "Create Note"}
                </button>

                {showDraftButton && !editingId && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="btn btn-secondary"
                  >
                    <Save size={16} />
                    Save as Draft
                  </button>
                )}

                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="btn btn-secondary"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {activeTab === "notes" && (
            <div className="notes-section">
              <div className="notes-tabs">
                <button
                  className={`notes-tab ${notesSubTab === 'public' ? 'active' : ''}`}
                  onClick={() => setNotesSubTab('public')}
                >
                  Notes ({notes.length})
                </button>
                <button
                  className={`notes-tab ${notesSubTab === 'private' ? 'active' : ''}`}
                  onClick={() => setNotesSubTab('private')}
                >
                  Private ({privateNotes.length})
                </button>
                <button
                  className={`notes-tab ${notesSubTab === 'drafts' ? 'active' : ''}`}
                  onClick={() => setNotesSubTab('drafts')}
                >
                  Drafts ({drafts.length})
                </button>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading notes...</p>
                </div>
              ) : (
                <div className="notes-content">
                  {notesSubTab === 'public' && (
                    notes.length === 0 ? (
                      <div className="empty-state">
                        <FileEdit size={48} className="empty-icon" />
                        <h3>No public notes yet</h3>
                        <p>Create your first public note!</p>
                      </div>
                    ) : (
                      <div className="notes-grid">
                        {notes.map((note) => (
                          <article key={note.id} className="note-card">
                            <div className="note-header">
                              <h3 className="note-title">{note.title}</h3>
                              <div className="note-actions">
                                <button
                                  onClick={() => handleEdit(note, "note")}
                                  className="action-btn edit-btn"
                                  title="Edit note"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id, "note")}
                                  className="action-btn delete-btn"
                                  title="Delete note"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="note-body">
                              {note.body}
                            </div>

                            <div className="note-meta">
                              <span className="note-date">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )
                  )}

                  {notesSubTab === 'private' && (
                    privateNotes.length === 0 ? (
                      <div className="empty-state">
                        <Lock size={48} className="empty-icon" />
                        <h3>No private notes yet</h3>
                        <p>Create a private note to keep it visible only to you!</p>
                      </div>
                    ) : (
                      <div className="notes-grid">
                        {privateNotes.map((note) => (
                          <article key={note.id} className="note-card private-card">
                            <div className="note-header">
                              <h3 className="note-title">{note.title}</h3>
                              <div className="note-actions">
                                <button
                                  onClick={() => handleEdit(note, "private")}
                                  className="action-btn edit-btn"
                                  title="Edit private note"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id, "private")}
                                  className="action-btn delete-btn"
                                  title="Delete private note"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="note-body">
                              {note.body}
                            </div>

                            <div className="note-meta">
                              <span className="private-badge">PRIVATE</span>
                              <span className="note-date">
                                {new Date(note.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )
                  )}

                  {notesSubTab === 'drafts' && (
                    drafts.length === 0 ? (
                      <div className="empty-state">
                        <FileEdit size={48} className="empty-icon" />
                        <h3>No drafts yet</h3>
                        <p>Save a note as draft to see it here!</p>
                      </div>
                    ) : (
                      <div className="notes-grid">
                        {drafts.map((draft) => (
                          <article key={draft.id} className="note-card draft-card">
                            <div className="note-header">
                              <h3 className="note-title">{draft.title}</h3>
                              <div className="note-actions">
                                <button
                                  onClick={() => handlePublishDraft(draft)}
                                  className="action-btn publish-btn"
                                  title="Publish draft"
                                >
                                  <Send size={16} />
                                </button>
                                <button
                                  onClick={() => handleEdit(draft, "draft")}
                                  className="action-btn edit-btn"
                                  title="Edit draft"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(draft.id, "draft")}
                                  className="action-btn delete-btn"
                                  title="Delete draft"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <div className="note-body">
                              {draft.body}
                            </div>

                            <div className="note-meta">
                              <span className="draft-badge">DRAFT</span>
                              <span className="note-date">
                                {new Date(draft.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "habits" && (
            <div className="habits-section">
              <div className="habits-header">
                <h2>My Habits</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowHabitForm(true)}
                >
                  <Plus size={16} />
                  New Habit
                </button>
              </div>

              {habits.length > 0 && (
                <div className="habits-filters">
                  <div className="filter-group">
                    <div className="filter-section">
                      <span className="filter-label">
                        <Filter size={16} />
                        Filter
                      </span>
                      <div className="filter-pills">
                        <button
                          className={`filter-pill ${habitFilter === "all" ? "active" : ""}`}
                          onClick={() => setHabitFilter("all")}
                        >
                          All Habits
                        </button>
                        <button
                          className={`filter-pill ${habitFilter === "completed-today" ? "active" : ""}`}
                          onClick={() => setHabitFilter("completed-today")}
                        >
                          Completed Today
                        </button>
                        <button
                          className={`filter-pill ${habitFilter === "not-completed" ? "active" : ""}`}
                          onClick={() => setHabitFilter("not-completed")}
                        >
                          Not Completed
                        </button>
                        <button
                          className={`filter-pill ${habitFilter === "active" ? "active" : ""}`}
                          onClick={() => setHabitFilter("active")}
                        >
                          Active
                        </button>
                        <button
                          className={`filter-pill ${habitFilter === "archived" ? "active" : ""}`}
                          onClick={() => setHabitFilter("archived")}
                        >
                          Archived
                        </button>
                      </div>
                    </div>

                    <div className="sort-section">
                      <span className="filter-label">Sort by</span>
                      <div className="sort-dropdown">
                        <select
                          value={habitSort}
                          onChange={(e) => setHabitSort(e.target.value)}
                          className="sort-select"
                        >
                          <option value="name">Name (A–Z)</option>
                          <option value="current-streak">Current Streak (High → Low)</option>
                          <option value="created">Recently Created</option>
                        </select>
                        <ChevronDown size={16} className="sort-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading habits...</p>
                </div>
              ) : habits.length === 0 ? (
                <div className="empty-state">
                  <Target size={48} className="empty-icon" />
                  <h3>No habits yet</h3>
                  <p>Create your first habit to start building consistency!</p>
                </div>
              ) : (
                <>
                  {habits.length > 0 && (
                    <div className="habits-results">
                      <span className="results-count">
                        {getFilteredAndSortedHabits().length} of {habits.length} habits
                      </span>
                    </div>
                  )}
                  <div className="habits-grid">
                    {getFilteredAndSortedHabits().length === 0 ? (
                      <div className="empty-state">
                        <Target size={48} className="empty-icon" />
                        <h3>No habits match your filters</h3>
                        <p>Try adjusting your filter settings or create a new habit.</p>
                        <button
                          onClick={() => setHabitFilter("all")}
                          className="btn btn-secondary"
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      getFilteredAndSortedHabits().map((habit) => (
                        <div key={habit.id} className="habit-card">
                          <div className="habit-card-header">
                            <div className="habit-card-info">
                              <h3 className="habit-card-name">{habit.name}</h3>
                              {habit.description && (
                                <p className="habit-card-description">{habit.description}</p>
                              )}
                            </div>
                            <div
                              className="habit-card-color"
                              style={{ backgroundColor: habit.color }}
                            />
                          </div>

                          <div className="habit-stats">
                            <div className="habit-stat">
                              <Flame size={16} />
                              <span className="stat-value">{habit.current_streak || 0}</span>
                              <span className="stat-label">Current</span>
                            </div>
                            <div className="habit-stat">
                              <Target size={16} />
                              <span className="stat-value">{habit.best_streak || 0}</span>
                              <span className="stat-label">Best</span>
                            </div>
                            <div className="habit-stat">
                              <Check size={16} />
                              <span className="stat-value">{habit.total_completions || 0}</span>
                              <span className="stat-label">Total</span>
                            </div>
                          </div>

                          <div className="habit-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setEditingHabit(habit);
                                setShowHabitForm(true);
                              }}
                              title="Edit habit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteHabit(habit.id)}
                              title="Delete habit"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "share" && (
            <div className="share-section">
              <div className="share-header">
                <h2>Progress & History</h2>
                <p>Track your achievements and share your progress</p>
              </div>

              {/* Today's Habits Checklist */}
              <div className="share-today-section">
                <h3>
                  <Calendar size={20} />
                  Today's Habits
                </h3>
                <div className="share-today-grid">
                  {getTodayHabitsForShare().length === 0 ? (
                    <div className="share-empty-state">
                      <p>No active habits for today</p>
                    </div>
                  ) : (
                    getTodayHabitsForShare().map((habit) => (
                      <div key={habit.id} className={`share-habit-item ${habit.completed_today ? 'completed' : ''}`}>
                        <div className="share-habit-checkbox">
                          {habit.completed_today && <Check size={14} />}
                        </div>
                        <span className="share-habit-name">{habit.name}</span>
                        <div className="share-habit-streak">
                          <Flame size={14} />
                          <span>{habit.current_streak || 0}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Weekly Progress Grid */}
              <div className="share-weekly-section">
                <h3>
                  <BarChart3 size={20} />
                  Weekly Progress
                </h3>
                <div className="weekly-progress-container">
                  {getWeeklyProgress().filter(h => h.is_active).length === 0 ? (
                    <div className="share-empty-state">
                      <p>No active habits to display</p>
                    </div>
                  ) : (
                    <div className="weekly-progress-grid">
                      <div className="weekly-header">
                        <div className="habit-name-col">Habit</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                          <div key={day} className="day-col">{day}</div>
                        ))}
                        <div className="streak-col">Streak</div>
                      </div>
                      {getWeeklyProgress().filter(h => h.is_active).slice(0, 6).map((habit) => (
                        <div key={habit.id} className="weekly-habit-row">
                          <div className="habit-name-cell">
                            <div
                              className="habit-color-dot"
                              style={{ backgroundColor: habit.color }}
                            />
                            <span>{habit.name}</span>
                          </div>
                          {habit.weeklyData.map((day, index) => (
                            <div key={index} className="day-cell">
                              {day.completed ? (
                                <div className="completion-check">✅</div>
                              ) : (
                                <div className="completion-miss">❌</div>
                              )}
                            </div>
                          ))}
                          <div className="streak-cell">
                            <span className="current-streak">{habit.current_streak || 0}</span>
                            <span className="best-streak">/ {habit.best_streak || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Streak Statistics */}
              <div className="share-stats">
                <div className="share-stat-card">
                  <h3>
                    <Flame size={20} />
                    Current Streaks
                  </h3>
                  <div className="streak-list">
                    {habits.filter(h => h.current_streak > 0).map(habit => (
                      <div key={habit.id} className="streak-item">
                        <div
                          className="streak-color"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="streak-name">{habit.name}</span>
                        <div className="streak-counts">
                          <span className="streak-count">{habit.current_streak}</span>
                          <span className="streak-best">/ {habit.best_streak || 0}</span>
                        </div>
                      </div>
                    ))}
                    {habits.filter(h => h.current_streak > 0).length === 0 && (
                      <p className="no-streaks">No active streaks yet. Complete some habits to build streaks!</p>
                    )}
                  </div>
                </div>

                <div className="share-stat-card">
                  <h3>
                    <TrendingUp size={20} />
                    Achievement Stats
                  </h3>
                  <div className="achievement-stats">
                    <div className="achievement-item">
                      <span className="achievement-number">{habits.filter(h => h.is_active).length}</span>
                      <span className="achievement-label">Active Habits</span>
                    </div>
                    <div className="achievement-item">
                      <span className="achievement-number">{habits.reduce((sum, h) => sum + (h.total_completions || 0), 0)}</span>
                      <span className="achievement-label">Total Completions</span>
                    </div>
                    <div className="achievement-item">
                      <span className="achievement-number">{Math.max(...habits.map(h => h.best_streak || 0), 0)}</span>
                      <span className="achievement-label">Longest Streak</span>
                    </div>
                    <div className="achievement-item">
                      <span className="achievement-number">{habits.reduce((sum, h) => sum + (h.current_streak || 0), 0)}</span>
                      <span className="achievement-label">Total Active Days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="share-actions">
                <button
                  className="btn btn-primary"
                  onClick={downloadProgressCard}
                >
                  <Download size={16} />
                  Download Progress Card
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={exportHabitsData}
                >
                  <Upload size={16} />
                  Export Data as CSV
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-header">
                <h2>Profile</h2>
              </div>

              <div className="profile-content">
                <div className="profile-info-card">
                  <h3>Account Information</h3>
                  {profile && (
                    <>
                      {!isEditingProfile ? (
                        <div className="profile-details">
                          <div className="profile-avatar-section">
                            <div className="profile-avatar">
                              <img
                                src={getAvatarUrl(profile, 80)}
                                alt="Profile Avatar"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="avatar-fallback" style={{ display: 'none' }}>
                                {getUserInitials(profile.name)}
                              </div>
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Name</label>
                            <span>{profile.name}</span>
                          </div>
                          <div className="profile-field">
                            <label>Email</label>
                            <span>{profile.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="profile-edit-form">
                          <div className="profile-avatar-section">
                            <div className="profile-avatar">
                              <img
                                src={avatarPreview || getAvatarUrl(profile, 80)}
                                alt="Profile Avatar"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="avatar-fallback" style={{ display: 'none' }}>
                                {getUserInitials(profileName || profile.name)}
                              </div>
                              <div className="avatar-upload-overlay">
                                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                                  <Camera size={20} />
                                </label>
                                <input
                                  id="avatar-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarFileChange}
                                  className="avatar-upload-input"
                                />
                              </div>
                            </div>

                            {avatarFile && (
                              <div className="avatar-actions">
                                <button
                                  onClick={handleAvatarUpload}
                                  disabled={avatarUploading}
                                  className="btn btn-primary btn-sm"
                                >
                                  {avatarUploading ? 'Uploading...' : 'Save Avatar'}
                                </button>
                                <button
                                  onClick={() => {
                                    setAvatarFile(null);
                                    setAvatarPreview(null);
                                  }}
                                  className="btn btn-secondary btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            {profile?.avatar_url && !avatarFile && (
                              <div className="avatar-actions">
                                <button
                                  onClick={handleRemoveAvatar}
                                  disabled={avatarUploading}
                                  className="btn btn-danger btn-sm"
                                >
                                  {avatarUploading ? 'Removing...' : 'Remove Avatar'}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="form-input"
                              placeholder="Enter your name"
                              maxLength={100}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              value={profile.email}
                              className="form-input"
                              disabled
                            />
                            <p className="form-help">Email cannot be changed</p>
                          </div>

                          {error && (
                            <div className="alert alert-error">
                              {error}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="profile-actions">
                    {!isEditingProfile ? (
                      <button
                        onClick={handleEditProfile}
                        className="btn btn-secondary"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="edit-actions">
                        <button
                          onClick={handleSaveProfile}
                          disabled={profileLoading}
                          className="btn btn-primary"
                        >
                          {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEditProfile}
                          disabled={profileLoading}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-settings-card">
                  <h3>Preferences</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-name">Theme</span>
                      <span className="setting-description">Choose your preferred theme</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="theme-toggle-profile"
                    >
                      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <HabitForm
        isOpen={showHabitForm}
        onClose={() => {
          setShowHabitForm(false);
          setEditingHabit(null);
        }}
        onSubmit={editingHabit ? handleEditHabit : handleCreateHabit}
        initialData={editingHabit}
      />

      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (!editingId) clearForm();
        }}
        notesCount={notes.length}
        privateNotesCount={privateNotes.length}
        draftsCount={drafts.length}
        habitsCount={habits.length}
        todayHabitsCount={todayHabits.length}
      />

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .auth-required {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg-primary);
        }

        .auth-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          width: 100%;
        }

        .auth-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .auth-card h2 {
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .auth-card p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .auth-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .notes-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .note-form {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 2rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .form-header-left h2 {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .form-header-right {
          display: flex;
          align-items: center;
        }

        .privacy-toggle-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--bg-tertiary);
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .privacy-toggle-header:hover {
          background: var(--bg-accent);
          border-color: var(--border-secondary);
        }

        .privacy-toggle-header input[type="checkbox"]:checked + .privacy-label-header {
          color: var(--accent-primary);
        }

        .privacy-label-header {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          font-weight: 500;
          user-select: none;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .content-section {
          flex: 1;
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

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
        }

        .empty-state p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .note-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .note-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .draft-card {
          border-left: 4px solid var(--warning);
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .note-title {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
          flex: 1;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 0.375rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .action-btn:hover {
          color: var(--text-primary);
        }

        .edit-btn:hover {
          background: var(--bg-accent);
          color: var(--accent-primary);
        }

        .delete-btn:hover {
          background: var(--bg-accent);
          color: var(--error);
        }

        .publish-btn:hover {
          background: var(--bg-accent);
          color: var(--success);
        }

        .note-body {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .draft-badge {
          background: var(--warning);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.625rem;
          text-transform: uppercase;
        }

        .private-badge {
          background: var(--accent-primary);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.625rem;
          text-transform: uppercase;
        }

        .private-card {
          border-left: 4px solid var(--accent-primary);
        }

        .privacy-checkbox {
          width: 1rem;
          height: 1rem;
          accent-color: var(--accent-primary);
        }

        .note-date {
          font-size: 0.75rem;
        }



        /* Today Tab Styles */
        .today-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .today-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .today-header h2 {
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .today-date {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .habits-checklist {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .habit-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
        }

        .habit-item:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 2px 8px var(--shadow);
        }

        .habit-item.completed {
          background: var(--bg-accent);
          border-color: var(--success);
        }

        .habit-toggle {
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .habit-checkbox {
          width: 2rem;
          height: 2rem;
          border: 2px solid var(--border-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: white;
        }

        .habit-item.completed .habit-checkbox {
          background: var(--success);
          border-color: var(--success);
        }

        .habit-info {
          flex: 1;
        }

        .habit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .habit-name {
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .habit-streak {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--warning);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .habit-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .habit-color-indicator {
          width: 4px;
          height: 100%;
          position: absolute;
          right: 0;
          top: 0;
          border-radius: 0 12px 12px 0;
        }

        .today-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Habits Tab Styles */
        .habits-section {
          max-width: 1000px;
          margin: 0 auto;
        }

        .habits-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .habits-header h2 {
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .habits-filters {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-section,
        .sort-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .filter-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-pill {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .filter-pill:hover {
          background: var(--bg-accent);
          border-color: var(--border-secondary);
          color: var(--text-primary);
        }

        .filter-pill.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .sort-section {
          align-items: flex-start;
        }

        .sort-dropdown {
          position: relative;
          display: inline-block;
        }

        .sort-select {
          appearance: none;
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 200px;
        }

        .sort-select:hover {
          background: var(--bg-accent);
          border-color: var(--border-secondary);
        }

        .sort-select:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .sort-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .habits-results {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.75rem 0;
        }

        .results-count {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .habit-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .habit-card:hover {
          border-color: var(--border-secondary);
          box-shadow: 0 4px 12px var(--shadow);
        }

        .habit-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .habit-card-info {
          flex: 1;
        }

        .habit-card-name {
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .habit-card-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .habit-card-color {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .habit-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .habit-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 500;
        }

        .habit-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        /* Notes Tab Styles */
        .notes-section {
          max-width: 1000px;
          margin: 0 auto;
        }

        .notes-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .notes-tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }

        .notes-tab:hover {
          color: var(--text-primary);
        }

        .notes-tab.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        /* Share Tab Styles */
        .share-section {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .share-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .share-header h2 {
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .share-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        /* Today's Habits Section */
        .share-today-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .share-today-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .share-today-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 0.75rem;
        }

        .share-habit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .share-habit-item.completed {
          background: var(--bg-accent);
          border-color: var(--success);
        }

        .share-habit-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid var(--border-secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .share-habit-item.completed .share-habit-checkbox {
          background: var(--success);
          border-color: var(--success);
        }

        .share-habit-name {
          flex: 1;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.875rem;
        }

        .share-habit-streak {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--warning);
          font-weight: 600;
          font-size: 0.75rem;
        }

        /* Weekly Progress Section */
        .share-weekly-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .share-weekly-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .weekly-progress-container {
          overflow-x: auto;
        }

        .weekly-progress-grid {
          display: grid;
          grid-template-columns: 1fr repeat(7, 40px) 80px;
          gap: 0.5rem;
          min-width: 600px;
        }

        .weekly-header {
          display: contents;
        }

        .habit-name-col,
        .day-col,
        .streak-col {
          padding: 0.5rem 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-align: center;
          border-bottom: 1px solid var(--border-primary);
        }

        .habit-name-col {
          text-align: left;
          padding-left: 0;
        }

        .streak-col {
          text-align: center;
        }

        .weekly-habit-row {
          display: contents;
        }

        .habit-name-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.25rem 0.75rem 0;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .habit-color-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .day-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 0.25rem;
        }

        .completion-check,
        .completion-miss {
          font-size: 0.875rem;
        }

        .streak-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.75rem 0.25rem;
          font-size: 0.875rem;
        }

        .current-streak {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .best-streak {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        /* Statistics Section */
        .share-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .share-stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .share-stat-card h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .streak-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .streak-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .streak-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .streak-name {
          flex: 1;
          color: var(--text-primary);
          font-weight: 500;
        }

        .streak-counts {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .streak-count {
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .streak-best {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .achievement-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .achievement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          text-align: center;
        }

        .achievement-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 0.25rem;
        }

        .achievement-label {
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .no-streaks {
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }

        .share-empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
        }

        .share-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* Profile Tab Styles */
        .profile-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .profile-header h2 {
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-info-card,
        .profile-settings-card,
        .profile-danger-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .profile-info-card h3,
        .profile-settings-card h3,
        .profile-danger-card h3 {
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .profile-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-field label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .profile-field span {
          color: var(--text-primary);
        }

        .profile-avatar-section {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          border: 3px solid var(--border-primary);
        }

        .avatar-upload-overlay {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--accent-primary);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid var(--bg-primary);
        }

        .avatar-upload-overlay:hover {
          background: var(--accent-secondary);
          transform: scale(1.1);
        }

        .avatar-upload-btn {
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-upload-input {
          display: none;
        }

        .avatar-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          width: 100%;
          height: 100%;
          background: var(--accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
        }

        .avatar-help {
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .profile-edit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.875rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled {
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .form-help {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .profile-actions {
          margin-top: 1rem;
        }

        .edit-actions {
          display: flex;
          gap: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
        }

        .setting-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .setting-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .theme-toggle-profile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-primary);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle-profile:hover {
          background: var(--bg-accent);
          border-color: var(--border-secondary);
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
            padding-bottom: 6rem; /* Space for mobile navigation */
          }

          .filter-group {
            gap: 1rem;
          }

          .sort-section {
            align-items: stretch;
          }

          .note-form {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .note-card {
            padding: 1rem;
          }

          .note-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .note-actions {
            align-self: flex-end;
          }

          /* Habit tracker mobile styles */
          .today-header h2 {
            font-size: 1.5rem;
          }

          .habits-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .habits-header h2 {
            font-size: 1.5rem;
          }

          .habits-filters {
            padding: 1rem;
          }

          .filter-group {
            gap: 1rem;
          }

          .filter-pills {
            gap: 0.5rem;
          }

          .filter-pill {
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }

          .sort-select {
            width: 100%;
            min-width: unset;
          }

          .habits-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .habit-card {
            padding: 1rem;
          }

          .habit-item {
            padding: 1rem;
          }

          .habit-name {
            font-size: 1rem;
          }

          .today-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          /* Share and Profile mobile styles */
          .share-section {
            gap: 1.5rem;
          }

          .share-today-section,
          .share-weekly-section {
            padding: 1rem;
          }

          .share-today-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .share-habit-item {
            padding: 0.5rem;
          }

          .weekly-progress-grid {
            grid-template-columns: 1fr repeat(7, 35px) 70px;
            gap: 0.25rem;
            font-size: 0.75rem;
          }

          .habit-name-col,
          .day-col,
          .streak-col {
            font-size: 0.6875rem;
            padding: 0.375rem 0.125rem;
          }

          .habit-name-cell {
            font-size: 0.75rem;
            padding: 0.5rem 0.125rem 0.5rem 0;
          }

          .day-cell,
          .streak-cell {
            padding: 0.5rem 0.125rem;
          }

          .completion-check,
          .completion-miss {
            font-size: 0.75rem;
          }

          .share-stats {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .share-stat-card {
            padding: 1rem;
          }

          .achievement-stats {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .achievement-item {
            padding: 0.75rem;
          }

          .achievement-number {
            font-size: 1.25rem;
          }

          .achievement-label {
            font-size: 0.6875rem;
          }

          .share-actions {
            flex-direction: column;
            align-items: center;
          }

          .profile-content {
            gap: 1rem;
          }

          .edit-actions {
            flex-direction: column;
          }

          .profile-avatar {
            width: 60px;
            height: 60px;
          }

          .avatar-fallback {
            font-size: 1.5rem;
          }

          .avatar-upload-overlay {
            width: 24px;
            height: 24px;
          }

          .avatar-actions {
            flex-direction: column;
            gap: 0.375rem;
          }

          .avatar-help {
            font-size: 0.6875rem;
          }

          .profile-info-card,
          .profile-settings-card,
          .profile-danger-card {
            padding: 1rem;
          }

          .setting-item {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .theme-toggle-profile {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 0.75rem;
            padding-bottom: 6rem;
          }

          .note-form {
            padding: 1rem;
          }

          .form-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .form-header-left h2 {
            font-size: 1.125rem;
          }

          .form-header-right {
            width: 100%;
          }

          .privacy-toggle-header {
            width: 100%;
            justify-content: center;
          }

          .habits-filters {
            padding: 0.75rem;
          }

          .filter-group {
            gap: 0.75rem;
          }

          .filter-label {
            font-size: 0.8125rem;
          }

          .filter-pills {
            gap: 0.375rem;
          }

          .filter-pill {
            padding: 0.25rem 0.625rem;
            font-size: 0.75rem;
          }

          .sort-select {
            padding: 0.375rem 2rem 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }

          .notes-grid {
            gap: 0.75rem;
          }

          .note-card {
            padding: 0.75rem;
          }

          .note-title {
            font-size: 0.875rem;
          }

          .note-body {
            font-size: 0.8125rem;
          }

          /* Extra small mobile Share styles */
          .share-today-section,
          .share-weekly-section,
          .share-stat-card {
            padding: 0.75rem;
          }

          .share-today-section h3,
          .share-weekly-section h3,
          .share-stat-card h3 {
            font-size: 1rem;
          }

          .weekly-progress-grid {
            grid-template-columns: 1fr repeat(7, 30px) 60px;
            min-width: 400px;
          }

          .habit-name-col,
          .day-col,
          .streak-col {
            font-size: 0.625rem;
            padding: 0.25rem 0.0625rem;
          }

          .habit-name-cell {
            font-size: 0.6875rem;
          }

          .completion-check,
          .completion-miss {
            font-size: 0.6875rem;
          }

          .achievement-stats {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .achievement-item {
            padding: 0.5rem;
          }

          .achievement-number {
            font-size: 1.125rem;
          }

          .share-actions {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}