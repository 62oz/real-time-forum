/* TYPES OF DATABASE WE HAVE:
- Users
- Categories
- Posts
- Comments
- Likes and Dislikes
- User session (cookies stuff)
- Images (let's try)
*/

package database

import (
	"database/sql"
	"fmt"
	u "forum/server/utils"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

// Open database or creates it if it doesn't exist
func GetDB(database string) *sql.DB {

	db, err := sql.Open("sqlite3", database)
	u.CheckErr(err)

	_, err = db.Exec(`PRAGMA foreign_keys = ON`)
	u.CheckErr(err)

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS Users (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		Username TEXT NOT NULL UNIQUE,
		Email TEXT NOT NULL UNIQUE,
		Password TEXT NOT NULL,
		Info TEXT NOT NULL);
	CREATE TABLE IF NOT EXISTS Categories (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		Name TEXT NOT NULL UNIQUE);
	CREATE TABLE IF NOT EXISTS Posts (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		AuthorID INTEGER NOT NULL,
		Title TEXT NOT NULL,
		Content TEXT NOT NULL,
		Date TEXT NOT NULL,
		CategoryIDs TEXT NOT NULL,
		Categories TEXT NOT NULL,
		FOREIGN KEY(AuthorID) REFERENCES Users(ID) ON DELETE CASCADE);
	CREATE TABLE IF NOT EXISTS Comments (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		AuthorID INTEGER NOT NULL,
		PostID INTEGER NOT NULL,
		Content BLOB NOT NULL,
		FOREIGN KEY(AuthorID) REFERENCES Users(ID) ON DELETE CASCADE,
		FOREIGN KEY(PostID) REFERENCES Posts(ID) ON DELETE CASCADE);
	CREATE TABLE IF NOT EXISTS Reacs (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		LorD INTEGER NOT NULL,
		AuthorID INTEGER NOT NULL,
		PostID INTEGER,
		CommentID INTEGER,
		FOREIGN KEY(AuthorID) REFERENCES Users(ID) ON DELETE CASCADE,
		FOREIGN KEY(PostID) REFERENCES Posts(ID) ON DELETE CASCADE,
		FOREIGN KEY(CommentID) REFERENCES Comments(ID) ON DELETE CASCADE);
	CREATE TABLE IF NOT EXISTS Sessions (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		UserID INTEGER NOT NULL,
		UUID TEXT NOT NULL UNIQUE,
		ExpDate TEXT NOT NULL,
		FOREIGN KEY(UserID) REFERENCES Users(ID) ON DELETE CASCADE);
	CREATE TABLE IF NOT EXISTS Images (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		PostID INTEGER NOT NULL,
		ImageURL TEXT NOT NULL,
		FOREIGN KEY(PostID) REFERENCES POSTS(ID) ON DELETE CASCADE);`)

	if err != nil {
		fmt.Println("Error creating database.")
		log.Fatal(err)
	}

	_, err = db.Exec(`
	INSERT OR IGNORE INTO "main"."Categories" ("Name")
	VALUES
		("Apetizer"),
		("Beverage"),
		("Breakfast"),
		("Comfort food"),
		("Lunch"),
		("Salad"),
		("Smothie"),
		("Snack"),
		("Soup"),
		("Vegan"),
		("Savoury"),
		("Sweet");
	`)

	if err != nil {
		fmt.Println("Error initialising categories.")
		log.Fatal(err)
	}

	// MESSAGES FEATURE

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS Messages (
		ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
		SenderID INTEGER NOT NULL,
		ReceiverID INTEGER NOT NULL,
		Content TEXT NOT NULL,
		Date TEXT NOT NULL,
		FOREIGN KEY(SenderID) REFERENCES Users(ID) ON DELETE CASCADE,
		FOREIGN KEY(ReceiverID) REFERENCES Users(ID) ON DELETE CASCADE
	);
`)

	if err != nil {
		fmt.Println("Error creating messages table.")
		log.Fatal(err)
	}
	return db
}
