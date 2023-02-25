package database

import (
	"database/sql"
	"fmt"
	u "forum/server/utils"
)

// Insert new message to db
func InsertMessage(tx *sql.Tx, m u.Message) {
	statement, err := tx.Prepare(`INSERT OR IGNORE INTO Messages (SenderID, ReceiverID, Content, Date) VALUES (?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert message Prepare error:", err)
		return
	}
	defer statement.Close()
	_, err = statement.Exec(m.SenderID, m.ReceiverID, m.Content, m.Date)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert message Exec error:", err)
		return
	}
}

// Get all messages between two users
func GetMessages(db *sql.DB, SenderID int, ReceiverID int) []u.Message {
	rows, err := db.Query(`SELECT ID, SenderID, ReceiverID, Content, Date, is_read FROM Messages WHERE (SenderID = ? AND ReceiverID = ?) ORDER BY Date DESC;`, SenderID, ReceiverID, ReceiverID, SenderID)
	if err != nil {
		fmt.Println("Get messages error:", err)
		return nil
	}
	defer rows.Close()

	var messages []u.Message

	for rows.Next() {
		var m u.Message
		err = rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.Date, &m.Read)
		if err != nil {
			fmt.Println("Get messages error (Scan):", err)
			return nil
		}
		messages = append(messages, m)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get messages rows error:", err)
		return nil
	}
	return messages
}

// Mark message as read
func MarkMessageAsRead(tx *sql.Tx, MessageID int) {
	statement, err := tx.Prepare(`UPDATE Messages SET is_read = 1 WHERE ID = ?`)
	if err != nil {
		tx.Rollback()
		fmt.Println("Mark message as read Prepare error:", err)
		return
	}
	defer statement.Close()
	_, err = statement.Exec(MessageID)
	if err != nil {
		tx.Rollback()
		fmt.Println("Mark message as read Exec error:", err)
		return
	}
}
