import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="text-6xl mb-4">🍽️</div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-8">This page doesn&apos;t exist or has been removed.</p>
      <Link
        href="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
      >
        Go Home
      </Link>
    </main>
  );
}
