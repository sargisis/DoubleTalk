package main

import (
	"log"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/handlers"
	"doubletalk-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Initialize Database configuration
	_ = godotenv.Load("../../.env", ".env") // Load env variables from root or current dir
	database.InitDB()

	r := gin.Default()

	// Handle CORS so frontend can easily call this API
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// Protected Routes
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/user/me", handlers.GetProfile)
			protected.PUT("/user/me", handlers.UpdateProfile)

			protected.POST("/words", handlers.AddWord)
			protected.GET("/words", handlers.GetWords)
			protected.DELETE("/words/:id", handlers.DeleteWord)

			protected.GET("/cards/next", handlers.GetNextCards)
			protected.POST("/cards/:id/review", handlers.ReviewCard)

			protected.POST("/chat", handlers.ChatWithAI)
			protected.GET("/leaderboard", handlers.GetLeaderboard)

			protected.GET("/course/progress", handlers.GetCourseProgress)
			protected.POST("/course/status", handlers.UpdateLessonStatus)
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "healthy",
			"message": "DoubleTalk API is running smoothly.",
		})
	})

	log.Println("Server is running on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
