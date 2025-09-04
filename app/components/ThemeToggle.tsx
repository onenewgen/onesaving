"use client"
import React, { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      // Prefer project-scoped key `onesaving.mode`, fall back to legacy `theme`
      const t =
        (localStorage.getItem("onesaving.mode") as "light" | "dark") ||
        (localStorage.getItem("theme") as "light" | "dark") ||
        "light"
      setTheme(t)
      document.documentElement.setAttribute("data-theme", t)
      console.debug("ThemeToggle: initialized theme=", t)
    } catch {
      setTheme("light")
    }
  }, [])

  useEffect(() => {
    if (!theme) return
    try {
      document.documentElement.setAttribute("data-theme", theme)
      // Persist under project-scoped key. Keep legacy key for compatibility.
      localStorage.setItem("onesaving.mode", theme)
      localStorage.setItem("theme", theme)
      console.debug("ThemeToggle: theme changed to", theme)
    } catch (e) {
      /* ignore */
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"))

  if (!mounted || !theme) return null

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="px-2 py-1 border rounded text-sm"
    >
      {theme === "light" ? "🌞 Light" : "🌙 Dark"}
    </button>
  )
}
