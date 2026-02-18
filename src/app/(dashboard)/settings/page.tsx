"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";

/* ── icons ── */
const icons = {
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  palette: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="8" r="1.5" fill="currentColor" /><circle cx="8" cy="12" r="1.5" fill="currentColor" /><circle cx="16" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  lock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  sun: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  save: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
};

/* ── toggle switch ── */
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-10 h-5 rounded-full relative cursor-pointer shrink-0"
      style={{
        backgroundColor: enabled ? "var(--accent)" : "var(--border)",
        transition: "background-color 0.2s ease",
      }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full"
        style={{
          left: enabled ? "calc(100% - 18px)" : "2px",
          backgroundColor: enabled ? "var(--btn-text)" : "var(--muted)",
          transition: "left 0.2s ease, background-color 0.2s ease",
        }}
      />
    </button>
  );
}

/* ── section card wrapper ── */
function Section({
  icon,
  title,
  delay = "",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  delay?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-fade-up ${delay}`}
      style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
          {title}
        </h3>
      </div>
      <div className="px-5 py-6">{children}</div>
    </div>
  );
}

/* ── toast notification ── */
function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 text-sm animate-fade-up"
      style={{
        backgroundColor: type === "success" ? "var(--class-c1)" : "var(--accent)",
        color: "#fff",
        fontFamily: "var(--font-body)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      }}
    >
      {type === "success" ? icons.check : icons.lock}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notifications — persisted in localStorage
  const [notifications, setNotifications] = useState([
    { key: "order_updates", label: "Order Updates", desc: "Receive notifications when order status changes", enabled: true },
    { key: "low_stock", label: "Low Stock Alerts", desc: "Get alerted when inventory falls below threshold", enabled: true },
    { key: "shipment_tracking", label: "Shipment Tracking", desc: "Updates on shipment delivery status", enabled: true },
    { key: "weekly_reports", label: "Weekly Reports", desc: "Automated weekly performance summary", enabled: false },
    { key: "system_updates", label: "System Updates", desc: "Notifications about system maintenance", enabled: false },
  ]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Populate form from auth user
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  // Load notification preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bakal_notification_prefs");
      if (saved) {
        const prefs = JSON.parse(saved) as Record<string, boolean>;
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, enabled: prefs[n.key] ?? n.enabled }))
        );
      }
    } catch { /* ignore */ }
  }, []);

  function toggleNotification(key: string) {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n));
      try {
        const prefs: Record<string, boolean> = {};
        next.forEach((n) => (prefs[n.key] = n.enabled));
        localStorage.setItem("bakal_notification_prefs", JSON.stringify(prefs));
      } catch { /* ignore */ }
      return next;
    });
  }

  // Profile update
  async function handleProfileUpdate() {
    if (!fullName.trim()) {
      showToast("Name cannot be empty", "error");
      return;
    }
    setProfileSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (error) throw error;
      showToast("Profile updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      showToast(msg, "error");
    } finally {
      setProfileSaving(false);
    }
  }

  // Password change
  async function handlePasswordChange() {
    if (!currentPassword) {
      showToast("Enter your current password", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setPasswordSaving(true);
    try {
      // Re-authenticate with current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });
      if (signInErr) {
        showToast("Current password is incorrect", "error");
        return;
      }
      // Update to new password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showToast("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      showToast(msg, "error");
    } finally {
      setPasswordSaving(false);
    }
  }

  const isDark = theme === "dark";

  const initials = (fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const role = user?.user_metadata?.role ?? "Team Member";
  const joinedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      {/* ── PROFILE SECTION ── */}
      <Section icon={icons.user} title="Profile">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-16 h-16 flex items-center justify-center text-lg font-semibold uppercase"
              style={{ backgroundColor: "var(--accent)", color: "var(--btn-text)" }}
            >
              {initials}
            </div>
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              {role}
            </span>
            {joinedAt && (
              <span
                className="text-[10px] tracking-wide"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                Since {joinedAt}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-foreground outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderBottom: "2px solid var(--border)",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
                  onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-2.5 text-sm text-muted outline-none cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--background)",
                    borderBottom: "2px solid var(--border)",
                  }}
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleProfileUpdate}
                disabled={profileSaving}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!profileSaving) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {icons.save}
                {profileSaving ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── APPEARANCE SECTION ── */}
      <Section icon={icons.palette} title="Appearance" delay="delay-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground font-medium uppercase tracking-wide">Theme</p>
            <p className="text-xs text-muted mt-1" style={{ fontFamily: "var(--font-body)" }}>
              Switch between light and dark mode
            </p>
          </div>
          {isClient && mounted && (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                borderBottom: "2px solid var(--border)",
                fontFamily: "var(--font-body)",
                transition: "border-color 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
            >
              {isDark ? icons.sun : icons.moon}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          )}
        </div>
      </Section>

      {/* ── NOTIFICATIONS SECTION ── */}
      <Section icon={icons.bell} title="Notifications" delay="delay-300">
        <div className="space-y-0">
          {notifications.map((item, i) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-4"
              style={{
                borderBottom: i < notifications.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <p className="text-sm text-foreground font-medium uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-xs text-muted mt-1" style={{ fontFamily: "var(--font-body)" }}>
                  {item.desc}
                </p>
              </div>
              <Toggle enabled={item.enabled} onToggle={() => toggleNotification(item.key)} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── SECURITY SECTION ── */}
      <Section icon={icons.lock} title="Security" delay="delay-400">
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              Current Password
            </label>
            <div className="relative max-w-sm">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-10 text-sm text-foreground outline-none placeholder:text-muted/50"
                style={{
                  backgroundColor: "var(--background)",
                  borderBottom: "2px solid var(--border)",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {showCurrent ? icons.eyeOff : icons.eye}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              New Password
            </label>
            <div className="relative max-w-sm">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 pr-10 text-sm text-foreground outline-none placeholder:text-muted/50"
                style={{
                  backgroundColor: "var(--background)",
                  borderBottom: "2px solid var(--border)",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {showNew ? icons.eyeOff : icons.eye}
              </button>
            </div>
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <div className="max-w-sm mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength =
                      newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                      : newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 3
                      : newPassword.length >= 6 ? 2
                      : 1;
                    const colors = ["var(--accent)", "var(--draft)", "var(--class-c1)", "var(--class-c1)"];
                    return (
                      <div
                        key={level}
                        className="flex-1 h-1"
                        style={{
                          backgroundColor: level <= strength ? colors[strength - 1] : "var(--border)",
                          transition: "background-color 0.2s ease",
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {newPassword.length < 6 ? "Too short" : newPassword.length < 8 ? "Weak" : newPassword.length < 12 || !/[^A-Za-z0-9]/.test(newPassword) ? "Good" : "Strong"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-muted mb-2">
              Confirm New Password
            </label>
            <div className="relative max-w-sm">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 pr-10 text-sm text-foreground outline-none placeholder:text-muted/50"
                style={{
                  backgroundColor: "var(--background)",
                  borderBottom: `2px solid ${confirmPassword && confirmPassword !== newPassword ? "var(--accent)" : "var(--border)"}`,
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = confirmPassword && confirmPassword !== newPassword ? "var(--accent)" : "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = confirmPassword && confirmPassword !== newPassword ? "var(--accent)" : "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {showConfirm ? icons.eyeOff : icons.eye}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-[10px] mt-1" style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                Passwords do not match
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-text)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => { if (!passwordSaving) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {icons.lock}
              {passwordSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </Section>
    </>
  );
}
