package models

import (
	"time"
)

type User struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	Username           string    `json:"username" gorm:"unique"`
	Email              string    `json:"email" gorm:"unique"`
	HashedPassword     string    `json:"-"`
	AvatarURL          string    `json:"avatar_url"`
	Level              int       `json:"level" gorm:"default:1"`
	XPPoints           int       `json:"xp_points" gorm:"default:0"`
	DarkMode           bool      `json:"dark_mode" gorm:"default:false"`
	EmailNotifications bool      `json:"email_notifications" gorm:"default:true"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type Word struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"user_id"`
	Text             string    `json:"text"`
	Translation      string    `json:"translation"`
	LanguageCode     string    `json:"language_code"` // e.g. EN, PL, KA, HY
	DifficultyFactor float64   `json:"difficulty_factor" gorm:"default:2.5"`
	Interval         int       `json:"interval" gorm:"default:0"` // in days
	NextReviewDate   time.Time `json:"next_review_date"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type LessonProgress struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	LessonID  int       `json:"lesson_id"`
	Status    string    `json:"status"` // "locked", "unlocked", "completed"
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
