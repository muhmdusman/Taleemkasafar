"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";

type NavItem = { href: string; label: string; icon: string };

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "dashboard" },
  { href: "/subjects", label: "My Subjects", icon: "menu_book" },
  { href: "/mock", label: "Mock Tests", icon: "quiz" },
  { href: "/performance", label: "Performance", icon: "insights" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed left sidebar (desktop). Brand = Taleem ka Safar. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-4 border-r-2 border-black bg-white p-4 md:flex">
      <div className="mb-6 flex flex-col gap-1">
        <span className="font-headline text-xl font-bold tracking-tighter text-black">
          Taleem ka Safar
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Entry Test Prep
        </span>
      </div>

      <nav className="flex flex-grow flex-col gap-2">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 border-2 border-black bg-brand p-3 font-headline font-bold text-white"
                  : "flex items-center gap-3 p-3 font-headline font-bold text-black transition-transform hover:translate-x-1"
              }
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t-2 border-black pt-4">
        <Link
          href="/help"
          className="flex items-center gap-3 p-3 font-headline font-bold text-black transition-transform hover:translate-x-1"
        >
          <Icon name="help" />
          Help Center
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 p-3 text-left font-headline font-bold text-black transition-transform hover:translate-x-1"
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}
