// Conversation memory helpers.
// Gemini takes earlier turns as [{role: "user" | "model", parts: [{text}]}, ...].

const MAX_MESSAGES = Number(process.env.HISTORY_MESSAGES) || 10 // last N messages sent as memory
const MAX_CHARS = 12000 // cap on total history size, newest messages win
const SHORT_QUESTION = 80 // below this length a question is probably a follow-up

const toTurn = (m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
})

// Gemini expects alternating roles that start with "user". Join neighbours with
// the same role and drop any leading "model" turn.
const normalise = (turns) => {
    const merged = []
    for (const turn of turns) {
        const last = merged[merged.length - 1]
        if (last && last.role === turn.role) {
            last.parts[0].text += "\n\n" + turn.parts[0].text
        } else {
            merged.push({ role: turn.role, parts: [{ text: turn.parts[0].text }] })
        }
    }
    while (merged.length && merged[0].role !== "user") merged.shift()
    return merged
}

// Previous messages of this chat, as Gemini turns. Image messages hold a URL
// rather than text, so they are skipped.
export const buildHistory = (messages = []) => {
    const textOnly = messages.filter((m) => !m.isImage && m.content && m.content.trim())
    const recent = textOnly.slice(-MAX_MESSAGES)

    // keep the newest messages that fit in MAX_CHARS
    const kept = []
    let total = 0
    for (let i = recent.length - 1; i >= 0; i--) {
        total += recent[i].content.length
        if (total > MAX_CHARS && kept.length > 0) break
        kept.unshift(recent[i])
    }
    return normalise(kept.map(toTurn))
}

// History + the new user turn, ready for generateContent({ contents }).
export const buildContents = (history, finalPrompt) =>
    normalise([...history, { role: "user", parts: [{ text: finalPrompt }] }])

// What to search the PDF with. A short follow-up such as "explain more" has no
// topic of its own, so it borrows the previous question.
export const buildSearchQuery = (prompt, messages = []) => {
    if (prompt.trim().length >= SHORT_QUESTION) return prompt
    const previous = [...messages].reverse().find((m) => m.role === "user" && !m.isImage && m.content)
    return previous ? `${previous.content}\n${prompt}` : prompt
}
