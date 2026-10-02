"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { refundOrder } from "@/lib/actions/orders";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/generated/prisma/client";

export type OrderRow = Order & {
  user: { name: string; email: string };
  course: { title: string };
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [pending, startTransition] = useTransition();
  const [refund, setRefund] = useState<OrderRow | null>(null);

  const columns: ColumnDef<OrderRow>[] = [
    {
      accessorKey: "user",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.user.email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "course",
      header: "Cours",
      cell: ({ row }) => row.original.course.title,
    },
    {
      accessorKey: "amountCents",
      header: "Montant",
      cell: ({ row }) => formatPrice(row.original.amountCents),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge
            variant={
              s === "PAID" ? "default" : s === "REFUNDED" ? "outline" : "secondary"
            }
          >
            {ORDER_STATUS_LABELS[s]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "PAID" && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => setRefund(row.original)}
            >
              <Undo2 className="size-4" /> Rembourser
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
        searchKey="course"
        searchPlaceholder="Rechercher par cours…"
      />
      <ConfirmDialog
        open={!!refund}
        onOpenChange={(o) => !o && setRefund(null)}
        title="Rembourser cette commande ?"
        description="L'inscription au cours sera retirée et le paiement remboursé via Stripe si configuré."
        onConfirm={() =>
          startTransition(async () => {
            if (!refund) return;
            const r = await refundOrder(refund.id);
            if (r.ok) {
              toast.success("Commande remboursée");
              setRefund(null);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}
