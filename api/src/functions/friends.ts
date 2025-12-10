import { app, HttpRequest, HttpResponseInit } from "@azure/functions"
import { Logger } from "@lucian/runes"
import { FriendRepository, FriendSchema } from "@lucian/runes/social"

const repo = new FriendRepository()

export async function friends(request: HttpRequest): Promise<HttpResponseInit> {
	const method = request.method
	const tenantId = "demo-tenant-001"

	try {
		// --- GET: List Friends ---
		if (method === "GET") {
			const friends = await repo.fetchAll(tenantId)
			return { jsonBody: friends }
		}

		// --- POST: Create Friend ---
		if (method === "POST") {
			const body: unknown = await request.json()

			const result = FriendSchema.safeParse({
				...(body as Record<string, unknown>),
				tenantId,
			})

			if (!result.success) {
				Logger.warn("Validation Failed", result.error.format())
				return { status: 400, jsonBody: { error: result.error.format() } }
			}

			const saved = await repo.create({
				...result.data,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})

			return { status: 201, jsonBody: saved }
		}
	} catch (err) {
		Logger.error("API Error", err)
		return { status: 500, jsonBody: { error: "Internal Server Error" } }
	}

	return { status: 405, body: "Method Not Allowed" }
}

app.http("friends", {
	methods: ["GET", "POST"],
	authLevel: "anonymous",
	handler: friends,
})
