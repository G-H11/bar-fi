"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className={`flex space-x-2 h-8 items-center justify-center text-sm ${className}`}>
      <input
        id="theme-toggle"
        type="checkbox"
        className="toggle"
        onChange={handleToggle}
        checked={isDarkMode}
        style={{
          background: isDarkMode
            ? "linear-gradient(135deg, #C9A84C, #D4AF37)"
            : "rgba(201,168,76,0.2)",
          border: "1px solid rgba(201,168,76,0.3)",
          "--toggle-color": "#0a0a0a",
        } as React.CSSProperties}
      />
      <label htmlFor="theme-toggle" className="cursor-pointer">
        <SunIcon
          className="h-4 w-4"
          style={{ color: "#C9A84C" }}
        />
      </label>
    </div>
  );
};
