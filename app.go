package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func eventHandler(w http.ResponseWriter, r *http.Request) {

}

func main() {

	// listen to messages

	// serve the static files
	dir, err := os.Getwd()
	if err != nil {
		log.Print(err)
	}
	mux := mux.NewRouter()
	mux.HandleFunc("/api", eventHandler)
	mux.PathPrefix("/").Handler(http.FileServer(http.Dir(dir + "/public")))

	http.Handle("/", mux)

	log.Print("listening on port 7000")
	http.ListenAndServe(":7000", nil)
}
