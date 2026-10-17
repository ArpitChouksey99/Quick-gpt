import genAI from "../configs/gemini.js"

// Tried in order. Override the list with GEMINI_MODELS="model-a,model-b".
const MODELS = (process.env.GEMINI_MODELS || "gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)

const RETRIES_PER_MODEL = 2 // total attempts per model = 1 + this
const RETRYABLE = [429, 500, 503, 504]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Generates text, retrying briefly on temporary Google errors (503 "high demand",
// 429 rate limit) and then falling back to the next model in the list.
// Errors that retrying cannot fix (bad key, blocked prompt, ...) are thrown at once.
// `input` is either a plain string, or an array of turns (conversation history).
export const generateText = async (input) => {
    const request = typeof input === "string" ? input : { contents: input }
    let lastError

    for (const modelName of MODELS) {
        const model = genAI.getGenerativeModel({ model: modelName })

        for (let attempt = 0; attempt <= RETRIES_PER_MODEL; attempt++) {
            try {
                const result = await model.generateContent(request)
                return result.response.text()
            } catch (error) {
                lastError = error
                if (!RETRYABLE.includes(error.status)) throw error
                console.log(`Gemini ${modelName} returned ${error.status} (attempt ${attempt + 1}), retrying`)
                if (attempt < RETRIES_PER_MODEL) await sleep(800 * 2 ** attempt)
            }
        }
    }

    const error = new Error("The AI service is busy right now. Please try again in a moment.")
    error.cause = lastError
    throw error
}
