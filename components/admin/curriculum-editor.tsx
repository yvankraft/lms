"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  addChapter,
  deleteChapter,
  upsertLesson,
  deleteLesson,
  moveLesson,
} from "@/lib/actions/courses";
import type { Chapter, Lesson } from "@/lib/generated/prisma/client";

type ChapterWithLessons = Chapter & { lessons: Lesson[] };

export function CurriculumEditor({
  courseId,
  chapters,
}: {
  courseId: string;
  chapters: ChapterWithLessons[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newChapter, setNewChapter] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editingLesson, setEditingLesson] = useState<{
    chapterId: string;
    lesson?: Lesson;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    kind: "chapter" | "lesson";
    id: string;
  } | null>(null);

  function toggleCollapse(id: string) {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  }

  function submit(action: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    startTransition(async () => {
      const r = await action();
      if (!r.ok) toast.error(r.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {chapters.map((ch, ci) => (
        <Card key={ch.id}>
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <button onClick={() => toggleCollapse(ch.id)}>
              {collapsed.has(ch.id) ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
            <GripVertical className="size-4 text-muted-foreground/40" />
            <p className="flex-1 font-medium">
              <span className="text-muted-foreground">
                {String(ci + 1).padStart(2, "0")}.
              </span>{" "}
              {ch.title}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingLesson({ chapterId: ch.id })}
            >
              <Plus className="size-4" /> Leçon
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete({ kind: "chapter", id: ch.id })}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
          {!collapsed.has(ch.id) && (
            <CardContent className="divide-y p-0">
              {ch.lessons.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-2 px-4 py-2.5 pl-12 text-sm"
                >
                  <span className="flex-1">
                    {l.title}
                    {l.freePreview && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Aperçu
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {l.durationMin} min
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      submit(() => moveLesson(l.id, courseId, "up"))
                    }
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      submit(() => moveLesson(l.id, courseId, "down"))
                    }
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditingLesson({ chapterId: ch.id, lesson: l })
                    }
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setConfirmDelete({ kind: "lesson", id: l.id })
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {ch.lessons.length === 0 && (
                <p className="px-4 py-3 pl-12 text-sm text-muted-foreground">
                  Aucune leçon — ajoutez la première.
                </p>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newChapter.trim()) return;
          submit(() => addChapter(courseId, { title: newChapter.trim() }));
          setNewChapter("");
        }}
      >
        <Input
          placeholder="Titre du nouveau chapitre…"
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value)}
        />
        <Button type="submit" variant="outline" disabled={pending}>
          <Plus className="size-4" /> Chapitre
        </Button>
      </form>

      <LessonDialog
        courseId={courseId}
        editing={editingLesson}
        onClose={() => setEditingLesson(null)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={
          confirmDelete?.kind === "chapter"
            ? "Supprimer ce chapitre ?"
            : "Supprimer cette leçon ?"
        }
        description={
          confirmDelete?.kind === "chapter"
            ? "Toutes les leçons du chapitre seront supprimées."
            : "La progression des élèves sur cette leçon sera perdue."
        }
        onConfirm={() =>
          submit(async () => {
            const r =
              confirmDelete?.kind === "chapter"
                ? await deleteChapter(confirmDelete.id, courseId)
                : await deleteLesson(confirmDelete!.id, courseId);
            if (r.ok) setConfirmDelete(null);
            return r;
          })
        }
      />
    </div>
  );
}

function LessonDialog({
  courseId,
  editing,
  onClose,
}: {
  courseId: string;
  editing: { chapterId: string; lesson?: Lesson } | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const lesson = editing?.lesson;
  const [free, setFree] = useState(false);

  // sync la case quand on ouvre sur une autre leçon
  const [prevId, setPrevId] = useState<string | null>(null);
  if (editing && (lesson?.id ?? null) !== prevId) {
    setPrevId(lesson?.id ?? null);
    setFree(lesson?.freePreview ?? false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const d = new FormData(e.currentTarget);
    const input = {
      title: String(d.get("title")),
      content: String(d.get("content") ?? ""),
      videoUrl: String(d.get("videoUrl") ?? ""),
      durationMin: Number(d.get("durationMin")) || 0,
      freePreview: free,
    };
    startTransition(async () => {
      const r = await upsertLesson(
        editing.chapterId,
        courseId,
        input,
        lesson?.id,
      );
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(lesson ? "Leçon mise à jour" : "Leçon créée");
      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {lesson ? "Modifier la leçon" : "Nouvelle leçon"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="l-title">Titre</Label>
            <Input
              id="l-title"
              name="title"
              defaultValue={lesson?.title}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l-duration">Durée (min)</Label>
              <Input
                id="l-duration"
                name="durationMin"
                type="number"
                min="0"
                defaultValue={lesson?.durationMin ?? 0}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={free} onCheckedChange={setFree} id="l-free" />
              <Label htmlFor="l-free">Aperçu gratuit</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-video">URL vidéo (optionnel)</Label>
            <Input
              id="l-video"
              name="videoUrl"
              type="url"
              placeholder="https://…"
              defaultValue={lesson?.videoUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-content">Contenu (HTML)</Label>
            <Textarea
              id="l-content"
              name="content"
              rows={8}
              defaultValue={lesson?.content ?? ""}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
