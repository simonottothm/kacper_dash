import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import LoginForm from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    const resolved = await searchParams;
    const redirectTo = resolved.redirect || "/app";
    redirect(redirectTo);
  }

  const resolved = await searchParams;
  const redirectTo = resolved.redirect;

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-semibold text-2xl text-[var(--text)]">Kasper</span>
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text)]">
            Sign in to your account
          </h2>
        </div>
        <div className="bg-card border border-app rounded-2xl shadow-app-md p-8">
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}

