package handlers

import (
	"fmt"
	"net/http"
	"time"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"
	"doubletalk-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AddWordRequest struct {
	Text         string `json:"text" binding:"required"`
	LanguageCode string `json:"language_code" binding:"required"`
	// Translation fetched internally or sent directly
	Translation string `json:"translation"`
}

func AddWord(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req AddWordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In a real app, if translation is empty, call an external API right here (Google Translate, etc)
	trans := req.Translation
	if trans == "" {
		trans = fmt.Sprintf("Auto-translated: %s", req.Text)
	}

	word := models.Word{
		UserID:           userID.(uint),
		Text:             req.Text,
		Translation:      trans,
		LanguageCode:     req.LanguageCode,
		DifficultyFactor: 2.5,
		Interval:         0,
		NextReviewDate:   time.Now(), // Due immediately
	}

	if err := database.DB.Create(&word).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add word"})
		return
	}

	services.AddXP(userID.(uint), 50) // Base XP for a new word

	c.JSON(http.StatusCreated, word)
}

func GetWords(c *gin.Context) {
	userID, _ := c.Get("userID")
	lang := c.Query("lang")

	var words []models.Word
	query := database.DB.Where("user_id = ?", userID.(uint))

	if lang != "" {
		query = query.Where("language_code = ?", lang)
	}

	if err := query.Find(&words).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve words"})
		return
	}

	c.JSON(http.StatusOK, words)
}

func DeleteWord(c *gin.Context) {
	userID, _ := c.Get("userID")
	wordID := c.Param("id")

	var word models.Word
	if err := database.DB.Where("id = ? AND user_id = ?", wordID, userID.(uint)).First(&word).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Word not found"})
		return
	}

	if err := database.DB.Delete(&word).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete word"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Word deleted successfully"})
}

func GetNextCards(c *gin.Context) {
	userID, _ := c.Get("userID")

	var cards []models.Word
	if err := database.DB.Where("user_id = ? AND next_review_date <= ?", userID.(uint), time.Now()).Find(&cards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch review cards"})
		return
	}

	c.JSON(http.StatusOK, cards)
}

type ReviewRequest struct {
	Score int `json:"score" binding:"required,min=0,max=5"`
}

func ReviewCard(c *gin.Context) {
	userID, _ := c.Get("userID")
	cardID := c.Param("id")

	var req ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var word models.Word
	if err := database.DB.Where("id = ? AND user_id = ?", cardID, userID.(uint)).First(&word).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Card not found"})
		return
	}

	// Invoke the SM-2 logic
	services.CalculateNextReview(&word, req.Score)

	if err := database.DB.Save(&word).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review status"})
		return
	}

	services.AddXP(userID.(uint), 10*req.Score) // Reward XP based on score (1-5)

	c.JSON(http.StatusOK, gin.H{
		"message": "Review recorded successfully",
		"card":    word,
	})
}
