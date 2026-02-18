"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) {
      next.name = "Name is required";
    }
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }
    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (error) {
      setAuthError(error.message);
      setSubmitting(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Left industrial panel */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-12"
        style={{
          backgroundColor: "var(--panel-bg-1)",
          transition: "background-color 0.4s ease",
        }}
      >
        {/* Logo */}
        <div className="absolute top-0 left-0 w-full px-6 pt-8 pb-6 z-20">
          <h1
            className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wider"
            style={{ color: "var(--panel-text)" }}
          >
            Regan
          </h1>
          <div
            className="mt-2 h-[2px] w-10"
            style={{ backgroundColor: "var(--panel-accent)" }}
          />
        </div>

        {/* Forge glow at bottom */}
        <div
          className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, var(--panel-glow) 0%, transparent 70%)`,
          }}
        />

        {/* Diagonal steel beams */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ overflow: "hidden" }}
        >
          {/* Beam 1 — steep left */}
          <div
            className="absolute"
            style={{
              top: "5%",
              left: "25%",
              width: "2px",
              height: "55%",
              backgroundColor: "var(--beam)",
              borderRight: "1px solid var(--beam-border)",
              transform: "rotate(-20deg)",
              transformOrigin: "top center",
            }}
          />
          {/* Beam 2 — right diagonal */}
          <div
            className="absolute"
            style={{
              top: "-5%",
              right: "10%",
              width: "2px",
              height: "65%",
              backgroundColor: "var(--beam)",
              borderRight: "1px solid var(--beam-border)",
              transform: "rotate(18deg)",
              transformOrigin: "top right",
            }}
          />
          {/* Beam 3 — horizontal upper */}
          <div
            className="absolute"
            style={{
              top: "30%",
              left: "0",
              width: "100%",
              height: "1px",
              backgroundColor: "var(--steel-line)",
            }}
          />
          {/* Beam 4 — horizontal lower */}
          <div
            className="absolute"
            style={{
              top: "60%",
              left: "0",
              width: "100%",
              height: "1px",
              backgroundColor: "var(--steel-line)",
            }}
          />
          {/* Beam 5 — cross brace */}
          <div
            className="absolute"
            style={{
              top: "30%",
              left: "50%",
              width: "2px",
              height: "30%",
              backgroundColor: "var(--beam)",
              borderRight: "1px solid var(--beam-border)",
              transform: "rotate(35deg)",
              transformOrigin: "top center",
            }}
          />
        </div>

        {/* Rivet pattern — top row */}
        <div className="absolute top-6 left-0 w-full flex justify-around pointer-events-none px-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={`rt-${i}`}
              className="rounded-full"
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "var(--rivet)",
                boxShadow: `inset 0 -1px 1px var(--rivet-highlight)`,
              }}
            />
          ))}
        </div>
        {/* Rivet pattern — bottom row */}
        <div className="absolute bottom-6 left-0 w-full flex justify-around pointer-events-none px-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={`rb-${i}`}
              className="rounded-full"
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "var(--rivet)",
                boxShadow: `inset 0 -1px 1px var(--rivet-highlight)`,
              }}
            />
          ))}
        </div>
        {/* Rivet pattern — mid left column */}
        <div className="absolute left-6 top-0 h-full flex flex-col justify-around pointer-events-none py-16">
          {[...Array(4)].map((_, i) => (
            <div
              key={`rl-${i}`}
              className="rounded-full"
              style={{
                width: "5px",
                height: "5px",
                backgroundColor: "var(--rivet)",
                boxShadow: `inset 0 -1px 1px var(--rivet-highlight)`,
              }}
            />
          ))}
        </div>

        {/* Corner bolt — top-left */}
        <div
          className="absolute top-5 left-5 rounded-full"
          style={{
            width: "12px",
            height: "12px",
            background: `radial-gradient(circle at 40% 40%, var(--rivet-highlight), var(--rivet) 60%)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
        {/* Corner bolt — top-right */}
        <div
          className="absolute top-5 right-5 rounded-full"
          style={{
            width: "12px",
            height: "12px",
            background: `radial-gradient(circle at 40% 40%, var(--rivet-highlight), var(--rivet) 60%)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
        {/* Corner bolt — bottom-left */}
        <div
          className="absolute bottom-5 left-5 rounded-full"
          style={{
            width: "12px",
            height: "12px",
            background: `radial-gradient(circle at 40% 40%, var(--rivet-highlight), var(--rivet) 60%)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
        {/* Corner bolt — bottom-right */}
        <div
          className="absolute bottom-5 right-5 rounded-full"
          style={{
            width: "12px",
            height: "12px",
            background: `radial-gradient(circle at 40% 40%, var(--rivet-highlight), var(--rivet) 60%)`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />

        {/* Spark particles */}
        <div className="absolute bottom-[30%] right-[30%] pointer-events-none">
          {[2.5, 3.5, 3, 4, 2].map((size, i) => (
            <div
              key={`sp-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: "var(--spark)",
                left: `${i * 15}px`,
                animation: `sparkFloat ${2.2 + i * 0.4}s ease-out infinite`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Ember dots */}
        <div className="absolute bottom-[15%] left-[35%] pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={`em-${i}`}
              className="absolute rounded-full"
              style={{
                width: "3px",
                height: "3px",
                backgroundColor: "var(--ember)",
                left: `${i * 20}px`,
                top: `${(i % 2) * -12}px`,
                animation: `emberPulse ${1.8 + i * 0.6}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Grain texture overlay */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            animation: "grainShift 8s steps(4) infinite",
            mixBlendMode: "overlay",
          }}
        />

        {/* Panel text content */}
        <div
          className="relative z-10 animate-slide-left p-8 backdrop-blur-sm"
          style={{
            backgroundColor: "var(--panel-content-bg)",
            borderLeft: "2px solid var(--panel-content-border)",
            transition: "background-color 0.4s ease, border-color 0.4s ease",
          }}
        >
          <div
            className="mb-6 h-[2px] w-16"
            style={{ backgroundColor: "var(--ember)" }}
          />
          <p
            className="font-[family-name:var(--font-display)] text-5xl leading-tight tracking-tight uppercase"
            style={{ color: "var(--panel-text)", transition: "color 0.4s ease" }}
          >
            Start your
            <br />
            <span style={{ color: "var(--panel-accent)" }}>
              journey.
            </span>
          </p>
          <p
            className="mt-4 text-sm max-w-xs leading-relaxed font-[family-name:var(--font-body)]"
            style={{
              color: "var(--panel-text-sub)",
              transition: "color 0.4s ease",
              letterSpacing: "0.05em",
            }}
          >
            Create an account and get started in seconds.
          </p>
          <div
            className="mt-8 h-[1px] w-32"
            style={{ backgroundColor: "var(--steel-line)" }}
          />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 animate-fade-up">
            <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground uppercase">
              Regan
            </p>
          </div>

          <div className="animate-fade-up delay-100">
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground uppercase">
              Create account
            </h1>
            <p className="mt-2 text-muted text-sm">
              Fill in your details to get started
            </p>
          </div>

          {authError && (
            <div
              className="mt-6 px-4 py-3 text-sm"
              style={{
                color: "var(--error)",
                backgroundColor: "rgba(139,50,50,0.08)",
                border: "1px solid var(--error)",
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
            {/* Name */}
            <div className="animate-fade-up delay-200">
              <label
                htmlFor="name"
                className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                className={`w-full bg-input-bg border-b-2 ${
                  errors.name ? "border-error" : "border-border"
                } px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent placeholder:text-muted/50`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-error">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="animate-fade-up delay-200">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`w-full bg-input-bg border-b-2 ${
                  errors.email ? "border-error" : "border-border"
                } px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent placeholder:text-muted/50`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-error">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="animate-fade-up delay-300">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={`w-full bg-input-bg border-b-2 ${
                    errors.password ? "border-error" : "border-border"
                  } px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent placeholder:text-muted/50 pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors text-xs uppercase tracking-wider cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="animate-fade-up delay-300">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium uppercase tracking-widest text-muted mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                className={`w-full bg-input-bg border-b-2 ${
                  errors.confirmPassword ? "border-error" : "border-border"
                } px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent placeholder:text-muted/50`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="animate-fade-up delay-400 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-sm font-medium tracking-wide uppercase transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                }}
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="animate-fade-up delay-500 mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign in link */}
          <p className="animate-fade-up delay-500 mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
