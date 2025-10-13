"use client";

import { useState, type FormEvent } from 'react';

type CuratorLoginFormProps = {
  onAuthenticate: (token: string) => void;
  pending?: boolean;
  error?: string | null;
};

export function CuratorLoginForm({ onAuthenticate, pending = false, error }: CuratorLoginFormProps) {
  const [token, setToken] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) return;
    onAuthenticate(token.trim());
    setToken('');
  };

  return (
    <div className="mx-auto mt-24 w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8 shadow-xl">
      <h1 className="text-2xl font-semibold text-white">Curator Access</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sign in with a short-lived curator token issued by internal SSO. The token is stored locally
        in your browser and attached to subsequent API requests.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Access Token
          <textarea
            className="min-h-[120px] rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Paste your curator JWT..."
            value={token}
            onChange={(event) => setToken(event.target.value)}
            disabled={pending}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          disabled={pending}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

