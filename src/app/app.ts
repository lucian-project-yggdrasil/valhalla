import { CommonModule } from "@angular/common"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Component, inject, OnInit, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { type Friend } from "@lucian/runes/social"
import { firstValueFrom } from "rxjs"

interface ZodErrorMap {
	_errors: string[]
	[key: string]: { _errors: string[] } | string[]
}

interface ApiErrorResponse {
	error: ZodErrorMap
}

@Component({
	selector: "app-root",
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App implements OnInit {
	private http = inject(HttpClient)

	friends = signal<Friend[]>([])
	newFriendName = ""
	errorMessage = signal("")

	private getZodError(response: ApiErrorResponse): string {
		if (!response?.error) return "Unknown error occurred"

		// Global errors
		if (response.error._errors && response.error._errors.length > 0) {
			return response.error._errors.join(", ")
		}

		// We check common fields or just take the first one found
		const firstKey = Object.keys(response.error).find(k => k !== "_errors")
		if (firstKey) {
			const fieldError = response.error[firstKey] as { _errors: string[] }
			return `${firstKey}: ${fieldError._errors[0]}`
		}

		return "Validation failed"
	}

	async ngOnInit() {
		await this.loadFriends()
	}

	async addFriend() {
		this.errorMessage.set("")

		const payload = {
			name: this.newFriendName,
			tier: "network",
			targetFrequency: "monthly",
		}

		try {
			await firstValueFrom(this.http.post<Friend>("/api/friends", payload))

			this.newFriendName = ""
			await this.loadFriends()
		} catch (err: unknown) {
			console.error(err)

			if (err instanceof HttpErrorResponse) {
				const apiError = err.error as ApiErrorResponse
				this.errorMessage.set(this.getZodError(apiError))
			} else {
				this.errorMessage.set("An unexpected error occurred.")
			}
		}
	}

	async loadFriends() {
		try {
			const data = await firstValueFrom(this.http.get<Friend[]>("/api/friends"))
			this.friends.set(data)
		} catch {
			this.errorMessage.set("Failed to load friends.")
		}
	}
}
