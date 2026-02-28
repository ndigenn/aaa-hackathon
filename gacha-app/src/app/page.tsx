import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/landing_page.png')" }}
    >
      {/* Optional dark overlay for readability */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/western-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content container */}
      <div className="relative flex min-h-screen flex-col items-center justify-end pb-16">
        <div className="flex flex-col gap-4 items-center">
          <Link
            href="/signup"
            className="w-64 text-center rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition"
          >
            Sign Up
          </Link>

          <Link
            href="/guest"
            className="w-64 text-center rounded-lg bg-white/90 px-6 py-3 text-black font-semibold hover:bg-white transition"
          >
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
