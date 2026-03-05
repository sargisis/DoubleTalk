package services

import (
	"time"

	"doubletalk-backend/internal/models"
)

// CalculateNextReview calculates the next review date and new SM-2 parameters
// based on the SuperMemo-2 algorithm.
// q: Quality score from 0 to 5.
func CalculateNextReview(word *models.Word, q int) {
	if q < 0 {
		q = 0
	} else if q > 5 {
		q = 5
	}

	if q < 3 {
		// If score is less than 3, reset repetitions and interval
		word.Repetitions = 0
		word.Interval = 1
	} else {
		// Update Ease Factor (EF)
		qFloat := float64(q)
		newEF := word.DifficultyFactor + (0.1 - (5.0-qFloat)*(0.08+(5.0-qFloat)*0.02))

		// EF should not fall below 1.3
		if newEF < 1.3 {
			newEF = 1.3
		}
		word.DifficultyFactor = newEF

		// Calculate Next Interval based on Repetitions
		if word.Repetitions == 0 {
			word.Interval = 1
		} else if word.Repetitions == 1 {
			word.Interval = 6
		} else {
			word.Interval = int(float64(word.Interval) * newEF)
		}

		word.Repetitions++
	}

	// Update NextReviewDate using new interval
	word.NextReviewDate = time.Now().AddDate(0, 0, word.Interval)
}
