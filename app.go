package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

func upgradeToWebsocket(w http.ResponseWriter, r *http.Request) (c *websocket.Conn) {

	var upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		Subprotocols:    []string{"draw"},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print(err)
	}

	err = conn.SetReadDeadline(time.Time{})
	if err != nil {
		log.Print(err)
	}

	err = conn.SetWriteDeadline(time.Time{})
	if err != nil {
		log.Print(err)
	}

	return conn
}

// DrawEvent messages sent between peers
type DrawEvent struct {
	Path [][]int `json:"path"`
	ID   int     `json:"id"`
}

func eventHandler(w http.ResponseWriter, r *http.Request) {
	conn := upgradeToWebsocket(w, r)

	var clientChan chan []byte

	// subscribe the channel to 'draw' group
	clientChan = make(chan []byte, 10)
	Subscribe(clientChan, "draw")

	// receive from client and send to peers
	go func() {

		for {
			message := DrawEvent{}
			if err := conn.ReadJSON(&message); err != nil {
				log.Print(err)
				defer conn.Close()
				break
			}
			log.Print("read from client loop")
			m, err := json.Marshal(message)
			if err != nil {
				log.Print(err)
			}
			Send(m, "draw")
		}
	}()

	// receive from peers and send to client
	go func() {
		for {
			m := <-clientChan

			if err := conn.WriteMessage(websocket.TextMessage, m); err != nil {
				log.Println(err)
				// unsubscribe when write is not succesfull
				Unsubscribe(clientChan, "draw")
				defer conn.Close()
				return
			}
		}
	}()
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
