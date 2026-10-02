import { BookOpen, GraduationCap, Receipt, Users } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/queries";
import { db } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [[courses, enrollments, revenue, students], recent] = await Promise.all([
    getStats(),
    db.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl italic">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cours publiés"
          value={String(courses)}
          icon={BookOpen}
        />
        <StatCard
          title="Inscriptions"
          value={String(enrollments)}
          icon={GraduationCap}
        />
        <StatCard
          title="Revenus"
          value={formatPrice(revenue._sum.amountCents ?? 0)}
          icon={Receipt}
        />
        <StatCard
          title="Élèves"
          value={String(students)}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières inscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune inscription pour le moment.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{e.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{e.course.title}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(e.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
