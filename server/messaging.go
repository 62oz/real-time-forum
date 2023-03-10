package handlers

import (
	"encoding/json"
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

	// Get messages from db that receiver sent to sender
	messages := d.GetMessages(Database, message.ReceiverID, message.SenderID)
	// Mark messages as read in db
	for i, m := range messages {
		if m.Read == 0 {
			// Start a new transaction
			tx, err := Database.Begin()
			if err != nil {
				log.Println(err)
				conn.Close()
				return
			}

			// Mark message as read
			d.MarkMessageAsRead(tx, m.ID)
			messages[i].Read = 1

			// Commit the transaction
			err = tx.Commit()
			if err != nil {
				log.Println(err)
				conn.Close()
				return
			}
		}

	}

	// Get messages from db that sender sent to receiver if not the same user
	if message.SenderID != message.ReceiverID {
		messages = append(messages, d.GetMessages(Database, message.SenderID, message.ReceiverID)...)
	}

	// Add sender and receiver names to messages
	for i, m := range messages {
		messages[i].Sender = d.GetUserByID(Database, m.SenderID).Username
		messages[i].Receiver = d.GetUserByID(Database, m.ReceiverID).Username
	}

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

		// Also get messages from db that receiver sent to sender if not the same user
		if message.SenderID != message.ReceiverID {
			messages = append(messages, d.GetMessages(Database, message.ReceiverID, message.SenderID)...)
		}

		// Add sender and receiver names to messages
		for i, m := range messages {
			messages[i].Sender = d.GetUserByID(Database, m.SenderID).Username
			messages[i].Receiver = d.GetUserByID(Database, m.ReceiverID).Username
		}

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

	// Get the current user from client
	var currentUser u.User
	if r.Method == "POST" {
		json.NewDecoder(r.Body).Decode(&currentUser)
	}

	// Get active active sessions
	sessions := d.GetAllSessions(Database)

	var activeUsers []u.User
	// Get active users
	for _, s := range sessions {
		activeUsers = append(activeUsers, d.GetUserByID(Database, s.UserID))
	}

	// Remove duplicates
	activeUsers = u.RemoveUserDuplicates(activeUsers)

	// Give each active user the number of unread messages
	for i, user := range activeUsers {
		for _, m := range d.GetMessages(Database, user.ID, currentUser.ID) {
			if m.Read == 0 {
				activeUsers[i].Unread++
			}
		}
	}

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
			d.DeleteSession(tx, s.UUID)
		}
	}
}
