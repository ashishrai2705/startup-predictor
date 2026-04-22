"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { SavedPostsSidebar } from "@/components/saved-posts/saved-posts-sidebar";
import { SavedPostsFeed } from "@/components/saved-posts/saved-posts-feed";
import { Bookmark } from "lucide-react";

export default function SavedPostsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Minimal Sidebar — only for this page */}
          <div className="hidden lg:block lg:col-span-1">
            <SavedPostsSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3 space-y-6">
            {/* Your Saved Library card */}
            <div className="flex items-center gap-3 mb-2 glass-card p-6 rounded-2xl border border-purple-500/30">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-purple-400 fill-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Saved Library</h1>
                <p className="text-sm text-muted-foreground">
                  Find all the pitches and discussions you bookmarked.
                </p>
              </div>
            </div>

            {/* Saved Posts container */}
            <SavedPostsFeed />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
