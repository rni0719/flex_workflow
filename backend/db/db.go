package db

import (
    "database/sql"
    "log"
    
    _ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
    var err error
    connStr := "postgres://postgres:postgres@db:5432/workflow_db?sslmode=disable"
    
    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    if err = DB.Ping(); err != nil {
        log.Fatal("Failed to ping database:", err)
    }
    
    createTables()
}

func createTables() {
    // ワークフローテーブル
    _, err := DB.Exec(`
        CREATE TABLE IF NOT EXISTS workflows (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT
        )
    `)
    if err != nil {
        log.Fatal("Failed to create workflows table:", err)
    }
    
    // ステップテーブル
    _, err = DB.Exec(`
        CREATE TABLE IF NOT EXISTS steps (
            id SERIAL PRIMARY KEY,
            workflow_id INT REFERENCES workflows(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            action TEXT NOT NULL,
            order_num INT NOT NULL
        )
    `)
    if err != nil {
        log.Fatal("Failed to create steps table:", err)
    }
}
