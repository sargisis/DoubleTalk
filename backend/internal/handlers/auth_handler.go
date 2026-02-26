package handlers

import (
	"net/http"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"
	"doubletalk-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username:       req.Username,
		Email:          req.Email,
		HashedPassword: hashedPassword,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists or conflict"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user_id": user.ID})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.HashedPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
	})
}

func GetProfile(c *gin.Context) {
	// The middleware places "userID" in the context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user token"})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Calculate words learned: total words added by user
	var wordCount int64
	database.DB.Model(&models.Word{}).Where("user_id = ?", userID).Count(&wordCount)

	// Since we are mocking XP and Level right now, we can base it simplely on wordCount
	// e.g. 50 XP per word, 1 Level per 500 XP
	xpPoints := int(wordCount) * 50
	level := 1 + (xpPoints / 500)

	c.JSON(http.StatusOK, gin.H{
		"username":            user.Username,
		"email":               user.Email,
		"avatar_url":          user.AvatarURL,
		"dark_mode":           user.DarkMode,
		"email_notifications": user.EmailNotifications,
		"words_learned":       wordCount,
		"xp_points":           xpPoints,
		"level":               level,
	})
}

// UpdateProfileRequest defines the body for updating profile details
type UpdateProfileRequest struct {
	Username           string `json:"username"`
	AvatarURL          string `json:"avatar_url"`
	DarkMode           *bool  `json:"dark_mode"`
	EmailNotifications *bool  `json:"email_notifications"`
}

// UpdateProfile allows a user to update their username and avatar
func UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized user token"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update only provided fields
	if req.Username != "" {
		// Check if username is already taken by someone else
		var existingUser models.User
		if err := database.DB.Where("username = ? AND id != ?", req.Username, userID).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
			return
		}
		user.Username = req.Username
	}

	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}

	if req.DarkMode != nil {
		user.DarkMode = *req.DarkMode
	}

	if req.EmailNotifications != nil {
		user.EmailNotifications = *req.EmailNotifications
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":             "Profile updated successfully",
		"username":            user.Username,
		"avatar_url":          user.AvatarURL,
		"dark_mode":           user.DarkMode,
		"email_notifications": user.EmailNotifications,
	})
}
