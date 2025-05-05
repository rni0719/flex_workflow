package repository

import (
	"database/sql"
	"time"

	"github.com/rni0719/flex_workflow/internal/models" // 修正点: model -> models
)

type WorkflowRepository struct {
	DB *sql.DB
}

func NewWorkflowRepository(db *sql.DB) *WorkflowRepository {
	return &WorkflowRepository{DB: db}
}

func (r *WorkflowRepository) GetAll() ([]models.Workflow, error) { // 修正点: model.Workflow -> models.Workflow
	workflows := []models.Workflow{} // 修正点: model.Workflow -> models.Workflow
	rows, err := r.DB.Query("SELECT id, name, description, status, created_at, updated_at FROM workflows")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var wf models.Workflow // 修正点: model.Workflow -> models.Workflow
		if err := rows.Scan(&wf.ID, &wf.Name, &wf.Description, &wf.Status, &wf.CreatedAt, &wf.UpdatedAt); err != nil {
			return nil, err
		}
		workflows = append(workflows, wf)
	}

	return workflows, nil
}

func (r *WorkflowRepository) GetByID(id int) (models.Workflow, error) { // 修正点: model.Workflow -> models.Workflow
	var wf models.Workflow // 修正点: model.Workflow -> models.Workflow
	err := r.DB.QueryRow(
		"SELECT id, name, description, status, created_at, updated_at FROM workflows WHERE id=$1",
		id).Scan(&wf.ID, &wf.Name, &wf.Description, &wf.Status, &wf.CreatedAt, &wf.UpdatedAt)

	if err != nil {
		return models.Workflow{}, err // 修正点: model.Workflow{} -> models.Workflow{}
	}

	return wf, nil
}

func (r *WorkflowRepository) Create(wf models.Workflow) (models.Workflow, error) { // 修正点: model.Workflow -> models.Workflow
	wf.CreatedAt = time.Now()
	wf.UpdatedAt = time.Now()

	err := r.DB.QueryRow(
		"INSERT INTO workflows(name, description, status, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id",
		wf.Name, wf.Description, wf.Status, wf.CreatedAt, wf.UpdatedAt).Scan(&wf.ID)

	if err != nil {
		return models.Workflow{}, err // 修正点: model.Workflow{} -> models.Workflow{}
	}

	return wf, nil
}

func (r *WorkflowRepository) Update(wf models.Workflow) (models.Workflow, error) { // 修正点: model.Workflow -> models.Workflow
	wf.UpdatedAt = time.Now()

	_, err := r.DB.Exec(
		"UPDATE workflows SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5",
		wf.Name, wf.Description, wf.Status, wf.UpdatedAt, wf.ID)

	if err != nil {
		return models.Workflow{}, err // 修正点: model.Workflow{} -> models.Workflow{}
	}

	return wf, nil
}

func (r *WorkflowRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM workflows WHERE id=$1", id)
	return err
}

func (r *WorkflowRepository) GetTasks(workflowID int) ([]models.Task, error) { // 修正点: model.Task -> models.Task
	tasks := []models.Task{} // 修正点: model.Task -> models.Task
	rows, err := r.DB.Query(
		"SELECT id, workflow_id, name, description, status, created_at, updated_at FROM tasks WHERE workflow_id=$1",
		workflowID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t models.Task // 修正点: model.Task -> models.Task
		if err := rows.Scan(&t.ID, &t.WorkflowID, &t.Name, &t.Description, &t.Status, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}

	return tasks, nil
}
