module github.com/rni0719/flex_workflow

go 1.19

require (
    github.com/gorilla/mux v1.8.0
    github.com/lib/pq v1.10.9
    github.com/rs/cors v1.10.1
)

replace github.com/rni0719/flex_workflow/internal => ./internal
