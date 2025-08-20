import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="space-y-4 text-center">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">ページが見つかりません</h2>
        <p className="text-muted-foreground">
          お探しのページは移動または削除された可能性があります。
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
