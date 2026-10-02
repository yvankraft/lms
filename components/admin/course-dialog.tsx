"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertCourse } from "@/lib/actions/courses";
import { slugify } from "@/lib/slugify";
import type { Category, Course } from "@/lib/generated/prisma/client";

type Props = {
  course?: Course;
  categories: Category[];
};

export function CourseDialog({ course, categories }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!course;
  const [level, setLevel] = useState(course?.level ?? "BEGINNER");
  const [status, setStatus] = useState(course?.status ?? "DRAFT");
  const [categoryId, setCategoryId] = useState(course?.categoryId ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const input = {
      title: String(d.get("title")),
      slug: String(d.get("slug")),
      subtitle: String(d.get("subtitle") ?? ""),
      description: String(d.get("description") ?? ""),
      coverUrl: String(d.get("coverUrl") ?? ""),
      priceCents: Math.round(Number(d.get("price")) * 100) || 0,
      level: level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      categoryId: categoryId || null,
    };
    startTransition(async () => {
      const res = await upsertCourse(input, course?.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editing ? "Cours mis à jour" : "Cours créé");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="ghost" size="sm">
              Modifier
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="size-4" /> Nouveau cours
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le cours" : "Nouveau cours"}
          </DialogTitle>
          <DialogDescription>
            Le programme (chapitres et leçons) se gère depuis la page du cours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              defaultValue={course?.title}
              required
              onChange={(e) => {
                if (!editing) {
                  const slugInput =
                    e.currentTarget.form?.elements.namedItem("slug");
                  if (slugInput instanceof HTMLInputElement)
                    slugInput.value = slugify(e.target.value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={course?.slug} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Sous-titre</Label>
            <Input
              id="subtitle"
              name="subtitle"
              defaultValue={course?.subtitle ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€, 0 = gratuit)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={course ? course.priceCents / 100 : 0}
              />
            </div>
            <div className="space-y-2">
              <Label>Niveau</Label>
              <Select value={level} onValueChange={(v) => v && setLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Débutant</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                  <SelectItem value="ADVANCED">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PUBLISHED">Publié</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverUrl">Image de couverture (URL)</Label>
            <Input
              id="coverUrl"
              name="coverUrl"
              type="url"
              placeholder="https://…"
              defaultValue={course?.coverUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (HTML)</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={course?.description}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enregistrement…" : editing ? "Enregistrer" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
