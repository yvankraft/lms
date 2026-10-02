"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ListTree, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { CourseDialog } from "@/components/admin/course-dialog";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCourse } from "@/lib/actions/courses";
import { COURSE_STATUS_LABELS, LEVEL_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { Category, Course } from "@/lib/generated/prisma/client";

export type CourseRow = Course & {
  category: Category | null;
  instructor: { name: string } | null;
  _count: { chapters: number; enrollments: number };
};

export function CoursesTable({
  courses,
  categories,
  isAdmin,
}: {
  courses: CourseRow[];
  categories: Category[];
  isAdmin: boolean;
}) {
  const columns: ColumnDef<CourseRow>[] = [
    {
      accessorKey: "title",
      header: "Cours",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/admin/courses/${row.original.id}`}
            className="font-medium hover:text-primary"
          >
            {row.original.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.original.instructor?.name ?? "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      cell: ({ row }) => row.original.category?.name ?? "—",
    },
    {
      accessorKey: "level",
      header: "Niveau",
      cell: ({ row }) => (
        <Badge variant="outline">{LEVEL_LABELS[row.original.level]}</Badge>
      ),
    },
    {
      accessorKey: "priceCents",
      header: "Prix",
      cell: ({ row }) =>
        row.original.priceCents === 0
          ? "Gratuit"
          : formatPrice(row.original.priceCents),
    },
    {
      id: "content",
      header: "Contenu",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original._count.chapters} chap. · {row.original._count.enrollments}{" "}
          inscrits
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "PUBLISHED" ? "default" : "secondary"
          }
        >
          {COURSE_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/courses/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              <ListTree className="size-4" /> Programme
            </Button>
          </Link>
          <CourseDialog course={row.original} categories={categories} />
          {isAdmin && (
            <DeleteCourseButton id={row.original.id} />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={courses}
      searchKey="title"
      searchPlaceholder="Rechercher un cours…"
    />
  );
}

function DeleteCourseButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Supprimer ce cours ?"
        description="Irréversible — bloqué si des élèves sont inscrits."
        onConfirm={() =>
          startTransition(async () => {
            const r = await deleteCourse(id);
            if (r.ok) {
              toast.success("Cours supprimé");
              setOpen(false);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}
