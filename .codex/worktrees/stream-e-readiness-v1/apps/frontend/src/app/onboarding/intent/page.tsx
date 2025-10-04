import IntentForm from '@/components/intent/IntentForm';

export default function IntentPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Tell Us Your Training Intent</h1>
        <p className="text-gray-300 mb-8">We’ll generate a personalized plan based on your goals and constraints.</p>
        <div className="bg-gray-800 rounded-lg p-6">
          <IntentForm />
        </div>
      </div>
    </main>
  );
}