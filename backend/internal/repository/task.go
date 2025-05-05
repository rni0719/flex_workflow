package repository

import (
	"database/sql"
	"time"

	"github.com/rni0719/flex_workflow/internal/models" // 修正点: model -> models
)

type TaskRepository struct {
	DB *sql.DB
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{DB: db}
}

// 例: タスク作成
func (r *TaskRepository) Create(task models.Task) (models.Task, error) { // 修正点: model.Task -> models.Task
	task.CreatedAt = time.Now()
	task.UpdatedAt = time.Now()

	err := r.DB.QueryRow(
		"INSERT INTO tasks(workflow_id, name, description, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
		task.WorkflowID, task.Name, task.Description, task.Status, task.CreatedAt, task.UpdatedAt).Scan(&task.ID)

	if err != nil {
		return models.Task{}, err // 修正点: model.Task{} -> models.Task{}
	}
	return task, nil
}

// 例: IDによるタスク取得
func (r *TaskRepository) GetByID(id int) (models.Task, error) { // 修正点: model.Task -> models.Task
	var task models.Task // 修正点: model.Task -> models.Task
	err := r.DB.QueryRow(
		"SELECT id, workflow_id, name, description, status, created_at, updated_at FROM tasks WHERE id=$1",
		id).Scan(&task.ID, &task.WorkflowID, &task.Name, &task.Description, &task.Status, &task.CreatedAt, &task.UpdatedAt)
	if err != nil {
		return models.Task{}, err // 修正点: model.Task{} -> models.Task{}
	}
	return task, nil
}

// 例: タスク更新
func (r *TaskRepository) Update(task models.Task) (models.Task, error) { // 修正点: model.Task -> models.Task
	task.UpdatedAt = time.Now()
	_, err := r.DB.Exec(
		"UPDATE tasks SET workflow_id=$1, name=$2, description=$3, status=$4, updated_at=$5 WHERE id=$6",
		task.WorkflowID, task.Name, task.Description, task.Status, task.UpdatedAt, task.ID)
	if err != nil {
		return models.Task{}, err // 修正点: model.Task{} -> models.Task{}
	}
	return task, nil
}

// 例: タスク削除
func (r *TaskRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM tasks WHERE id=$1", id)
	return err
}
