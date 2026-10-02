import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/queries";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Commandes" };

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await getOrders();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Commandes</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
