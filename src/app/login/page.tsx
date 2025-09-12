import { getCsrfToken } from "next-auth/react";

export default async function LoginPage() {
  const csrfToken = await getCsrfToken();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Sign in to Buyer Lead Intake</h1>
      <form method="post" action="/api/auth/callback/credentials" className="flex flex-col gap-4 w-full max-w-xs">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken || ""} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="border rounded px-3 py-2" placeholder="demo@example.com" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition">Sign in (Demo)</button>
      </form>
      <div className="mt-6 text-gray-500 text-sm">Or sign in with a magic link:</div>
      <form method="post" action="/api/auth/signin/email" className="flex flex-col gap-2 w-full max-w-xs mt-2">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken || ""} />
        <input id="email-magic" name="email" type="email" required className="border rounded px-3 py-2" placeholder="your@email.com" />
        <button type="submit" className="bg-gray-700 text-white rounded px-4 py-2 font-semibold hover:bg-gray-800 transition">Send Magic Link</button>
      </form>
    </div>
  );
}
