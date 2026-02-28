"use client";

import Image from "next/image";
import { useState } from "react";

export default function SignUpPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        console.log("User signed up:", form);
        setSuccess(true);
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
                        width={280}
                        height={120}
                        priority
                    />
                </div>

                <h2 className="text-center text-lg font-semibold text-amber-800 mb-6">
                    Join the Frontier
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-amber-500 focus:ring-2 focus:ring-amber-600 outline-none"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-amber-500 focus:ring-2 focus:ring-amber-600 outline-none"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-amber-500 focus:ring-2 focus:ring-amber-600 outline-none"
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        required
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg border border-amber-500 focus:ring-2 focus:ring-amber-600 outline-none"
                    />

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    {success && (
                        <p className="text-green-600 text-sm">
                            Account created successfully!
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition shadow-md"
                    >
                        Saddle Up
                    </button>
                </form>

                <p className="text-sm text-center mt-4 text-amber-900">
                    Already riding with us?{" "}
                    <a href="/login" className="underline font-medium">
                        Log in
                    </a>
                </p>
            </div>
        </div>
    );
}