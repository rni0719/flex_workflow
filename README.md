# flex_workflow

## 概要

このリポジトリはワークフローサービスのテスト用プロジェクトです。フロントエンド（JavaScript）とバックエンド（Go）で構成されています。

## 技術スタック

## 開発環境のセットアップ

### 必要条件

- Docker と Docker Compose
- Node.js (フロントエンド開発用)
- Go (バックエンド開発用)

### インストール手順

1. リポジトリをクローンします

```bash
git clone https://github.com/rni0719/flex_workflow.git
cd flex_workflow
```

2. Docker Compose でサービスを起動します

```bash
docker-compose up -d
```

これにより、フロントエンドとバックエンドの両方のサービスが起動します。

## 開発方法

### フロントエンド開発

フロントエンドは `frontend` ディレクトリにあります。

```bash
cd frontend
npm install
npm start
```

開発サーバーが起動し、通常は http://localhost:3000 でアクセスできます。

### バックエンド開発

バックエンドは `backend` ディレクトリにあります。

```bash
cd backend
go mod download
go run main.go
```

API サーバーは通常 http://localhost:8080 で実行されます。

## ディレクトリ構成

```
flex_workflow/
├── backend/         # Goで書かれたバックエンドAPI
├── frontend/        # Reactベースのフロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   └── workflows/  # ワークフロー関連コンポーネント
│   │   ├── App.js
│   │   └── ...
└── docker-compose.yml  # Docker設定ファイル
```

## 機能

- ワークフローの作成・編集・削除
- ワークフローステップの管理
- ワークフローの実行とモニタリング

## トラブルシューティング

- **フロントエンドが接続できない場合**: バックエンドサーバーが起動しているか確認してください
- **バックエンドエラー**: ログを確認し、必要な環境変数が設定されているか確認してください
- **Docker 関連の問題**: `docker-compose down` を実行してから再度 `docker-compose up -d` を試してください
