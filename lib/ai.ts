import { mistral } from "@ai-sdk/mistral"
import { generateText, streamText } from "ai"

export const aiModel = mistral("mistral-large-latest")

export const TRIAGE_SYSTEM_PROMPT = `You are a medical triage AI assistant for TeleMed. Your role is to:

1. Collect patient symptoms in a conversational, empathetic manner
2. Ask relevant follow-up questions to understand the severity and nature of symptoms
3. Determine when you have enough information to recommend a doctor
4. NEVER provide medical diagnoses or treatment advice
5. Always be supportive and professional

Guidelines:
- Ask one question at a time
- Be empathetic and understanding
- Focus on symptom collection, not diagnosis
- When you have sufficient information (after 3-5 exchanges), end with: "TRIAGE_COMPLETE: [brief summary of symptoms]"
- If symptoms seem urgent, prioritize quickly: "URGENT_TRIAGE_COMPLETE: [brief summary]"

Start by greeting the patient and asking about their main concern.`

export async function generateAIResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  try {
    const { text } = await generateText({
      model: aiModel,
      system: TRIAGE_SYSTEM_PROMPT,
      messages,
    })
    return text
  } catch (error) {
    console.error("AI generation error:", error)
    return "I'm sorry, I'm having trouble connecting right now. Let me try to help you in a moment."
  }
}

export async function streamAIResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  try {
    const result = await streamText({
      model: aiModel,
      system: TRIAGE_SYSTEM_PROMPT,
      messages,
    })
    return result
  } catch (error) {
    console.error("AI streaming error:", error)
    throw error
  }
}
