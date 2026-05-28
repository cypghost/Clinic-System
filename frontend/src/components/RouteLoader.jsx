"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname          = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers            = useRef([]);

  const clear = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    clear();
    setVisible(true);
    setWidth(0);

    timers.current = [
      setTimeout(() => setWidth(30),  20),
      setTimeout(() => setWidth(65),  200),
      setTimeout(() => setWidth(85),  600),
      setTimeout(() => setWidth(100), 900),
      setTimeout(() => setVisible(false), 1150),
    ];

    return clear;
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-0.5 bg-blue-600 pointer-events-none"
      style={{
        width: `${width}%`,
        transition: width === 0 ? "none" : "width 400ms cubic-bezier(0.4,0,0.2,1)",
      }}
    />
  );
}
