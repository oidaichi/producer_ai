# 03_ONDO様システム設計書（Small Team ≤5ユーザー・マルチ拠点対応）

参照元: `01_ONDO様システム要件定義書.md` / `02_ONDO様UX画面設計書.md`
方針: ユーザー同時利用は最大5名想定。構成を徹底的に簡素化し、導入・運用コストを最小化。

—

## 1. アーキテクチャ概要
- __フロント__: Next.js 14 App Router（Server Components中心、フォーム/タブ等のみ Client）。
- __UI__: shadcn/ui 既存コンポーネント（Button, Card, Input, Textarea, Select, Tabs, Dialog, Alert, Sheet, Table, Toast）。
- __フォーム__: react-hook-form（zodは任意）。
- __スタイル__: Tailwind CSS（本番）。
- __言語__: TypeScript（本番）。
- __表__: shadcn/ui の素の Table（並べ替え/フィルタは後回し）。
- __状態管理__: 画面ローカル state 中心。グローバル導入なし。
- __サーバ__: Next.js Route Handlers（`app/api/*`）。
- **データベース/ホスティング（GCP）**: Google Cloud に統一
  - __アプリ__: Cloud Run（コンテナ、ゼロスケール、カスタムドメイン可）
  - __DB__: Cloud SQL for MySQL（リージョン: `asia-northeast1` 東京、当面はパブリックIP接続）
  - __接続__: まずは MySQL ユーザー/パスワード + Public IP。必要に応じて Cloud SQL コネクタ/IAM Auth へ移行可能。
  - __シークレット__: Secret Manager（`NEXTAUTH_SECRET` など）
  - __レジストリ__: Artifact Registry（コンテナイメージ）
  - （任意）__CI/CD__: Cloud Build または GitHub Actions
- __認証__: Auth.js（NextAuth）Google OAuth。メール allowlist（初期: `info@lovantvictoria.com`）。
- __出力__: Google Sheets（Phase 1）。Asana（Phase 2）。Excelは対象外。
- __LLM__: 薄い1関数ラッパで OpenAI/Azure OpenAI を呼び出し。

注: __Phase 0のプロトタイプ__ は高速化のため __Tailwind CSS + JavaScript__（素のJS）で実装し、後でNext.js/TypeScriptへ移植。

## 2. ルーティング構成（最小）
`app/`
- `layout.tsx`, `page.tsx`, `projects/[id]/page.tsx`
- `api/generate` (POST): 生成
- `api/projects/*`: プロジェクト CRUD（MySQL + 標準SQL）
- `api/sheets/export` (POST): Google Sheets 出力
- `api/auth/*`: Auth.js ルート

テンプレート/設定/履歴などはプロジェクト画面内に簡易吸収（必要最低限のみ）。

## 3. 主要画面と利用コンポーネント
- __共通__: `Card`, `Button`, `Tabs`, `Toast`
- __入力__: `Form`, `Textarea`, `Input`, `Select`, `Button`, ヘルプは `Sheet`
- __生成結果__: `Tabs` + `Table`（セルは `Input`/`Select` でインライン編集）
- __出力__: `Select`（テンプレート選択 簡易）、`Button`（Google Sheets出力）

DataTable（TanStack）は導入せず、表はシンプルな編集のみに限定。

## 4. データモデル（MySQL・標準SQL）
- projects(id, name, eventDate, scale, createdBy, createdAt)
- generations(id, projectId, inputText, optionsJson, status, resultJson, createdAt)
- users(id, email, name, image)

最小DDL（例）:
```sql
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  eventDate DATE,
  scale VARCHAR(50),
  createdBy BIGINT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId BIGINT NOT NULL,
  inputText TEXT,
  optionsJson JSON,
  status VARCHAR(32),
  resultJson JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_generations_projectId (projectId)
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  image TEXT
);
```

- マイグレーションは SQL ファイルで管理（`/db/migrations/*.sql` を順序適用）。
- 将来、ORM が必要になれば Prisma/Drizzle/Kysely を導入可能。

## 5. 生成結果のテーブル仕様（簡易）
- __WBS__: `wbsId` | `taskName` | `assignee` | `start` | `end` | `hours` | `dependsOn` | `notes`
- __登壇者__: `name` | `org` | `role` | `contact` | `arrival` | `notes`
- __会場チェック__: `item` | `required` | `owner` | `due` | `status` | `memo`

UIは shadcn Table + 各セルに Input/Select を埋め込むだけ。並べ替え/ページングは不要。

## 6. データアクセス（mysql2・プール）
- 依存: `mysql2`
- `lib/db.ts` 概要: 接続プールを1つ作成（Cloud Run起動時）、API内は `pool.execute('SELECT ...', [params])` を利用。
- ベストプラクティス: 必ずプレースホルダでパラメタライズ、タイムアウト設定、必要に応じて接続数を制御。

接続例（概念）:
```ts
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});
```

- Cloud SQL コネクタ（@google-cloud/cloud-sql-connector）利用は後日検討（IAM認証/自動TLS）。

