package utils

import (
	"log"
	"net/http"
)

// If error logFatal
func CheckErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if request is a CORS request
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers",
				"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		// If the request method is OPTIONS, set the response status code to 204 and return
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Call the next handler in the chain
		next.ServeHTTP(w, r)
	})
}

func RemoveUserDuplicates(users []User) []User {
	var result []User
	seen := make(map[int]bool)
	for _, user := range users {
		if _, ok := seen[user.ID]; !ok {
			seen[user.ID] = true
			result = append(result, user)
		}
	}
	return result
}
