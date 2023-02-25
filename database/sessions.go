package database

import (
	"database/sql"
	"fmt"
	u "forum/server/utils"
	"time"

	uuid "github.com/gofrs/uuid"
)

// Insert Session
func InsertSession(tx *sql.Tx, sesh u.Session) uuid.UUID {

	statement, err := tx.Prepare(`INSERT INTO Sessions (UserID, UUID, ExpDate) VALUES (?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert session Prepare error:", err)
		return sesh.UUID
	}
	defer statement.Close()

	_, err = statement.Exec(sesh.UserID, sesh.UUID, sesh.ExpDate)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert session Exec error:", err)
		return sesh.UUID
	}
	return sesh.UUID
}

// Update sesh
func UpdateSession(sesh u.Session, tx *sql.Tx) {
	statement, err := tx.Prepare(`UPDATE Sessions SET UUID = ?, ExpDate = ? WHERE UserID = ?`)
	if err != nil {
		fmt.Println("Update session Prepare error:", err)
		return
	}
	defer statement.Close()

	_, err = statement.Exec(sesh.UUID, sesh.ExpDate, sesh.UserID)
	if err != nil {
		fmt.Println("Update session Exec rerror:", err)
		return
	}
}

// Update sesh time
func UpdateSessionTime(sesh u.Session, tx *sql.Tx) {
	statement, err := tx.Prepare(`UPDATE Sessions SET ExpDate = ? WHERE UserID = ?`)
	if err != nil {
		tx.Rollback()
		fmt.Println("Update session Prepare error:", err)
		return
	}
	defer statement.Close()

	_, err = statement.Exec(sesh.ExpDate, sesh.UserID)
	if err != nil {
		tx.Rollback()
		fmt.Println("Update session time Exec rerror:", err)
		return
	}
}

// Update sesh time
func UpdateSessionTime2(tx *sql.Tx, sesh u.Session) {

	statement, err := tx.Prepare(`UPDATE Sessions SET ExpDate = ? WHERE UserID = ?`)
	if err != nil {
		fmt.Println("Update session Prepare error:", err)
		tx.Rollback()
		return
	}
	defer statement.Close()

	_, err = statement.Exec(sesh.ExpDate, sesh.UserID)
	if err != nil {
		fmt.Println("Update session time2 Exec rerror:", err)
		tx.Rollback()
		return
	}

}

// Checks if session is expired
func IsExpired(db *sql.DB, sesh u.Session) bool {
	return sesh.ExpDate < time.Now().Unix()
}

// Get session info from uuid
func GetSession(db *sql.DB, UUID uuid.UUID) u.Session {
	var session u.Session
	rows, err := db.Query(`SELECT ID, UserID, UUID, ExpDate FROM Sessions WHERE UUID = ?`, UUID.String())
	if err != nil {
		fmt.Println("Get session Query error:", err)
		return session
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&session.ID, &session.UserID, &session.UUID, &session.ExpDate)
		if err != nil {
			fmt.Println("Get session Scan error:", err)
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get session rows error:", err)
		return session
	}
	return session
}

// Get session
func UserIDHasSession(db *sql.DB, UserID int, tx *sql.Tx) bool {
	var session u.Session
	rows, err := tx.Query(`SELECT ID, UserID, UUID, ExpDate FROM Sessions WHERE UserID = ?`, UserID)
	if err != nil {
		fmt.Println("UserIDHasSesh Query error:", err)
		return false
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&session.ID, &session.UserID, &session.UUID, &session.ExpDate)
		if err != nil {
			return false
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get session rows error:", err)
		return false
	}
	return true
}

// Delete session
func DeleteSession(tx *sql.Tx, UUID uuid.UUID) {
	statement, err := tx.Prepare(`DELETE FROM Sessions WHERE UUID = ?`)
	if err != nil {
		fmt.Println("Delete session Prepare error:", err)
		tx.Rollback()
		return
	}
	defer statement.Close()

	_, err = statement.Exec(UUID)
	if err != nil {
		fmt.Println("Delete session Exec error:", err)
		tx.Rollback()
		return
	}
}

// Get session by user id
func GetSessionByUserID(UserID int, tx *sql.Tx) u.Session {
	var session u.Session
	rows, err := tx.Query(`SELECT ID, UserID, UUID, ExpDate FROM Sessions WHERE UserID = ?`, UserID)
	if err != nil {
		fmt.Println("Get session by user id Query error:", err)
		return session
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&session.ID, &session.UserID, &session.UUID, &session.ExpDate)
		if err != nil {
			fmt.Println("Get session by user id Scan error:", err)
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get session by user id rows error:", err)
		return session
	}
	return session
}

// Get all sessions in database
func GetAllSessions(db *sql.DB) []u.Session {
	rows, err := db.Query(`SELECT ID, UserID, UUID, ExpDate FROM Sessions`)
	if err != nil {
		fmt.Println("Get all sessions error:", err)
	}
	defer rows.Close()
	var ss []u.Session
	for rows.Next() {
		var s u.Session
		err := rows.Scan(&s.ID, &s.UserID, &s.UUID, &s.ExpDate)
		if err != nil {
			fmt.Println("Get all sessions scan error:", err)
		}
		ss = append(ss, s)
	}
	return ss
}
