"use client";
import { useEffect } from 'react';
import { Buffer } from 'buffer';

export default function CreateBuffer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).Buffer = Buffer;
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
}
