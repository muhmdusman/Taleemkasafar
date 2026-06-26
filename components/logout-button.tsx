"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <button
      onClick={logout}
      className="border-2 border-black bg-white px-4 py-2 font-headline text-sm font-bold uppercase tracking-tight transition-all hover:bg-surface-container active:translate-x-[2px] active:translate-y-[2px]"
    >
      Logout
    </button>
  );
}
