"use client";

import { ReactNode, useState } from "react";

export function CopyOnClick({
  copyText,
  children,
}: {
  copyText: string;
  children: ReactNode;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    if (isCopied) return;

    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 600);
      })
      .catch((error) => {
        console.error("Copy failed:", error);
      });
  };

  return (
    <span className="relative inline-block" onClick={handleClick}>
      <span className={isCopied ? "invisible" : undefined}>{children}</span>
      {isCopied && (
        <span className="absolute inset-0 flex items-center justify-center">
          Copied
        </span>
      )}
    </span>
  );
}
