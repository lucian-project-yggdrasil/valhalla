import { app, HttpRequest, HttpResponseInit } from "@azure/functions"
import { Logger } from "@lucian/runes"
import { FriendRepository, InteractionSchema } from "@lucian/runes/social"
import { DateTime } from "luxon"
import { z } from "zod"

const repo = new FriendRepository()

export async function interactions(request: HttpRequest): Promise<HttpResponseInit> {
	const tenantId = "demo-tenant-001"
	const friendId = request.params.id

	try {
		switch (request.method) {
			case "POST": {
				const body: unknown = await request.json()
				const validation = InteractionSchema.omit({ id: true, date: true }).safeParse(body)

				if (!validation.success) {
					return { status: 400, jsonBody: { error: z.treeifyError(validation.error) } }
				}

				const now = DateTime.now().toISO()
				const newInteraction = {
					id: crypto.randomUUID(),
					date: now,
					type: validation.data.type,
					notes: validation.data.notes,
				}

				await repo.logInteraction(friendId, tenantId, {
					id: crypto.randomUUID(),
					date: now,
					type: validation.data.type,
					notes: validation.data.notes,
				})

				Logger.info(`[API] Logged interaction for ${friendId}`)
				return { status: 201, jsonBody: newInteraction }
			}

			default:
				return { status: 405, body: "Method Not Allowed" }
		}
	} catch (err) {
		Logger.error("[API] Interaction Log Failed", err)
		return { status: 500, jsonBody: { error: "Failed to log interaction" } }
	}
}

app.http("interactions", {
	methods: ["POST"],
	authLevel: "anonymous",
	route: "friends/{id}/interactions",
	handler: interactions,
})
