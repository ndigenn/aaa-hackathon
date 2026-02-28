"use client";

import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    emailOrUsername: "",
  });

  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    const params = new URLSearchParams({
      returnTo: "/home",
      prompt: "login",
    });

    const loginHint = form.emailOrUsername.trim();
    if (loginHint) {
      params.set("login_hint", loginHint);
    }

    window.location.href = `/auth/login?${params.toString()}`;
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    const email = form.emailOrUsername.trim();
    if (!email || !email.includes("@")) {
      setError("Enter your email above, then click Forgot password.");
      return;
    }

    setIsSendingReset(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Could not start password reset.");
        return;
      }

      setResetMessage(
        payload.message ??
          "If that email exists, a password reset link has been sent.",
      );
    } catch {
      setError("Network error while starting password reset.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120905] text-[#fae8c2]">
      <audio src="/home.mp3" autoPlay loop preload="auto" className="hidden" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,191,94,0.26)_0%,rgba(255,191,94,0)_38%),radial-gradient(circle_at_78%_25%,rgba(173,63,28,0.34)_0%,rgba(173,63,28,0)_45%),linear-gradient(180deg,#2b140c_0%,#140b07_55%,#0a0504_100%)]" />
        <div
          className="absolute inset-0 opacity-35"
          style={{ backgroundImage: "url('/landing_page.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,4,3,0.26)_0%,rgba(8,4,3,0.78)_65%,rgba(8,4,3,0.92)_100%)]" />
        <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-[#ffbd61]/20 blur-3xl" />
        <div className="absolute -right-14 bottom-20 h-56 w-56 rounded-full bg-[#a63e1e]/30 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-5 py-12 sm:px-8">
        <div className="grid w-full items-center gap-8 md:grid-cols-[1fr_430px]">
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-[0.35em] text-[#e5bb73]">Western Jackpot</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.94] text-[#ffe7b2]">
              Back To The
              <span className="block text-[#ffc965]">High-Stakes Table</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#f2d8aa]">
              Step into the saloon, stack your coins, and chase outlaw legends.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-[#f3cb84]/45 bg-[linear-gradient(170deg,rgba(90,46,20,0.94)_0%,rgba(46,24,12,0.96)_100%)] p-6 shadow-[0_26px_50px_rgba(0,0,0,0.5)] sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#ffca71]/22 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[#b34624]/30 blur-2xl" />

            <div className="relative flex justify-center">
              <Image
                src="/transparent_logo.png"
                alt="AAA Logo"
                width={220}
                height={110}
                className="h-auto w-44 drop-shadow-[0_0_16px_rgba(246,188,72,0.35)]"
                priority
              />
            </div>

            <div className="relative mt-3 rounded-2xl border border-[#f0bf72]/35 bg-[#2d170c]/60 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-[#eabf77]">Login</p>
              <p className="mt-1 text-sm text-[#f8e4bc]">Welcome back, partner.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
              <input
                type="text"
                name="emailOrUsername"
                placeholder="Email or Username"
                onChange={handleChange}
                className="w-full rounded-xl border border-[#f0bf72]/55 bg-[#fff2d5] px-4 py-3 text-[#572f18] placeholder:text-[#9f7440] outline-none ring-0 transition focus:border-[#ffd89a] focus:shadow-[0_0_0_3px_rgba(246,188,72,0.25)]"
              />

              {error ? <p className="text-sm text-[#ff8e8e]">{error}</p> : null}
              {resetMessage ? (
                <p className="text-sm text-[#9ef0b0]">{resetMessage}</p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-xl border border-[#ffe3ad]/85 bg-[linear-gradient(180deg,#ffe1a4_0%,#d69b3f_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#4a2a14] transition hover:brightness-105"
              >
                Continue to Auth0
              </button>
            </form>

            <div className="relative mt-4 flex items-center justify-between text-sm text-[#f1d8ad]">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSendingReset}
                className="underline decoration-[#d8a768] underline-offset-2 disabled:opacity-60"
              >
                {isSendingReset ? "Sending..." : "Forgot password?"}
              </button>
              <a href="/signup" className="font-semibold underline decoration-[#d8a768] underline-offset-2">
                Create account
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
