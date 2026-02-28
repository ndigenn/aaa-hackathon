"use client";

import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
    const [form, setForm] = useState({
        emailOrUsername: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
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

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Western Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-300 via-amber-400 to-yellow-600" />
            <div className="absolute inset-0 bg-[url('/western-bg.jpg')] bg-cover bg-center opacity-20" />

            {/* Card */}
            <div className="relative bg-white/95 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border-4 border-amber-700">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="AraAra Alliance Logo"
                        width={288}
                        height={120}
                        className="h-auto w-72"
                        priority
                    />
                </div>

                <h2 className="text-center text-lg font-semibold text-amber-800 mb-6">
                    Welcome Back, Partner
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="emailOrUsername"
                        placeholder="Email or Username"
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-amber-500 focus:ring-2 focus:ring-amber-600 outline-none"
                    />

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition shadow-md"
                    >
                        Continue to Auth0
                    </button>
                </form>

                <div className="flex justify-between items-center mt-4 text-sm text-amber-900">
                    <a href="/auth/login" className="underline">
                        Forgot password?
                    </a>
                    <a href="/signup" className="underline font-medium">
                        Create account
                    </a>
                </div>
            </div>
        </div>
    );
}
