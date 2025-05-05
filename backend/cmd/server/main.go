package main

import (
	"github.com/rni0719/flex_workflow/internal/app"
	"github.com/rni0719/flex_workflow/pkg/config"
)

func main() {
	cfg := config.LoadConfig()
	a := app.NewApp(cfg.DatabaseURL)
	a.Run(":" + cfg.Port)
}
