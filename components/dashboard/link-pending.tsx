"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "./loading-indicators";

/**
 * Put inside a <Link>: shows a spinner in place of `children` (usually the
 * arrow or icon) while that link's navigation is pending. The spinner fades
 * in after a short delay, so instant (prefetched) navigations don't flash.
 */
export function LinkPendingIndicator({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return <>{children}</>;
  return (
    <span className={cn("inline-flex animate-fade-in-delayed items-center justify-center", className)}>
      <Spinner className="size-5" />
      <span className="sr-only">Loading</span>
    </span>
  );
}
