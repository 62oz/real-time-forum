package utils

import (
	"github.com/gofrs/uuid"
)

// User :)
type User struct {
	ID              int    `json:"id"`
	Username        string `json:"username"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	Mobile          string `json:"mobile"`
	Age             string `json:"age"`
	FirstName       string `json:"firstName"`
	LastName        string `json:"lastName"`
	Logout          bool   `json:"logout"`
	ReactedPosts    []Post `json:"reactedPosts"`
	CommmentedPosts []Post `json:"commentedPosts"`
	CreatedPosts    []Post `json:"createdPosts"`
	Unread          int    `json:"unread"` //This is the number of messages unread by the other user
}

// Category :O
type Category struct {
	Id       int    `json:"id"`
	Title    string `json:"title"`
	NumPosts int    `json:"numPosts"`
	Posts    []Post `json:"posts"`
}

// Post :D
type Post struct {
	ID          int       `json:"id"`
	AuthorID    int       `json:"author id"`
	Author      string    `json:"author"`
	Session     uuid.UUID `json:"session"`
	Liked       bool      `json:"liked"`
	Disliked    bool      `json:"disliked"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	CategoryIDs string    `json:"category ids"`
	Categories  string    `json:"categories"`
	Date        int64     `json:"date"`
	ImageURL    string    `json:"image src"`
	Likes       []Reac    `json:"Likes"`
	Dislikes    []Reac    `json:"Dislikes"`
	Comments    []Comment `json:"comments"`
}

// Comment c:
type Comment struct {
	ID       int       `json:"id"`
	AuthorID int       `json:"authorId"`
	Author   string    `json:"author"`
	Session  uuid.UUID `json:"session"`
	Liked    bool      `json:"liked"`
	Disliked bool      `json:"disliked"`
	PostID   int       `json:"postId"`
	Content  string    `json:"content"`
	Likes    []Reac    `json:"likes"`
	Dislikes []Reac    `json:"dislikes"`
}

// Like or Dislike >:(
type Reac struct {
	ID        int       `json:"id"`
	LorD      int       `json:"likeOrDislike"`
	AuthorID  int       `json:"authorId"`
	Author    string    `json:"author"`
	Session   uuid.UUID `json:"session"`
	PostID    int       `json:"postId"`
	CommentID int       `json:"commentId"`
}

// Image :$
type Image struct {
	ID       int    `json:"id"`
	PostID   int    `json:"post id"`
	ImageURL string `json:"image src"`
}

// >>>>>>>>>> Stuff I'm still figuring out

// Session ?_?
type Session struct {
	ID      int
	UserID  int
	UUID    uuid.UUID
	ExpDate int64
}

// Messages :P

type Message struct {
	ID         int    `json:"id"`
	Content    string `json:"message"`
	SenderID   int    `json:"senderId"`
	Sender     string `json:"sender"`
	ReceiverID int    `json:"receiverId"`
	Receiver   string `json:"receiver"`
	Date       int64  `json:"date"`
	Read       int    `json:"isRead"`
}
