"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Loader2, Trash2 } from "lucide-react";

interface BuildOrder {
  id: string;
  name: string;
  notes: string | null;
  wasteFactor: number;
  lastRepriced: string | null;
  createdAt: string;
  lineItems: { id: string; quantity: number; product: { name: string } }[];
}

export default function BuildOrdersPage() {
  const [orders, setOrders] = useState<BuildOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/build-orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function deleteOrder(id: string) {
    if (!confirm("Delete this build order?")) return;
    await fetch(`/api/build-orders/${id}`, { method: "DELETE" });
    setOrders(orders.filter((o) => o.id !== id));
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Build Orders</h1>
          <p className="text-stone-500 mt-1">Manage your saved lumber orders</p>
        </div>
        <Link href="/build-orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-lg">No build orders yet</p>
            <p className="text-stone-400 text-sm mt-1 mb-4">
              Create your first build order to compare prices across vendors
            </p>
            <Link href="/build-orders/new">
              <Button>Create Build Order</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/build-orders/${order.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900">{order.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                      <span>{order.lineItems.length} items</span>
                      <Badge variant="secondary">
                        {Math.round(order.wasteFactor * 100)}% waste
                      </Badge>
                      {order.lastRepriced && (
                        <span>
                          Repriced {new Date(order.lastRepriced).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <p className="text-sm text-stone-400 mt-1 truncate">{order.notes}</p>
                    )}
                  </Link>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="p-2 text-stone-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
