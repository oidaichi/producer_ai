"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus } from "lucide-react"

// Mock data - in a real app, this would come from an API
const mockParticipants = [
  { id: 1, name: "山田 太郎", email: "taro.yamada@example.com", department: "営業部", eventsAttended: 5 },
  { id: 2, name: "佐藤 花子", email: "hanako.sato@example.com", department: "マーケティング部", eventsAttended: 3 },
  { id: 3, name: "鈴木 一郎", email: "ichiro.suzuki@example.com", department: "開発部", eventsAttended: 7 },
  { id: 4, name: "高橋 さくら", email: "sakura.takahashi@example.com", department: "人事部", eventsAttended: 2 },
  { id: 5, name: "伊藤 健太", email: "kenta.ito@example.com", department: "営業部", eventsAttended: 4 },
]

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])

  const filteredParticipants = mockParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleParticipant = (id: number) => {
    setSelectedParticipants(prev =>
      prev.includes(id) 
        ? prev.filter(participantId => participantId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedParticipants.length === filteredParticipants.length) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(filteredParticipants.map(p => p.id))
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">参加者管理</h1>
          <p className="text-muted-foreground mt-1">
            イベント参加者の情報を管理します
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            参加者を追加
          </Button>
          <Button size="sm">
            エクスポート
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="名前、メール、部署で検索"
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {selectedParticipants.length > 0 && (
            <div className="text-sm text-muted-foreground ml-auto">
              {selectedParticipants.length}件選択中
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b h-10 text-left text-sm text-muted-foreground">
                <th className="w-12 px-4">
                  <Checkbox 
                    checked={selectedParticipants.length === filteredParticipants.length && filteredParticipants.length > 0}
                    onCheckedChange={selectAll}
                    className="h-4 w-4"
                  />
                </th>
                <th className="font-medium px-4">名前</th>
                <th className="font-medium px-4">メールアドレス</th>
                <th className="font-medium px-4">部署</th>
                <th className="font-medium px-4 text-right">参加イベント数</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Checkbox 
                        checked={selectedParticipants.includes(participant.id)}
                        onCheckedChange={() => toggleParticipant(participant.id)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {participant.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {participant.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {participant.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {participant.eventsAttended}回
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    該当する参加者が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {filteredParticipants.length}件中 1-{filteredParticipants.length}件を表示
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              前へ
            </Button>
            <Button variant="outline" size="sm" disabled>
              次へ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