## 7. 外部連携（本フェーズ構成）
- **Google Sheets（Phase 1・必須）**
  - 実行主体: __Cloud Runのサービスアカウント__（Application Default Credentials）。ユーザーOAuthトークンは不要。
  - スコープ: `https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file`
  - 動作: サービスアカウントのドライブ領域に新規スプレッドシートを作成し、URLを返す。
  - 共有: 初期は手動共有（必要に応じてDrive APIで共有付与を自動化）。
  - 効果: ユーザーのDrive権限・トークン管理が不要で、実装・運用が簡素。
- **Asana（Phase 2）**
  - 実装直前に着手（要件確定後）。現段階では仕様記述のみに留め、認証設定を先延ばし。
- Excel は対象外。

## 8. 認証/権限（メールallowlist）
- allowlist 初期値: `info@lovantvictoria.com`
- `callbacks.signIn` で `ALLOWED_EMAILS`（カンマ区切り）に含まれるメールのみ許可。

## 9. 非機能/運用
- __リージョン__: `asia-northeast1`（東京）
- __接続__: 当面パブリックIP + 強パスワード/ネットワーク制限
- __バックアップ__: Cloud SQL 自動バックアップ + スナップショット

## 10. 初期セットアップ（GCP + MySQL）
- パッケージ
  - `npm i mysql2 next-auth @auth/core googleapis`
  - （任意）`npm i openai`
- 環境変数（まずは Cloud Run のENVに直接設定。Secret ManagerはPhase 2で導入）
  - `DB_HOST=...`（Cloud SQL パブリックIP）
  - `DB_PORT=3306`
  - `DB_USER=...`
  - `DB_PASSWORD=...`
  - `DB_NAME=...`
  - `NEXTAUTH_URL=...`
  - `NEXTAUTH_SECRET=...`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
  - `ALLOWED_EMAILS=info@lovantvictoria.com`
  - `OPENAI_API_KEY=...`（使用時）
- デプロイ（Cloud Run __ソースデプロイ__ 推奨）
  - `gcloud run deploy ondo --source . --region=asia-northeast1`（Buildpacksにより Dockerfile不要）
  - Artifact Registry は自動利用。GitHub Actions/Cloud Buildトリガは任意。
- Cloud SQL（MySQL）
  - インスタンス: `asia-northeast1`、パブリックIP有効化。
  - ユーザー/DB作成後、接続元IP制限（固定化が難しければCIDR広めで開始→後日 Cloud SQL コネクタ/IAMへ）。
  - 初期DDLを `/db/migrations/0001_init.sql` で適用。
- ドメイン/監視
  - カスタムドメイン: Cloud Run にマッピング（DNS CNAME）。
  - ログ/監視: __Cloud Logging / Cloud Monitoring__ のみで開始（追加ロガー/APMは不要）。

## 11. フォルダ構成（最小）
- `app/page.tsx` ダッシュボード
- `app/projects/[id]/page.tsx` プロジェクト（Tabs: 入力/結果/出力）
- `app/api/generate/route.ts` 生成
- `app/api/projects/*` CRUD
- `lib/db.ts` MySQL クライアント/初期化
- `lib/ai.ts` 生成ラッパ
- `components/*` shadcn ベースの小さなフォーム/テーブル
- `dev/` UI先行のプロトタイプ一式（本番コード分離・スクショ作成用）

> 開発ディレクトリ（基準）: `D:/dev/20_fujiko/03_ONDO`
> 本書で記載する `dev/` などの相対パスは、上記ディレクトリ直下を起点とします。

## 12. 実装段階（ライト）
- __Phase 0__: UIファースト（モックバックエンド）で画面完成→スクショ作成
  - 目的: 次回MTGで画面キャプチャを提示し合意形成。DB/認証は後回し。
  - 技術: Tailwind CSS + JavaScript（プロトタイプ）。
  - 内容: `dev/` 配下にモックデータと簡易APIを用意し、UI/遷移/編集体験を確認。
  - 成果物: ダッシュボード/プロジェクト詳細（入力・生成結果・出力）のスクショ。
- __Phase 1__: Next.js + TypeScript + Tailwind CSS で本実装（MySQL/Sheets接続）
- __Phase 2__: Asana 出力（必要時のみ）

## 13. デプロイ/ホスティング（GCP 統一）
- __アプリ__: Cloud Run（ソースデプロイ、ゼロスケール、カスタムドメイン可）
- __DB__: Cloud SQL for MySQL（asia-northeast1, Public IP 開始）
- __ドメイン__: Cloud Run カスタムドメイン
- __CI/CD__: Cloud Build または GitHub Actions（任意）
- __シークレット__: Phase 1はENV直設定、Phase 2で Secret Manager へ移行
- __実行/コスト最適化（Cloud Run 設定）__
  - 最小インスタンス数: 0
  - メモリ: 512MB〜1GB
  - 同時実行: 80〜200
  - タイムアウト: 60秒程度
