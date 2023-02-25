package handlers

import (
	"encoding/json"
	"fmt"
	d "forum/database"
	u "forum/server/utils"
	"net/http"

	"github.com/gofrs/uuid"
)

type Data struct {
	Categories []u.Category `json:"categories"`
	Posts      []u.Post     `json:"posts"`
	Logged     Logged       `json:"logged"`
}

var NPost u.Post

var Send Data

func GetRequest(w http.ResponseWriter, r *http.Request) {

	//Get cookie
	cookie, noCookie := r.Cookie("sessionID")
	var sesh u.Session
	var id uuid.UUID
	if noCookie == nil {
		id, err := uuid.FromString(cookie.Value)
		if err == nil {
			sesh = d.GetSession(Database, id)
		}
	}

	var activeUser u.User
	active := false
	if (!d.IsExpired(Database, sesh) && sesh != u.Session{}) {

		activeUserID := d.GetUserIDBySesh(Database, id)
		activeUser = d.GetUserByID(Database, activeUserID)
		active = true
	}

	Categories := d.GetCategories(Database)
	Posts := d.GetPosts(Database)
	//Load post comments
	for i := 0; i < len(Posts); i++ {
		Posts[i].Author = d.GetUserByID(Database, Posts[i].AuthorID).Username
		Posts[i].Comments = d.GetComs(Database, Posts[i].ID)
		//Load comments authors
		for a := 0; a < len(Posts[i].Comments); a++ {
			Posts[i].Comments[a].Author = d.GetUserByID(Database, Posts[i].Comments[a].AuthorID).Username
		}
		//Load comments likes and dislikes
		for j := 0; j < len(Posts[i].Comments); j++ {
			Posts[i].Comments[j].Likes = d.GetReacsCom(Database, 1, Posts[i].ID, Posts[i].Comments[j].ID)
			if active {
				//Marking the comments liked by active user
				for _, cl := range Posts[i].Comments[j].Likes {
					if cl.Author == activeUser.Username {
						Posts[i].Liked = true
					}
				}
			}

			Posts[i].Comments[j].Dislikes = d.GetReacsCom(Database, -1, Posts[i].ID, Posts[i].Comments[j].ID)
			if active { //Marking the comments disliked by active user
				for _, cl := range Posts[i].Comments[j].Dislikes {
					if cl.Author == activeUser.Username {
						Posts[i].Disliked = true
					}
				}
			}

		}
		//Load post likes and dislikes
		Posts[i].Likes = d.GetReacsPost(Database, 1, Posts[i].ID)

		if active { //Marking the posts liked by active user
			for _, pl := range Posts[i].Likes {
				if pl.Author == activeUser.Username {
					Posts[i].Liked = true
				}
			}
			//Marking the posts disliked by active user
			for _, pd := range Posts[i].Dislikes {
				if pd.Author == activeUser.Username {
					Posts[i].Disliked = true
				}
			}
		}
		Posts[i].Dislikes = d.GetReacsPost(Database, -1, Posts[i].ID)
	}

	data := make(map[string]interface{})
	data["categories"] = Categories
	data["posts"] = Posts

	b, err := json.Marshal(data)
	if err != nil {
		//Internal server error to header
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Write(b)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("creating post")

	// Getting login info

	if r.Method == "POST" {
		err := json.NewDecoder(r.Body).Decode(&NPost)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		NPost.AuthorID = d.GetUserIDBySesh(Database, NPost.Session)
		NPost.Author = d.GetUserByID(Database, NPost.AuthorID).Username
		fmt.Println("received:", NPost)
	}

	valid_post := false
	//CHECKING POST VALIDITY
	if len(NPost.Content) > 0 && len(NPost.Title) > 0 {
		valid_post = true
		//ADDING TO DATABASE
		d.InsertPost(Database, NPost)
	}

	b, err := json.Marshal(valid_post)
	if err != nil {
		//Internal server error to header
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Write(b)
}

var NCom u.Comment

func CreateComment(w http.ResponseWriter, r *http.Request) {
	fmt.Println("creating comment")

	// Getting login info

	if r.Method == "POST" {
		err := json.NewDecoder(r.Body).Decode(&NCom)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		NCom.AuthorID = d.GetUserIDBySesh(Database, NCom.Session)
		NCom.Author = d.GetUserByID(Database, NCom.AuthorID).Username
		fmt.Println("received:", NCom)
	}

	valid_com := false
	//CHECKING POST VALIDITY
	if len(NCom.Content) > 0 {
		valid_com = true
		//ADDING TO DATABASE
		d.InsertCom(Database, NCom)
	}

	b, err := json.Marshal(valid_com)
	if err != nil {
		//Internal server error to header
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Write(b)
}

var NReac u.Reac

func AddReaction(w http.ResponseWriter, r *http.Request) {
	fmt.Println("adding reaction")

	// Getting login info

	if r.Method == "POST" {
		err := json.NewDecoder(r.Body).Decode(&NReac)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		NReac.AuthorID = d.GetUserIDBySesh(Database, NReac.Session)
		NReac.Author = d.GetUserByID(Database, NReac.AuthorID).Username
		fmt.Println("received reaction:", NReac)
	}
	//If it's post
	if NReac.PostID != 0 && NReac.CommentID == 0 {
		fmt.Println("commentID is 0")
		NReac.CommentID = 0
	}

	var allReacs []u.Reac

	if NReac.CommentID != 0 {
		fmt.Println("comment reac")
		already := false
		allReacs = d.GetReacsCom(Database, NReac.LorD, NReac.PostID, NReac.CommentID)
		allOppositeReacs := d.GetReacsCom(Database, -NReac.LorD, NReac.PostID, NReac.CommentID)
		for _, r := range allReacs {
			if r.AuthorID == NReac.AuthorID {
				already = true
				//REMOVE REAC FROM DATABASE
				d.DeleteReaction(Database, NReac)
				break
			}
		}
		//If there is an opposite reaction you can't unless you remove the other first
		for _, r := range allOppositeReacs {
			if r.AuthorID == NReac.AuthorID {
				already = true
				break
			}
		}
		if !already {
			// ADDING TO DATABASE IF DOESN'T EXIST
			d.InsertReac(Database, NReac)
		}
	} else if NReac.PostID != 0 && NReac.CommentID == 0 {
		already := false
		allReacs = d.GetReacsPost(Database, NReac.LorD, NReac.PostID)
		allOppositeReacs := d.GetReacsPost(Database, -NReac.LorD, NReac.PostID)
		for _, r := range allReacs {
			if r.AuthorID == NReac.AuthorID {
				already = true
				//REMOVE REAC FROM DATABASE
				fmt.Println("removing reac")
				d.DeleteReaction(Database, NReac)
				break
			}
		}
		//If there is an opposite reaction you can't unless you remove the other first
		for _, r := range allOppositeReacs {
			if r.AuthorID == NReac.AuthorID {
				already = true
				break
			}
		}
		if !already {
			// ADDING TO DATABASE IF DOESN'T EXIST
			fmt.Println("adding reac")
			d.InsertReac(Database, NReac)
		}
	}

	b, err := json.Marshal(true)
	if err != nil {
		//Internal server error to header
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Write(b)
}

func MyAccount(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("sessionID")
	if err != nil {
		return
	}
	//Getting user info
	id, err := uuid.FromString(cookie.Value)
	if err != nil {
		return
	}

	userID := d.GetUserIDBySesh(Database, id)
	user := d.GetUserByID(Database, userID)
	// Get all posts
	allPosts := d.GetPosts(Database)
	for _, p := range allPosts {
		var temp = p
		temp.Comments = d.GetComs(Database, p.ID)
		temp.Likes = d.GetReacsPost(Database, 1, p.ID)
		temp.Dislikes = d.GetReacsPost(Database, -1, p.ID)
		if p.AuthorID == userID {
			user.CreatedPosts = append(user.CreatedPosts, temp)
		}
		pcs := d.GetComs(Database, p.ID)
		for _, pc := range pcs {
			if pc.AuthorID == userID {
				user.CommmentedPosts = append(user.CommmentedPosts, temp)
				break
			}
		}
		pls := d.GetReacsPost(Database, 1, p.ID)
		for _, pl := range pls {
			if pl.AuthorID == userID {
				user.ReactedPosts = append(user.ReactedPosts, temp)
				break
			}
		}
		pds := d.GetReacsPost(Database, -1, p.ID)
		for _, pd := range pds {
			if pd.AuthorID == userID {
				user.ReactedPosts = append(user.ReactedPosts, temp)
				break
			}
		}

	}

	//Sending user info
	b, err := json.Marshal(user)
	if err != nil {
		//Internal server error to header
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}

	w.Write(b)
}
