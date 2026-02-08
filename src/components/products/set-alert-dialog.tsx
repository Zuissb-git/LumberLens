"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

interface SetAlertDialogProps {
  productId: string;
  productName: string;
  currentLowestCents: number | null;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function SetAlertDialog({
  productId,
  productName,
  currentLowestCents,
  open,
  onClose,
  onCreated,
}: SetAlertDialogProps) {
  const [priceDollars, setPriceDollars] = useState(
    currentLowestCents ? (currentLowestCents / 100 * 0.9).toFixed(2) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const cents = Math.round(parseFloat(priceDollars) * 100);
    if (isNaN(cents) || cents <= 0) {
      setError("Enter a valid price");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetPriceCents: cents }),
      });

      if (!res.ok) {
        setError("Failed to create alert");
        return;
      }

      onCreated();
      onClose();
    } catch {
      setError("Failed to create alert");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Set Price Alert</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p className="text-sm text-stone-600 mb-3">
          Get notified when <span className="font-medium">{productName}</span> drops to your target price.
        </p>
        {currentLowestCents && (
          <p className="text-xs text-stone-500 mb-3">
            Current lowest: {formatCurrency(currentLowestCents)}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Target Price ($)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            placeholder="e.g. 3.50"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating..." : "Set Alert"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
