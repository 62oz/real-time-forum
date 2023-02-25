package handlers

import (
	"encoding/json"
	"fmt"
	d "forum/database"
	u "forum/server/utils"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

func allowAllOrigin(r *http.Request) bool {
	return true
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     allowAllOrigin,
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	// Upgrade the HTTP connection to a websocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Read the first message sent by the client to get the sender and receiver IDs
	var message u.Message
	err = conn.ReadJSON(&message)
	if err != nil {
		log.Println(err)
		conn.Close()
		return
	}

	// Get messages from db
	messages := d.GetMessages(Database, message.SenderID, message.ReceiverID)
	// Add messages received by sender
	messages = append(messages, d.GetMessages(Database, message.SenderID, message.ReceiverID)...)

	// Send messages to client
	err = conn.WriteJSON(messages)
	if err != nil {
		log.Println(err)
		conn.Close()
		return
	}

	// Keep the websocket connection open to receive any future messages
	for {
		var message u.Message
		err := conn.ReadJSON(&message)
		if err != nil {
			log.Println(err)
			conn.Close()
			return
		}

		fmt.Println("received", message)

		// Start a new transaction
		tx, err := Database.Begin()
		if err != nil {
			log.Println(err)
			conn.Close()
			return
		}

		// Insert the new message into the database
		d.InsertMessage(tx, message)

		// Commit the transaction
		err = tx.Commit()
		if err != nil {
			log.Println(err)
			conn.Close()
			return
		}

		// Update the messages list to send to the client
		messages = d.GetMessages(Database, message.SenderID, message.ReceiverID)

		fmt.Println(messages)

		// Send the updated messages list to the client
		err = conn.WriteJSON(messages)
		if err != nil {
			log.Println(err)
			conn.Close()
			return
		}
	}
}

// Get active users lists
func GetActiveUsers(w http.ResponseWriter, r *http.Request) {
	//Clean up
	DeleteExpiredSessions()

	// Get active active sessions
	sessions := d.GetAllSessions(Database)

	var activeUsers []u.User
	// Get active users
	for _, s := range sessions {
		activeUsers = append(activeUsers, d.GetUserByID(Database, s.UserID))
	}

	// Remove duplicates
	activeUsers = u.RemoveUserDuplicates(activeUsers)

	// Send active users list to client
	json.NewEncoder(w).Encode(activeUsers)
}

// Get all sessions from database, check if they expired and delete them if yes
func DeleteExpiredSessions() {
	tx, err := Database.Begin()
	if err != nil {
		log.Fatal(err)
	}
	defer tx.Commit()
	sessions := d.GetAllSessions(Database)
	for _, s := range sessions {
		if d.IsExpired(Database, s) {
			// Begin new transaction
			fmt.Println("expired session", s)
			d.DeleteSession(tx, s.UUID)
		}
	}
}
