"use client";

import { useTransition } from "react";
import { CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleLessonDone } from "@/lib/actions/enrollments";

export function MarkDoneButton({
  lessonId,
  courseId,
  done,
}: {
  lessonId: string;
  courseId: string;
  done: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant={done ? "outline" : "default"}
      disabled={pending}
      onClick={() => startTransition(async () => {
        await toggleLessonDone(lessonId, courseId);
      })}
    >
      {done ? (
        <>
          <Undo2 className="size-4" /> Marquer à revoir
        </>
      ) : (
        <>
          <CheckCircle2 className="size-4" /> Marquer comme terminée
        </>
      )}
    </Button>
  );
}
