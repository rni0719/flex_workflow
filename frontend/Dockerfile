FROM node:18-alpine

WORKDIR /app

# 依存関係をコピーしてインストール
COPY package.json package-lock.json* ./
RUN npm install

# ソースコードをコピー
COPY . .

EXPOSE 3000

# 開発サーバーを起動
CMD ["npm", "start"]
