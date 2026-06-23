"use client";

import Image from "next/image";
import { useState } from "react";

interface SupportProfileAvatarProps {
  src: string;
  alt?: string;
  size?: "sm" | "md";
  href?: string;
}

const sizes = {
  sm: { box: "h-16 w-16", pixels: 64 },
  md: { box: "h-28 w-28", pixels: 112 },
} as const;

export function SupportProfileAvatar({
  src,
  alt = "Marc Wilnauer",
  size = "md",
  href,
}: SupportProfileAvatarProps) {
  const [visible, setVisible] = useState(Boolean(src));

  if (!src || !visible) return null;

  const { box, pixels } = sizes[size];

  const avatar = (
    <div
      className={`relative ${box} shrink-0 overflow-hidden rounded-full border border-slate-700/80 ring-2 ring-sky-500/20${
        href ? " transition hover:ring-sky-400/40" : ""
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${pixels}px`}
        className="object-cover"
        onError={() => setVisible(false)}
      />
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {avatar}
      </a>
    );
  }

  return avatar;
}
