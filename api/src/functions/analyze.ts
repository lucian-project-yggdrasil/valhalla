import { app, HttpRequest, HttpResponseInit } from "@azure/functions"
import { Logger } from "@lucian/runes"
import { Friend } from "@lucian/runes/social"
import { AzureOpenAI } from "openai"
import { AI_PROMPTS } from "./prompts"

if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
	Logger.error("CRITICAL: Azure OpenAI Secrets missing.")
}

const openAI = new AzureOpenAI({
	endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
	apiKey: process.env.AZURE_OPENAI_KEY!,
	deployment: "gpt-4o",
	apiVersion: "2024-05-01-preview",
})

interface AnalyzeRequest {
	image?: string // Base64
	text?: string // "He got a new job at Microsoft"
	currentProfile?: Friend // If provided, we are ENRICHING
}

export async function analyze(request: HttpRequest): Promise<HttpResponseInit> {
	try {
		const body = (await request.json()) as AnalyzeRequest

		if (!body.image && !body.text) {
			return { status: 400, jsonBody: { error: "No input (image/text) provided." } }
		}

		const isEnrichment = !!body.currentProfile
		Logger.info(`[AI] Starting Analysis. Mode: ${isEnrichment ? "ENRICHMENT" : "CREATION"}`)

		const systemPrompt = isEnrichment
			? AI_PROMPTS.ENRICHMENT(body.currentProfile)
			: AI_PROMPTS.CREATION

		const userContent = []
		if (body.text) userContent.push({ type: "text", text: body.text })
		if (body.image) userContent.push({ type: "image_url", image_url: { url: body.image } })

		const response = await openAI.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userContent },
			],
			response_format: { type: "json_object" },
			temperature: 0.3, // Low creativity, high accuracy
			max_tokens: 1000, // COST GUARD: Hard limit (~$0.01 max risk per call)
		})

		const content = response.choices[0].message.content
		if (!content) throw new Error("AI returned empty response")

		try {
			const result = JSON.parse(content)
			return { jsonBody: result }
		} catch {
			Logger.warn("[AI] Response was truncated or malformed.")
			return {
				status: 422,
				jsonBody: { error: "The AI got confused. Please try again with a clearer image." },
			}
		}
	} catch (err) {
		Logger.error("[AI] Analysis Failed", err)
		return { status: 500, jsonBody: { error: "AI Processing Failed" } }
	}
}

app.http("analyze", {
	methods: ["POST"],
	authLevel: "anonymous",
	handler: analyze,
})
