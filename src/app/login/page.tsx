"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  function validate() {
    const next: typeof errors = {};
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
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
          {/* Beam 1 — top-left to mid */}
          <div
            className="absolute"
            style={{
              top: "-5%",
              left: "8%",
              width: "2px",
              height: "60%",
              backgroundColor: "var(--beam)",
              borderRight: "1px solid var(--beam-border)",
              transform: "rotate(25deg)",
              transformOrigin: "top left",
            }}
          />
          {/* Beam 2 — right side */}
          <div
            className="absolute"
            style={{
              top: "10%",
              right: "15%",
              width: "2px",
              height: "70%",
              backgroundColor: "var(--beam)",
              borderRight: "1px solid var(--beam-border)",
              transform: "rotate(-15deg)",
              transformOrigin: "top right",
            }}
          />
          {/* Beam 3 — horizontal */}
          <div
            className="absolute"
            style={{
              top: "35%",
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
              top: "65%",
              left: "0",
              width: "100%",
              height: "1px",
              backgroundColor: "var(--steel-line)",
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
        <div className="absolute bottom-[25%] left-[20%] pointer-events-none">
          {[3, 4, 2.5, 3.5, 3].map((size, i) => (
            <div
              key={`sp-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: "var(--spark)",
                left: `${i * 18}px`,
                animation: `sparkFloat ${2 + i * 0.5}s ease-out infinite`,
                animationDelay: `${i * 0.6}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Ember dots */}
        <div className="absolute bottom-[10%] right-[25%] pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={`em-${i}`}
              className="absolute rounded-full"
              style={{
                width: "4px",
                height: "4px",
                backgroundColor: "var(--ember)",
                left: `${i * 25}px`,
                top: `${i * -15}px`,
                animation: `emberPulse ${2 + i * 0.7}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
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
            Welcome
            <br />
            <span style={{ color: "var(--panel-accent)" }}>
              back.
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
            Sign in to continue where you left off.
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
              Sign in
            </h1>
            <p className="mt-2 text-muted text-sm">
              Enter your credentials to access your account
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

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
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
                  autoComplete="current-password"
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

            {/* Forgot password */}
            <div className="animate-fade-up delay-300 flex justify-end">
              <button
                type="button"
                className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <div className="animate-fade-up delay-400">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-sm font-medium tracking-wide uppercase transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                }}
              >
                {submitting ? "Signing In..." : "Sign In"}
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

          {/* Sign up link */}
          <p className="animate-fade-up delay-500 mt-8 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
