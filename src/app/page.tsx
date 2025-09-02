import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to ATHELETE-ALLY</h1>
      <Link href="/onboarding/purpose" className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
        Start Onboarding
      </Link>
    </main>
  );
}