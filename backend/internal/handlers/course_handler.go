package handlers

import (
	"net/http"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"
	"doubletalk-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type LessonUpdateRequest struct {
	LessonID int    `json:"lesson_id"`
	Status   string `json:"status"` // completed (or unlocked)
}

func GetCourseProgress(c *gin.Context) {
	userID, _ := c.Get("userID")

	var progress []models.LessonProgress
	if err := database.DB.Where("user_id = ?", userID).Find(&progress).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch progress"})
		return
	}

	c.JSON(http.StatusOK, progress)
}

func UpdateLessonStatus(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req LessonUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var progress models.LessonProgress
	// Check if record exists
	err := database.DB.Where("user_id = ? AND lesson_id = ?", userID, req.LessonID).First(&progress).Error

	if err != nil {
		// Does not exist, create it
		progress = models.LessonProgress{
			UserID:   userID.(uint),
			LessonID: req.LessonID,
			Status:   req.Status,
		}
		database.DB.Create(&progress)
	} else {
		// Update status
		progress.Status = req.Status
		database.DB.Save(&progress)
	}

	// Reward XP on completion
	if req.Status == "completed" {
		services.AddXP(userID.(uint), 100) // 100 XP for finishing a lesson
	}

	c.JSON(http.StatusOK, gin.H{"message": "Lesson status updated", "progress": progress})
}
