package models

import "time"

type Task struct {
	ID          int       `json:"id"`
	WorkflowID  int       `json:"workflow_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
