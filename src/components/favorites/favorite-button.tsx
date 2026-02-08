"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  isFavorited: boolean;
  className?: string;
}

export function FavoriteButton({ productId, isFavorited: initialFavorited, className }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  if (!session?.user) return null;

  const toggle = () => {
    const next = !favorited;
    setFavorited(next); // optimistic

    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) setFavorited(!next); // revert
      } catch {
        setFavorited(!next); // revert
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={isPending}
      className={cn(
        "p-1.5 rounded-full transition-colors",
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-stone-300 hover:text-stone-400",
        className
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
    </button>
  );
}
