"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .login-bg {
          position: fixed;
          inset: 0;
          background: #0a0a0a;
          overflow: hidden;
        }

        .login-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(163,230,53,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163,230,53,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .login-bg::after {
          content: '';
          position: absolute;
          top: -30%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(163,230,53,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 48px 40px;
          font-family: 'DM Sans', sans-serif;
          animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #a3e635;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon svg {
          width: 18px;
          height: 18px;
        }

        .logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .card-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }

        .card-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin: 0 0 32px;
          font-weight: 300;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }

        .field input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px 14px;
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }

        .field input::placeholder {
          color: rgba(255,255,255,0.18);
        }

        .field input:focus {
          border-color: rgba(163,230,53,0.5);
          background: rgba(163,230,53,0.04);
        }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #f87171;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .submit-btn {
          width: 100%;
          margin-top: 24px;
          padding: 13px;
          background: #a3e635;
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.3px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a3e635;
          animation: pulse 2s ease-in-out infinite;
          display: inline-block;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>

      <div className="login-bg" />

      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center", padding: "24px" }}>
        <div className="card">
          {/* Logo */}
          <div className="logo-mark">
            <div className="logo-icon">
              <svg viewBox="0 0 18 18" fill="none">
                <path d="M3 4l6 10 6-10" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-name">Vital</span>
          </div>

          <h1 className="card-title">Welcome back</h1>
          <p className="card-sub">Sign in to your account</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-msg">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6.5" stroke="#f87171"/>
                  <path d="M7 4v3.5M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="footer-note">
            <span className="pulse-dot" />
            Invite-only access
          </p>
        </div>
      </div>
    </>
  );
}
