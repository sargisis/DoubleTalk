package handlers

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Text       string `json:"text"`
	Correction string `json:"correction,omitempty"`
}

func ChatWithAI(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format."})
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize AI client."})
		return
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash") // Use Gemini 2.5 Flash

	systemPrompt := `You are a friendly Polish barista in Warsaw.
You are helping the user practice speaking Polish.
The user is a beginner learning Polish.
Keep your responses short, natural, and conversational.
ALWAYS respond in Polish, but if the user makes a GRAMMAR ERROR in their Polish message, you MUST append a correction in English at the very end of your message, separated by a special marker: "||CORRECTION||".
If the grammar is perfect, DO NOT append the marker or correction.

For example, if the user says: "Poproszę kawa"
You reply: "Dobry wybór! Jaką kawę wolisz: espresso czy cappuccino? ||CORRECTION|| Tip: After 'poproszę', you must use the Accusative case. 'Kawa' becomes 'Kawę'. Correct: 'Poproszę kawę.'"

If the user says: "Dzień dobry, poproszę kawę."
You reply: "Dzień dobry! Zrobimy najlepszą kawę dla ciebie. Espresso czy latte?"
`

	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(systemPrompt),
		},
	}

	resp, err := model.GenerateContent(ctx, genai.Text(req.Message))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI service unavailable. Details: " + err.Error()})
		return
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI returned empty response."})
		return
	}

	var rawResponseBuilder strings.Builder
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			rawResponseBuilder.WriteString(string(text))
		}
	}
	rawResponse := rawResponseBuilder.String()

	text := rawResponse
	correction := ""

	// Check for the special marker
	marker := "||CORRECTION||"
	parts := strings.Split(rawResponse, marker)
	if len(parts) > 1 {
		text = strings.TrimSpace(parts[0])
		correction = strings.TrimSpace(parts[1])
	}

	c.JSON(http.StatusOK, ChatResponse{
		Text:       text,
		Correction: correction,
	})
}
