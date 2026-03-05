package services

import (
	"time"

	"doubletalk-backend/internal/database"
	"doubletalk-backend/internal/models"
)

// UpdateStreak increments the user's streak if they haven't logged activity yet today.
func UpdateStreak(userID uint) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return
	}

	now := time.Now()
	last := user.LastActivityDate

	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	lastDay := time.Date(last.Year(), last.Month(), last.Day(), 0, 0, 0, 0, last.Location())
	daysDiff := int(today.Sub(lastDay).Hours() / 24)

	if user.Streak == 0 || last.IsZero() {
		user.Streak = 1
		user.LastActivityDate = now
		database.DB.Save(&user)
	} else if daysDiff == 1 {
		user.Streak++
		user.LastActivityDate = now
		database.DB.Save(&user)
	} else if daysDiff > 1 {
		user.Streak = 1
		user.LastActivityDate = now
		database.DB.Save(&user)
	}
	// If daysDiff == 0 (activity already logged today), don't increment or reset.
}

// AddXP grants points to a user and levels them up if they pass the threshold.
func AddXP(userID uint, points int) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return
	}

	now := time.Now()
	last := user.LastActivityDate

	// Calculate differences in days (ignoring hours/minutes)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	lastDay := time.Date(last.Year(), last.Month(), last.Day(), 0, 0, 0, 0, last.Location())
	daysDiff := int(today.Sub(lastDay).Hours() / 24)

	if user.Streak == 0 || last.IsZero() {
		user.Streak = 1
	} else if daysDiff == 1 {
		user.Streak++
	} else if daysDiff > 1 {
		user.Streak = 1
	}
	user.LastActivityDate = now

	user.XPPoints += points
	user.Level = 1 + (user.XPPoints / 500) // Level up every 500 points

	database.DB.Save(&user)
}
