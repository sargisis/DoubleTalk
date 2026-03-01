package services

import (
	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"
)

// AddXP grants points to a user and levels them up if they pass the threshold.
func AddXP(userID uint, points int) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return
	}

	user.XPPoints += points
	user.Level = 1 + (user.XPPoints / 500) // Level up every 500 points

	database.DB.Save(&user)
}
