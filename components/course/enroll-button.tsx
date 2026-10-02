"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { enrollFree } from "@/lib/actions/enrollments";
import { checkoutCourse } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";

export function EnrollButton({
  courseId,
  courseSlug,
  priceCents,
  isLoggedIn,
}: {
  courseId: string;
  courseSlug: string;
  priceCents: number;
  isLoggedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/cours/${courseSlug}`);
      return;
    }
    startTransition(async () => {
      if (priceCents === 0) {
        const r = await enrollFree(courseId);
        if (r.ok) {
          toast.success("Inscription confirmée — bon cours !");
          router.push(`/apprendre/${courseSlug}`);
        } else {
          toast.error(r.error);
        }
      } else {
        await checkoutCourse(courseId); // redirect interne
      }
    });
  }

  return (
    <Button className="w-full" size="lg" onClick={onClick} disabled={pending}>
      {pending
        ? "Chargement…"
        : priceCents === 0
          ? "S'inscrire gratuitement"
          : `Acheter — ${formatPrice(priceCents)}`}
    </Button>
  );
}
