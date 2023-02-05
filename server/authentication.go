package handlers

import (
	"encoding/json"
	"fmt"
	d "forum/database"
	u "forum/server/utils"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Logged struct {
	User    u.User `json:"user"`
	Success bool   `json:"success"`
}

var LUser u.User
var sesh u.Session

func Login(w http.ResponseWriter, r *http.Request) {

	fmt.Println("loginrediret0")
	var logged Logged

	// Getting login info

	if r.Method == "POST" {
		err := json.NewDecoder(r.Body).Decode(&LUser)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		fmt.Println("received:", LUser)
	}

	// Checking if credentials correct from database
	log_success, uuid := d.UserAuth(Database, LUser.Username, LUser.Password, w)
	LUser.ID = d.GetUserByUsername(Database, LUser.Username).ID

	if log_success {
		logged.Success = true
		logged.User = LUser
	} else {
		logged.Success = false
	}
	fmt.Println(log_success)

	b, err := json.Marshal(logged)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Credentials", "true")

	if log_success {
		// Set the cookie with the session ID and expiration date
		expiration := time.Now().Add(time.Minute * 20)

		cookie := &http.Cookie{
			Name:     "sessionID",
			Value:    uuid.String(),
			Expires:  expiration,
			SameSite: http.SameSiteLaxMode,
		}
		w.Header().Add("Set-Cookie", cookie.String())
		http.SetCookie(w, cookie)

		sesh.UUID = uuid
		sesh.UserID = LUser.ID
		sesh.ExpDate = expiration.Unix()

		fmt.Println("Session ID (cookie):", uuid.String())
		fmt.Println("Sesh to insert in Database:", sesh)
		d.InsertSession(Database, sesh)
		fmt.Println("cooookieeees")
	}

	// Write to the client the status of login success
	w.Write(b)
}

var success = false

func Signup(w http.ResponseWriter, r *http.Request) {

	fmt.Println("signing up")

	// Getting login info
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000/signup")
	switch r.Method {
	case "OPTIONS":
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		return
	}
	if r.Method == "POST" {
		fmt.Println("received sign up info")
		err := json.NewDecoder(r.Body).Decode(&LUser)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			fmt.Println("herrr")
			return
		}
		fmt.Println("received:", LUser)
	}

	user_exists, _ := d.UserAuth(Database, LUser.Username, LUser.Password, w)

	if !user_exists /* && other conditions */ {
		fmt.Println("User doesn't exist yet")
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(LUser.Password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Println("Error hashing the password:", err)
			return
		}
		if d.InsertInUsers(Database, LUser.Username, LUser.Email, string(hashedPassword), LUser.Email) {
			fmt.Println("Successfully added user to database.")
			success = true
		}
	}

	b, err := json.Marshal(success)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(string(b))

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

	w.Write(b)
}
