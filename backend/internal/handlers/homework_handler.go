package handlers

import (
	"encoding/json"
	"net/http"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type HomeworkResponse struct {
	ID             uint     `json:"id"`
	LessonID       int      `json:"lesson_id"`
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	SentencePrefix string   `json:"sentencePrefix"`
	SentenceSuffix string   `json:"sentenceSuffix"`
	Translation    string   `json:"translation"`
	CorrectWord    string   `json:"correctWord"`
	WordBank       []string `json:"wordBank"`
}

func GetHomework(c *gin.Context) {
	lessonID := c.Param("id")

	var hw models.Homework
	if err := database.DB.Where("lesson_id = ?", lessonID).First(&hw).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Homework not found"})
		return
	}

	var wordBank []string
	if err := json.Unmarshal([]byte(hw.WordBank), &wordBank); err != nil {
		// Fallback to empty if it fails to parse
		wordBank = []string{}
	}

	response := HomeworkResponse{
		ID:             hw.ID,
		LessonID:       hw.LessonID,
		Title:          hw.Title,
		Description:    hw.Description,
		SentencePrefix: hw.SentencePrefix,
		SentenceSuffix: hw.SentenceSuffix,
		Translation:    hw.Translation,
		CorrectWord:    hw.CorrectWord,
		WordBank:       wordBank,
	}

	c.JSON(http.StatusOK, response)
}
