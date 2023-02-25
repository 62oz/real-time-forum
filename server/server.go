package handlers

import (
	"database/sql"
	d "forum/database"
	u "forum/server/utils"
	"log"
	"net/http"
)

// var tpl *template.Template
var Database *sql.DB

func init() {
	//tpl = template.Must(template.ParseGlob("server/template/*.html"))
	Database = d.GetDB("forum.db")
}

func Start() error {

	// Create a new router
	mux := http.NewServeMux()

	// Add CORS middleware
	mux.Handle("/", u.CorsMiddleware(http.HandlerFunc(GetRequest)))
	mux.Handle("/login", u.CorsMiddleware(http.HandlerFunc(Login)))
	mux.Handle("/signup", u.CorsMiddleware(http.HandlerFunc(Signup)))
	mux.Handle("/create-post", u.CorsMiddleware(http.HandlerFunc(CreatePost)))
	mux.Handle("/check-session", u.CorsMiddleware(http.HandlerFunc(CheckSession)))
	mux.Handle("/add-reaction", u.CorsMiddleware(http.HandlerFunc(AddReaction)))
	mux.Handle("/add-comment", u.CorsMiddleware(http.HandlerFunc(CreateComment)))
	mux.Handle("/my-account", u.CorsMiddleware(http.HandlerFunc(MyAccount)))
	mux.Handle("/get-messages", u.CorsMiddleware(http.HandlerFunc(GetMessages)))
	mux.Handle("/get-active-users", u.CorsMiddleware(http.HandlerFunc(GetActiveUsers)))

	/* 	// Begin new transaction
	   	tx, err := Database.Begin()
	   	if err != nil {
	   		return err
	   	}
	   	// Insert fake message into db
	   	d.InsertMessage(tx, u.Message{SenderID: 1, ReceiverID: 2, Content: "Hello World!"})

	   	// Commit transaction
	   	err = tx.Commit()
	   	if err != nil {
	   		return err
	   	} */

	//open port- listen
	log.Println("Starting server port 8080 (http://localhost:8080/)")
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		return err
	}
	return nil
}
