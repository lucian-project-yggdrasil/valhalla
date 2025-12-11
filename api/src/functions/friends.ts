import { app, HttpRequest, HttpResponseInit } from "@azure/functions"
import { Logger } from "@lucian/runes"
import { CreateFriendSchema, FriendRepository } from "@lucian/runes/social"
import { DateTime } from "luxon"
import { z } from "zod"

const repo = new FriendRepository()

export async function friends(request: HttpRequest): Promise<HttpResponseInit> {
	const tenantId = "demo-tenant-001"

	try {
		switch (request.method) {
			case "GET": {
				Logger.info(`[API] Fetching friends for tenant: ${tenantId}`)
				const list = await repo.fetchAll(tenantId)
				return { jsonBody: list }
			}

			case "POST": {
				const body: unknown = await request.json()
				const validation = CreateFriendSchema.safeParse(body)

				if (!validation.success) {
					Logger.warn("[API] Validation Failed", z.treeifyError(validation.error))
					return { status: 400, jsonBody: { error: z.treeifyError(validation.error) } }
				}

				const now = DateTime.now().toISO()
				const saved = await repo.create({
					...validation.data,
					id: crypto.randomUUID(),
					tenantId,
					createdAt: now,
					updatedAt: now,
					interactions: [],
				})

				Logger.info(`[API] Created friend: ${saved.name} ${saved.id}`)
				return { status: 201, jsonBody: saved }
			}

			default:
				return { status: 405, body: "Method Not Allowed" }
		}
	} catch (err) {
		Logger.error("[API] Error", err)
		return { status: 500, jsonBody: { error: "Internal Server Error" } }
	}
}

app.http("friends", {
	methods: ["GET", "POST"],
	authLevel: "anonymous",
	handler: friends,
})
