"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
  // Mock data - in a real app, this would come from an API
  const events = [
    {
      id: 1,
      title: "春のセミナー",
      date: "2024-04-15",
      time: "14:00 - 16:00",
      location: "オンライン",
      attendees: 45,
      status: "upcoming"
    },
    {
      id: 2,
      title: "新製品発表会",
      date: "2024-03-28",
      time: "13:00 - 17:00",
      location: "東京国際フォーラム",
      attendees: 120,
      status: "upcoming"
    },
    {
      id: 3,
      title: "チームビルディング",
      date: "2024-03-15",
      time: "10:00 - 16:00",
      location: "軽井沢",
      attendees: 25,
      status: "completed"
    }
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">イベント一覧</h1>
        <Link href="/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新規イベント
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {event.date} • {event.time} • {event.location}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'upcoming' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {event.status === 'upcoming' ? '予定' : '終了'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">参加者数</p>
                  <p className="font-medium">{event.attendees}名</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">場所</p>
                  <p className="font-medium">{event.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ステータス</p>
                  <p className="font-medium">
                    {event.status === 'upcoming' ? '開催予定' : '終了'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/events/${event.id}`}>詳細</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/events/${event.id}/edit`}>編集</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
