"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const items = [
    {
      href: "/dashboard",
      label: "ダッシュボード",
    },
    {
      href: "/events",
      label: "イベント一覧",
    },
    {
      href: "/participants",
      label: "参加者管理",
    },
    {
      href: "/documents",
      label: "資料管理",
    },
    {
      href: "/reports",
      label: "レポート",
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
