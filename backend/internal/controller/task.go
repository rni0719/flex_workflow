package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/rni0719/flex_workflow/internal/models"     // 修正点: model -> models
	"github.com/rni0719/flex_workflow/internal/repository" // 正しいモジュールパス
	"github.com/rni0719/flex_workflow/pkg/utils"         // 正しいモジュールパス
)

type TaskController struct {
	repo *repository.TaskRepository
}

func NewTaskController(repo *repository.TaskRepository) *TaskController {
	return &TaskController{repo: repo}
}

func (c *TaskController) CreateTask(w http.ResponseWriter, r *http.Request) {
	var task models.Task // 修正点: model.Task -> models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	createdTask, err := c.repo.Create(task)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespondWithJSON(w, http.StatusCreated, createdTask)
}

func (c *TaskController) GetTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	task, err := c.repo.GetByID(id)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Task not found")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, task)
}

func (c *TaskController) UpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	var task models.Task // 修正点: model.Task -> models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	task.ID = id
	task.UpdatedAt = time.Now() // 更新時刻を設定

	updatedTask, err := c.repo.Update(task)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, updatedTask)
}

func (c *TaskController) DeleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid task ID")
		return
	}

	if err := c.repo.Delete(id); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}
