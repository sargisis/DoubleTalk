package database

import (
	"log"

	"doubletalk-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("doubletalk.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection successfully opened.")

	// Auto-Migrate the schema
	err = DB.AutoMigrate(&models.User{}, &models.Word{}, &models.LessonProgress{}, &models.Homework{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate database schema: %v", err)
	}

	// Seed initial homework data
	var homeworkCount int64
	DB.Model(&models.Homework{}).Count(&homeworkCount)
	if homeworkCount == 0 {
		DB.Create(&models.Homework{
			LessonID:       103,
			Title:          "Saying Hello",
			Description:    "Complete the phrase to greet someone politely.",
			SentencePrefix: "Dzień ",
			SentenceSuffix: "!",
			Translation:    "(Good morning!)",
			CorrectWord:    "dobry",
			WordBank:       `["dobrze", "dobry", "dziękuję", "do widzenia"]`,
		})

		DB.Create(&models.Homework{
			LessonID:       202,
			Title:          "Manners Quiz",
			Description:    "Select the missing word.",
			SentencePrefix: "Proszę i ",
			SentenceSuffix: ".",
			Translation:    "(Please and thank you.)",
			CorrectWord:    "dziękuję",
			WordBank:       `["przepraszam", "tak", "nie", "dziękuję"]`,
		})
		log.Println("Seeded initial homework data.")
	}

	log.Println("Database schema auto-migrated.")
}
