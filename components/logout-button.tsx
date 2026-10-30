"use client";

import { createClient } from "@/lib/supabase/client";
import { appButton } from "@/components/dashboard/styles";
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
      type="button"
      onClick={logout}
      className={appButton({ variant: "secondary", size: "sm" })}
    >
      Logout
    </button>
  );
}
