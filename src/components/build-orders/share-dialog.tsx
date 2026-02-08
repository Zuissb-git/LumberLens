"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link2 } from "lucide-react";

interface ShareDialogProps {
  orderId: string;
  orderName: string;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ orderId, orderName, open, onClose }: ShareDialogProps) {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Check current share status by trying the share endpoint
    setLoading(true);
    fetch(`/api/build-orders/${orderId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    })
      .then((res) => res.json())
      .then((data) => {
        setShareToken(data.shareToken ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, orderId]);

  const toggleSharing = async (enabled: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/build-orders/${orderId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      setShareToken(data.shareToken ?? null);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/build-orders/share/${shareToken}`
    : null;

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Share &quot;{orderName}&quot;</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {shareToken ? (
          <div>
            <p className="text-sm text-stone-600 mb-3">
              Anyone with this link can view this build order and its current pricing.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 truncate">
                <Link2 className="h-3.5 w-3.5 inline mr-1.5" />
                {shareUrl}
              </div>
              <Button size="sm" onClick={copyLink}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-600">
            Create a shareable link for this build order. Anyone with the link will be able to view it.
          </p>
        )}
      </DialogContent>
      <DialogFooter>
        {shareToken ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSharing(false)}
            disabled={loading}
          >
            Disable Sharing
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => toggleSharing(true)}
            disabled={loading}
          >
            Enable Sharing
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
