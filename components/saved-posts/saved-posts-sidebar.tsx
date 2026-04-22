"use client";

import { Bookmark } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function SavedPostsSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 sticky top-24">
      <div>
        <h3 className="font-semibold text-sm text-muted-foreground mb-4 px-2 uppercase tracking-wider">
          Personal
        </h3>
        <nav className="space-y-1">
          <Link
            href="/saved-posts"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/saved-posts"
                ? "bg-purple-500/10 text-purple-400"
                : "text-foreground hover:bg-muted/50"
            )}
          >
            <Bookmark className="w-5 h-5" />
            Saved Posts
          </Link>
        </nav>
      </div>
    </div>
  );
}
