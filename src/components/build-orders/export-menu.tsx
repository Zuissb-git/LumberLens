"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer, ChevronDown } from "lucide-react";
import { ShareDialog } from "./share-dialog";

interface ExportMenuProps {
  orderId: string;
  orderName: string;
}

export function ExportMenu({ orderId, orderName }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const downloadCsv = () => {
    window.open(`/api/build-orders/${orderId}/export?format=csv`, "_blank");
    setOpen(false);
  };

  const printOrder = () => {
    window.print();
    setOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          <Download className="h-3 w-3 mr-1" />
          Export
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        {open && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-50">
            <button
              onClick={downloadCsv}
              className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
            <button
              onClick={printOrder}
              className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setShareOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Link
            </button>
          </div>
        )}
      </div>
      <ShareDialog
        orderId={orderId}
        orderName={orderName}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
