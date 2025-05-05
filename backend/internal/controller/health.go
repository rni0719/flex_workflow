package controller

import (
	"net/http"

	"github.com/rni0719/flex_workflow/pkg/utils"
)

// HealthCheck は、APIのヘルスチェックを行うハンドラ関数です。
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "UP"})
}
