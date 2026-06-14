"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

function formatTimeAgo(timestamp: number) {
  return formatDistanceToNow(timestamp * 1000, { addSuffix: true }).replace("about ", "");
}

export function TimeAgo({ timestamp }: { timestamp: number }) {
  const [text, setText] = useState(() => formatTimeAgo(timestamp));

  useEffect(() => {
    const interval = setInterval(() => setText(formatTimeAgo(timestamp)), 60_000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return text;
}
