"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LessonItem = {
  id: string;
  title: string;
  durationMin: number;
  freePreview: boolean;
};

export function LessonNav({
  slug,
  chapters,
  doneIds,
  activeId,
  unlocked,
}: {
  slug: string;
  chapters: { id: string; title: string; lessons: LessonItem[] }[];
  doneIds: Set<string>;
  activeId?: string;
  unlocked: boolean;
}) {
  return (
    <nav className="space-y-4">
      {chapters.map((ch, i) => (
        <div key={ch.id}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {String(i + 1).padStart(2, "0")}. {ch.title}
          </p>
          <ul className="space-y-0.5">
            {ch.lessons.map((l) => {
              const accessible = unlocked || l.freePreview;
              const done = doneIds.has(l.id);
              const active = l.id === activeId;
              return (
                <li key={l.id}>
                  <Link
                    href={`/apprendre/${slug}?lecon=${l.id}`}
                    aria-disabled={!accessible}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      !accessible && "pointer-events-none opacity-50",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : accessible ? (
                      <PlayCircle className="size-4 shrink-0" />
                    ) : (
                      <Lock className="size-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate">{l.title}</span>
                    {l.durationMin > 0 && (
                      <span className="text-[10px]">{l.durationMin}m</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function CirclePlaceholder() {
  return <Circle className="size-4" />;
}
