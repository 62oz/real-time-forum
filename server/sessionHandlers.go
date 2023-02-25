package handlers

import (
	"encoding/json"
	"fmt"
	d "forum/database"
	u "forum/server/utils"
	"log"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

type ActiveSession struct {
	Status     string `json:"status"`
	ActiveUser u.User `json:"user"`
}

type Session struct {
	SessionIDstr string `json:"sessionID"`
}

func CheckSession(w http.ResponseWriter, r *http.Request) {

	var sessionID uuid.UUID

	cookie, err := r.Cookie("sessionID")
	if err == nil {
		sessionID, err = uuid.FromString(cookie.Value)
	}

	sesh := d.GetSession(Database, sessionID)

	var a ActiveSession
	a.Status = "failed"

	tx, err := Database.Begin()
	if err != nil {
		fmt.Println("Error starting transactionin check session")
		log.Fatal(err)
	}

	if sesh != (u.Session{}) && !d.IsExpired(Database, sesh) {

		// Update session expiration time in database
		d.UpdateSessionTime2(tx, sesh)

		//Send success and update cookie expiration time
		expiration := time.Now().Add(time.Minute * 20)

		cookie := &http.Cookie{
			Name:     "sessionID",
			Value:    sesh.UUID.String(),
			Expires:  expiration,
			SameSite: http.SameSiteNoneMode,
			Secure:   false,
			Path:     "/",
		}
		w.Header().Add("Set-Cookie", cookie.String())
		http.SetCookie(w, cookie)
		a.Status = "success"
		a.ActiveUser.ID = d.GetUserIDBySesh(Database, sesh.UUID)
		a.ActiveUser = d.GetUserByID(Database, a.ActiveUser.ID)

		//Sending additional user info
		allPosts := d.GetPosts(Database)

		//Sending created posts
		var cp []u.Post
		for _, p := range allPosts {
			if p.AuthorID == a.ActiveUser.ID {
				cp = append(cp, p)
			}
		}
		a.ActiveUser.CreatedPosts = cp

		//Sending reacted posts
		var rp []u.Post
		for _, p := range allPosts {
			p.Likes = d.GetReacsPost(Database, 1, p.ID)
			for _, lp := range p.Likes {
				if lp.AuthorID == a.ActiveUser.ID {
					rp = append(rp, p)
				}
			}
			p.Dislikes = d.GetReacsPost(Database, -1, p.ID)
			for _, dp := range p.Dislikes {
				if dp.AuthorID == a.ActiveUser.ID {
					rp = append(rp, p)
				}
			}
		}
		a.ActiveUser.ReactedPosts = rp

		//Sending commented posts
		var cmp []u.Post
		for _, p := range allPosts {
			postComs := d.GetComs(Database, p.ID)
			p.Comments = postComs
			for _, c := range postComs {
				if c.AuthorID == a.ActiveUser.ID {
					cmp = append(cmp, p)
					break
				}
			}
		}
		a.ActiveUser.CommmentedPosts = cmp
	} else {
		deleteCookie(w, "sessionID")
	}

	if d.IsExpired(Database, sesh) {
		fmt.Println("Session expired")
		d.DeleteSession(tx, sesh.UUID)
		// delete cookie
		deleteCookie(w, "sessionID")
	}

	b, err := json.Marshal(a)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Write(b)

	err = tx.Commit()
	if err != nil {
		fmt.Println("Error committing transaction in check session")
		log.Fatal(err)
	}
}
