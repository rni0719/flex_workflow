# ステージ1: ビルド環境
FROM golang:1.19-alpine AS builder

# git とその他ビルドに必要なツールをインストール
RUN apk add --no-cache git build-base

WORKDIR /app

# go.mod と go.sum をコピーして依存関係をダウンロード
# これにより、依存関係のレイヤーがキャッシュされやすくなります
COPY go.mod go.sum ./
RUN go mod download
# オプション: ベンダーディレクトリを使用する場合
# RUN go mod vendor

# アプリケーションのソースコード全体をコピー
COPY . .

# go mod tidy を実行して、go.mod と go.sum を最終化
RUN go mod tidy

# アプリケーションをビルド
# CGO_ENABLED=0 は静的リンクバイナリを作成するために役立ちます (特にAlpineベースの場合)
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/server ./cmd/server/main.go

# ステージ2: 実行環境 (より軽量なイメージを使用)
FROM alpine:latest

# CA証明書を追加 (HTTPS通信などに必要)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# ビルドステージから実行可能ファイルのみをコピー
COPY --from=builder /app/server .

# 実行ポート
EXPOSE 8080

# コンテナ起動時に実行するコマンド
CMD ["./server"]
