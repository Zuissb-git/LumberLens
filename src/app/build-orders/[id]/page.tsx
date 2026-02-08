"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepricingTable } from "@/components/build-orders/repricing-table";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";

interface BuildOrder {
  id: string;
  name: string;
  notes: string | null;
  wasteFactor: number;
  lastRepriced: string | null;
  lineItems: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      species: string;
      boardFeet: number;
    };
  }[];
}

export default function BuildOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<BuildOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/build-orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-700" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">Build order not found.</p>
        <Link href="/build-orders">
          <Button variant="outline" className="mt-4">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/build-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{order.name}</h1>
            {order.notes && <p className="text-stone-500 mt-1">{order.notes}</p>}
          </div>
        </div>
        <Badge variant="secondary">
          {Math.round(order.wasteFactor * 100)}% waste factor
        </Badge>
      </div>

      {/* Line Items Summary */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items ({order.lineItems.length})</CardTitle>
          <Link href={`/build-orders/new`}>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-stone-100">
            {order.lineItems.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <span className="text-sm text-stone-700">{item.product.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">
                    {item.product.boardFeet.toFixed(1)} BF each
                  </span>
                  <Badge variant="outline">x{item.quantity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repricing */}
      <RepricingTable orderId={id} />
    </div>
  );
}
