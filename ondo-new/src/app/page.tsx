'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, FileText, BarChart2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          イベント運営を効率化する
          <span className="text-primary block mt-2">ONDO イベント管理システム</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
          イベントの企画から運営まで、すべてのプロセスを一元管理。
          シンプルで使いやすいインターフェースで、誰でも簡単にイベント運営をサポートします。
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              新規イベントを作成
            </Button>
          </Link>
          <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
            詳細を見る <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">主な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>イベント管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  イベントの作成から公開、参加者管理までを一括で管理。スケジュール調整も簡単です。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>参加者管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  参加者の登録、確認、連絡を一元管理。アンケート機能で満足度も把握できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>資料管理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  イベント資料や配布物を一括管理。参加者への配布も簡単に行えます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>分析レポート</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  イベントの成果を可視化。参加者数や満足度を分析し、次回のイベントに活かせます。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
