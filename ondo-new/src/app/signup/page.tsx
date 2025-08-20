"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/icons"
import { Mail, Lock, User, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "エラー",
        description: "パスワードが一致しません。",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // In a real app, you would send the form data to your backend
      console.log('Signup data:', formData)
      
      // Show success message
      toast({
        title: "アカウントを作成しました",
        description: "ログインしてください。",
      })
      
      // Redirect to login page
      router.push("/login")
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "アカウントの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            アカウントを作成
          </h1>
          <p className="text-sm text-muted-foreground">
            以下の情報を入力してアカウントを作成してください
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={onSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="name">
                  お名前
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="山田 太郎"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  パスワード
                </Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="パスワード"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="confirmPassword">
                  パスワード（確認）
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="パスワード（確認）"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                アカウントを作成
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                または
              </span>
            </div>
          </div>
          <Button variant="outline" type="button" disabled={isLoading}>
            {isLoading ? (
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            メールで続行
          </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          アカウントをお持ちの方は、
          <a
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            こちらからログイン
          </a>
          してください。
        </p>
      </div>
    </div>
  )
}
