package controller

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/rni0719/flex_workflow/internal/models" // 修正点: model -> models
	"github.com/rni0719/flex_workflow/internal/repository"
	"github.com/rni0719/flex_workflow/pkg/utils"
)

type WorkflowController struct {
	repo *repository.WorkflowRepository
}

func NewWorkflowController(repo *repository.WorkflowRepository) *WorkflowController {
	return &WorkflowController{repo: repo}
}

func (c *WorkflowController) GetWorkflows(w http.ResponseWriter, r *http.Request) {
	workflows, err := c.repo.GetAll()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, workflows)
}

func (c *WorkflowController) CreateWorkflow(w http.ResponseWriter, r *http.Request) {
	var workflow models.Workflow // 修正点: model.Workflow -> models.Workflow
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&workflow); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	workflow.CreatedAt = time.Now()
	workflow.UpdatedAt = time.Now()

	createdWorkflow, err := c.repo.Create(workflow)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, createdWorkflow)
}

func (c *WorkflowController) GetWorkflow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid workflow ID")
		return
	}

	workflow, err := c.repo.GetByID(id)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Workflow not found")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, workflow)
}

func (c *WorkflowController) UpdateWorkflow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid workflow ID")
		return
	}

	var workflow models.Workflow // 修正点: model.Workflow -> models.Workflow
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&workflow); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	workflow.ID = id
	workflow.UpdatedAt = time.Now()

	updatedWorkflow, err := c.repo.Update(workflow)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, updatedWorkflow)
}

func (c *WorkflowController) DeleteWorkflow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid workflow ID")
		return
	}

	if err := c.repo.Delete(id); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func (c *WorkflowController) GetWorkflowTasks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid workflow ID")
		return
	}

	tasks, err := c.repo.GetTasks(id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, tasks)
}
