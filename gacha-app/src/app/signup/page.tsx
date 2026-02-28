"use client";

import Image from "next/image";
import { useState } from "react";

export default function SignUpPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim();
    const email = form.email.trim();

    if (!username || !email) {
      setError("Please enter both a username and email.");
      return;
    }

    const params = new URLSearchParams({
      returnTo: "/home",
      screen_hint: "signup",
      prompt: "login",
    });

    const loginHint = email;
    if (loginHint) {
      params.set("login_hint", loginHint);
    }

    window.location.href = `/auth/login?${params.toString()}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#120905] text-[#fae8c2]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,191,94,0.22)_0%,rgba(255,191,94,0)_40%),radial-gradient(circle_at_82%_20%,rgba(177,59,33,0.34)_0%,rgba(177,59,33,0)_45%),linear-gradient(180deg,#2b140c_0%,#140b07_55%,#0a0504_100%)]" />
        <div
          className="absolute inset-0 opacity-35"
          style={{ backgroundImage: "url('/landing_page.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,4,3,0.24)_0%,rgba(8,4,3,0.78)_66%,rgba(8,4,3,0.92)_100%)]" />
        <div className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#ffc466]/18 blur-3xl" />
        <div className="absolute -right-14 bottom-24 h-56 w-56 rounded-full bg-[#aa401f]/28 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-5 py-12 sm:px-8">
        <div className="grid w-full items-center gap-8 md:grid-cols-[1fr_430px]">
          <div className="hidden md:block">
            <p className="text-xs uppercase tracking-[0.35em] text-[#e5bb73]">Open Seat</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.94] text-[#ffe7b2]">
              Join The Saloon
              <span className="block text-[#ffc965]">Build Your Posse</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#f2d8aa]">
              New recruits start with coin stacks and one mission: summon your legends.
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
              <p className="text-xs uppercase tracking-[0.22em] text-[#eabf77]">Sign Up</p>
              <p className="mt-1 text-sm text-[#f8e4bc]">Join the frontier.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#f0bf72]/55 bg-[#fff2d5] px-4 py-3 text-[#572f18] placeholder:text-[#9f7440] outline-none ring-0 transition focus:border-[#ffd89a] focus:shadow-[0_0_0_3px_rgba(246,188,72,0.25)]"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#f0bf72]/55 bg-[#fff2d5] px-4 py-3 text-[#572f18] placeholder:text-[#9f7440] outline-none ring-0 transition focus:border-[#ffd89a] focus:shadow-[0_0_0_3px_rgba(246,188,72,0.25)]"
              />

              {error ? <p className="text-sm text-[#ff8e8e]">{error}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl border border-[#ffe3ad]/85 bg-[linear-gradient(180deg,#ffe1a4_0%,#d69b3f_100%)] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#4a2a14] transition hover:brightness-105"
              >
                Continue to Auth0
              </button>
            </form>

            <p className="relative mt-4 text-center text-sm text-[#f1d8ad]">
              Already riding with us?{" "}
              <a href="/login" className="font-semibold underline decoration-[#d8a768] underline-offset-2">
                Log in
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
