package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
)

type Note struct {
	Title string
	Body  string
}

type Notes []Note

//go:embed static/*
var staticFiles embed.FS

func main() {
	port := ":8080"
	mux := http.NewServeMux()

	staticFiles, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Printf("error reading static files: %v\n", err)
		os.Exit(1)
	}
	mux.Handle("/", http.FileServerFS(staticFiles))
	mux.HandleFunc("/api", func(w http.ResponseWriter, req *http.Request) {
		defer req.Body.Close()
		var data Notes
		err := json.NewDecoder(req.Body).Decode(&data)
		if err != nil {
			log.Printf("error: %v\n", err)
			http.Error(w, "Couldn't decode request payload", 400)
		}

		for _, v := range data {
			f, err := os.Create(v.Title + ".md")
			if err != nil {
				log.Printf("error saving note: %s\n", err)
			}

			f.Write([]byte(v.Body))
			f.Close()
		}
	})
	fmt.Printf("Listening on port%s", port)

	http.ListenAndServe(port, mux)
}
