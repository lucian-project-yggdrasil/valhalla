import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { BaseRepository, CreateFriendSchema, Friend } from "@lucian/runes"
import { z } from "zod"

const friendRepo = new BaseRepository<Friend>(
	process.env.COSMOS_CONNECTION_STRING!,
	"yggdrasil-data",
	"valhalla-friends",
)

export async function friends(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const method = request.method
	const tenantId = "demo-tenant-001" // Still mocked for now

	try {
		if (method === "GET") {
			const friends = await friendRepo.findByTenant(tenantId)
			return { jsonBody: friends }
		}

		if (method === "POST") {
			const body = await request.json()

			const result = CreateFriendSchema.safeParse(body)
			if (!result.success) {
				return { status: 400, jsonBody: { error: z.treeifyError(result.error) } }
			}

			const newFriend: Friend = {
				id: crypto.randomUUID(),
				tenantId,
				createdAt: new Date().toISOString(),
				name: result.data.name,
				status: result.data.status,
				email: result.data.email,
				location: result.data.location,
			}

			const saved = await friendRepo.create(newFriend)
			return { status: 201, jsonBody: saved }
		}
	} catch (err) {
		context.error(err)
		return { status: 500, body: "Server Error" }
	}

	return { status: 405, body: "Method Not Allowed" }
}

app.http("friends", {
	methods: ["GET", "POST"],
	authLevel: "anonymous",
	handler: friends,
})