- __Cloud SQL（MySQL）運用__: Public IP + 強パス + 接続元IP制限で開始。後日コネクタ/IAMへ。
- __ログ/監視__: GCP標準（Cloud Logging/Monitoring）のみ。

## 14. リスク/留意
- MySQL JSON型はバージョン相違に留意（5.7+）。
- 同時編集の競合は最小解で運用、必要時にロック/履歴へ拡張。
- OAuth 公開審査が必要な場合はスコープを最小化。

## 15. 受け入れ基準
- Google ログイン（allowlist適用）後、入力→生成→編集→Google Sheets 出力が通しで成功。
- 必須3テーブル（WBS/登壇者/会場チェック）を出力シートへ正しく反映。
- Phase 2 で Asana 連携が成功。

## 16. 設計簡素化ポリシー（今回の合意事項）
- __Cloud Runのソースデプロイ__: Dockerfile不要で最短デプロイ。
- __Secret Managerは後回し__: まずはENV。移行はPhase 2。
- __Google Sheetsはサービスアカウント__: ユーザーOAuth不要。実装・運用が簡素。
- __API最小化__: projects CRUD / generate / sheets.export に集約。
- __Cloud Run設定__: 0インスタンス・512MB〜1GB・80〜200同時実行・60s。
- __Cloud SQL（MySQL）運用__: Public IP + 強パス + 接続元IP制限で開始。後日コネクタ/IAMへ。
- __ログ/監視__: GCP標準（Cloud Logging/Monitoring）のみ。
- __Asana__: Phase 2直前で要件確定後に実装。

意図: 初期コストと実装負荷を最小化し、短期で価値提供→必要に応じて段階的に強化。

## 17. 開発用 `dev/` フォルダ（UI先行プロトタイプ）
- __目的__: 本番コードに影響を与えず、短期間で画面を完成させスクショ作成。
- __範囲__: 画面遷移・入力フォーム・テーブル編集・出力ボタンの配置とトースト等の挙動確認。
- __技術__: Tailwind CSS + JavaScript（プロトタイプ段階）。
- __構成案__（例）
  - `dev/README.md`: 使い方とスクショ取得手順
  - `dev/mock/`
    - `projects.json`: ダッシュボード表示用ダミーデータ
    - `project-1.json`: 生成結果（`wbs[]`/`speakers[]`/`venueChecklist[]`）
  - `dev/prototype/`
    - `index.html`: ダッシュボード静的ページ（shadcn風UI + Tailwind）
    - `project.html`: プロジェクト詳細（Tabs: 入力/生成結果/出力）
    - `assets/`（CSS/アイコン/最小JS）
- __モックで作成するページ一覧__（設計書要件を満たすもの）
  - `Dashboard（index.html）`: プロジェクト一覧 + 新規作成ボタン
  - `Project（project.html）`: Tabs = 入力 / 生成結果（WBS/登壇者/会場チェック） / 出力（Google Sheets）
  - `Login（login.html）`: Google OAuth ログイン（ボタンのみ）
  - `Settings（settings.html）`: 設定画面（ダミー）
- __ダミーデータ目安__: WBS: 8〜12行、登壇者: 3〜5名、会場チェック: 12〜20項目。
- __将来__: Phase 1で Next.js + TypeScript に移植し、`mysql2` + `Cloud SQL` と `Google Sheets` に接続。

## 付録A-1: DBスキーマ最小化（JSON活用）のメリット/デメリット
- __メリット__
  - __マイグレーション頻度が激減__: 可変項目（生成結果・細目）を `JSON` に格納し、DDL変更を極小化。
  - __開発速度__: JSONへ直接保存→UI/生成の変更にすぐ追従。
  - __柔軟性__: WBS/登壇者/会場チェックの列追加・構造変更に耐える。
- __デメリット/注意__
  - __集計/検索が難化__: JSONからの集計はSQLが複雑（必要ならビュー/ETLで整形）。
  - __スキーマ検証はアプリ側__: zod等でバリデーションを行う前提。
  - __一部インデックス制約不可__: JSON内の特定キー検索はパフォーマンス要検討。
- __推奨方針__
  - ID/外部参照/日時などは列で保持。可変の詳細は `resultJson`/`optionsJson` へ。

## 付録A-2: Firestoreへ置換の検討（参考）
- __メリット__
  - __フルマネージド/サーバーレス__: インフラ運用ほぼ不要、スケール自動。
  - __シンプルなデプロイ__: DBの接続管理が不要（SDK直結）。
  - __小規模で安価__: アクセス少量なら非常に低コスト。
- __デメリット__
  - __SQLが使えない__: クエリが制約され、集計/結合が不得手。
  - __設計発想が異なる__: コレクション/ドキュメント設計が必要（SQL慣れに学習コスト）。
  - __トランザクション/一貫性の制約__: RDBほどの複雑な一貫性要件は難しい。
- __結論（本件）__
  - SQLに慣れている現状では MySQL の方が習熟・生産性が高く、要件にも十分。将来運用負荷がボトルネックになったら再検討。
