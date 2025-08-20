"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Upload, FileText, Download, Trash2, Folder, File } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

// Mock data - in a real app, this would come from an API
const mockDocuments = [
  {
    id: 1,
    name: "2024年度 営業戦略.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "山田 太郎",
    uploadedAt: new Date(2024, 2, 15),
    folder: "営業資料"
  },
  {
    id: 2,
    name: "新商品企画書.docx",
    type: "docx",
    size: "1.8 MB",
    uploadedBy: "佐藤 花子",
    uploadedAt: new Date(2024, 2, 10),
    folder: "マーケティング"
  },
  {
    id: 3,
    name: "開発スケジュール.xlsx",
    type: "xlsx",
    size: "3.2 MB",
    uploadedBy: "鈴木 一郎",
    uploadedAt: new Date(2024, 1, 28),
    folder: "開発"
  },
  {
    id: 4,
    name: "採用計画.pptx",
    type: "pptx",
    size: "4.1 MB",
    uploadedBy: "高橋 さくら",
    uploadedAt: new Date(2024, 1, 20),
    folder: "人事"
  },
  {
    id: 5,
    name: "決算報告書.pdf",
    type: "pdf",
    size: "5.7 MB",
    uploadedBy: "伊藤 健太",
    uploadedAt: new Date(2024, 0, 15),
    folder: "経理"
  }
]

const folders = [
  { name: "全てのファイル", count: mockDocuments.length },
  { name: "営業資料", count: mockDocuments.filter(doc => doc.folder === "営業資料").length },
  { name: "マーケティング", count: mockDocuments.filter(doc => doc.folder === "マーケティング").length },
  { name: "開発", count: mockDocuments.filter(doc => doc.folder === "開発").length },
  { name: "人事", count: mockDocuments.filter(doc => doc.folder === "人事").length },
  { name: "経理", count: mockDocuments.filter(doc => doc.folder === "経理").length },
]

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("全てのファイル")
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([])

  const filteredDocuments = mockDocuments
    .filter(doc => selectedFolder === "全てのファイル" || doc.folder === selectedFolder)
    .filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folder.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const toggleDocument = (id: number) => {
    setSelectedDocuments(prev =>
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id))
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />
      default:
        return <File className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">資料管理</h1>
          <p className="text-muted-foreground mt-1">
            イベントで使用する資料を管理します
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            アップロード
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Folder className="h-4 w-4" />
            新規フォルダ
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => setSelectedFolder(folder.name)}
                className={`flex items-center justify-between w-full px-4 py-2 text-left rounded-md ${
                  selectedFolder === folder.name
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span>{folder.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="rounded-md border">
            <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ファイル名、アップロード者で検索"
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {selectedDocuments.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    ダウンロード
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    削除
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b h-10 text-left text-sm text-muted-foreground">
                    <th className="w-12 px-4">
                      <Checkbox 
                        checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                        onCheckedChange={selectAll}
                        className="h-4 w-4"
                      />
                    </th>
                    <th className="font-medium px-4">名前</th>
                    <th className="font-medium px-4">サイズ</th>
                    <th className="font-medium px-4">アップロード者</th>
                    <th className="font-medium px-4">アップロード日</th>
                    <th className="font-medium px-4">フォルダ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((document) => (
                      <tr key={document.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Checkbox 
                            checked={selectedDocuments.includes(document.id)}
                            onCheckedChange={() => toggleDocument(document.id)}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(document.type)}
                            <span className="font-medium">{document.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {document.size}
                        </td>
                        <td className="px-4 py-3">
                          {document.uploadedBy}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(document.uploadedAt, 'yyyy/MM/dd', { locale: ja })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {document.folder}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        該当するドキュメントがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredDocuments.length}件中 1-{filteredDocuments.length}件を表示
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
      </div>
    </div>
  )
}
