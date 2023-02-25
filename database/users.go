package database

import (
	"database/sql"
	"fmt"
	u "forum/server/utils"
	"net/http"
	"strconv"
	"time"

	uuid "github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Checks if username and password match an entry in the database
func UserAuth(tx *sql.Tx, username string, password string, w http.ResponseWriter) (bool, uuid.UUID) {

	// Check the credentials
	var un string
	var ui int
	var p []byte

	err := tx.QueryRow("SELECT ID, username, password FROM users WHERE username = ?", username).Scan(&ui, &un, &p)
	if err != nil {
		tx.Rollback()
		return false, uuid.Nil
	}
	err = bcrypt.CompareHashAndPassword(p, []byte(password))

	if err != nil {
		tx.Rollback()
		return false, uuid.Nil
	}

	// Credentials correct -> Add new session

	var sesh u.Session

	db, err := sql.Open("sqlite3", "forum.db")
	u.CheckErr(err)

	// Check if user has active session
	if UserIDHasSession(db, ui, tx) {
		sesh = GetSessionByUserID(ui, tx)
		// Delete session
		DeleteSession(tx, sesh.UUID)
	}
	// Make new session
	sesh.UserID = ui
	sesh.UUID, err = uuid.NewV4()
	if err != nil {

		fmt.Println("Insert sesh uuid.NewV4 error:", err)
		return true, sesh.UUID
	}
	// Set the session expiration date
	expiration := time.Now().Add(time.Minute * 20)
	sesh.ExpDate = expiration.Unix()

	statement, err := tx.Prepare(`INSERT INTO Sessions (UserID, UUID, ExpDate) VALUES (?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert session Prepare error:", err)
		return true, sesh.UUID
	}
	defer statement.Close()

	_, err = statement.Exec(sesh.UserID, sesh.UUID, sesh.ExpDate)
	if err != nil {
		tx.Rollback()
		fmt.Println("Insert session Exec error:", err)
		return true, sesh.UUID
	}

	return true, sesh.UUID
}

// Checks if username exists
func UserExists(db *sql.DB, username string) bool {
	rows, err := db.Query("SELECT username FROM Users")
	u.CheckErr(err)
	var u string
	for rows.Next() {
		rows.Scan(&u)
		if u == username {
			return true
		}
	}
	return false
}

// Checks if email exists
func EmailExists(db *sql.DB, email string) bool {
	rows, err := db.Query("SELECT email FROM Users")
	u.CheckErr(err)
	var e string
	for rows.Next() {
		rows.Scan(&e)
		if e == email {
			return true
		}
	}
	return false
}

// Get username by email
func GetUsernameByEmail(db *sql.DB, email string) string {
	rows, err := db.Query("SELECT username FROM Users WHERE email = ?", email)
	u.CheckErr(err)
	var u string
	if rows.Next() {
		rows.Scan(&u)
		return u
	}
	return ""
}

// Inserts new username and email if they don't exist
func InsertInUsers(database *sql.DB, tx *sql.Tx, username string, e string, p string, i string) bool {
	if !UserExists(database, username) && !EmailExists(database, e) {
		statement, err := tx.Prepare("INSERT INTO Users (username, email, password, info) VALUES (?, ?, ?, ?)")
		if err != nil {
			tx.Rollback()
			fmt.Println("Insert user Prepare error:", err)
			return false
		}
		_, err = statement.Exec(username, e, p, i)
		if err != nil {
			tx.Rollback()
			fmt.Println("Insert user Exec error:", err)
			return false
		}
		return true
	}
	return false
}

// Get all users
func GetUsers(db *sql.DB) []u.User {
	rows, err := db.Query(`SELECT ID, Username, Email, Password FROM Users`)
	u.CheckErr(err)
	defer rows.Close()

	var AllUsers []u.User

	for rows.Next() {
		var user u.User
		err = rows.Scan(&user.ID, &user.Username, &user.Email, &user.Password)
		u.CheckErr(err)
		AllUsers = append(AllUsers, user)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get users rows error:", err)
		return nil
	}
	return AllUsers
}

// Get user by ID
func GetUserByID(db *sql.DB, UserID int) u.User {
	var user u.User
	rows, err := db.Query(`SELECT ID, Username, Email, Password FROM Users WHERE ID = ?`, UserID)
	u.CheckErr(err)
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&user.ID, &user.Username, &user.Email, &user.Password)
		if err != nil {
			fmt.Println("Get user by ID error (Scan):", err)
			return user
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get user by ID error:", err)
		return user
	}

	return user
}

// Get user by Username
func GetUserByUsername(db *sql.DB, Username string) u.User {
	var user u.User
	rows, err := db.Query(`SELECT ID, Username, Email, Password FROM Users WHERE Username = ?`, Username)
	u.CheckErr(err)
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&user.ID, &user.Username, &user.Email, &user.Password)
		if err != nil {
			fmt.Println("Get user by Username error (Scan):", err)
			return user
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Get user by Username error:", err)
		return user
	}

	return user
}

// Go through the table and print content
func PrintTable(database *sql.DB) {
	rows, err := database.Query("SELECT id, username, email, password FROM users")
	u.CheckErr(err)

	var id int
	var username string
	var email string
	var password string
	for rows.Next() {
		rows.Scan(&id, &username, &email, &password)
		fmt.Println(strconv.Itoa(id) + ": " + username + " " + email + " " + password)
	}
}

// >>>>>>>>>>>

// Get user by session ?_?
func GetUserIDBySesh(db *sql.DB, UUID uuid.UUID) int {
	var id int
	rows, err := db.Query(`SELECT UserID FROM Sessions WHERE UUID = ?`, UUID)
	if err != nil {
		fmt.Println("UserID by Sesh Error Query:", err)
		return id
	}
	defer rows.Close()

	if rows.Next() {
		err = rows.Scan(&id)
		if err != nil {
			fmt.Println("UserID by Sesh Error Scan:", err)
			return id
		}
	}

	if err = rows.Err(); err != nil {
		fmt.Println("UserID by Sesh Error rows:", err)
		return id
	}
	return id
}
