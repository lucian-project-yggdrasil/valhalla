import { CommonModule } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http"
import { Component, inject, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { CreateFriendDto } from "@lucian/runes/social"
import { FriendService } from "../../../core/services/friend"

interface ZodErrorMap {
	_errors: string[]
	[key: string]: { _errors: string[] } | string[]
}

interface ApiErrorResponse {
	error: ZodErrorMap
}

@Component({
	selector: "app-add-friend",
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: "./add-friend.html",
	styleUrls: ["./add-friend.scss"],
})
export class AddFriendComponent {
	private friendService = inject(FriendService)

	isAnalyzing = signal(false)
	errorMessage = signal("")

	name = signal("")
	email = signal("")
	tags = signal("")
	facts = signal("")
	notes = signal("")

	async onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files?.length) return

		const file = input.files[0]
		this.isAnalyzing.set(true)
		this.errorMessage.set("")

		try {
			const base64 = await this.toBase64(file)
			const response = await this.friendService.analyze(base64)
			console.log("⚡ AI Response:", response)

			this.resetForm()

			if (response.name) this.name.set(response.name)
			if (response.email) this.email.set(response.email)
			if (response.notes) this.notes.set(response.notes)
			if (response.tags && Array.isArray(response.tags)) {
				this.tags.set(response.tags.join(", "))
			}
			if (response.facts && Array.isArray(response.facts)) {
				this.facts.set(response.facts.join("\n"))
			}
		} catch (err) {
			console.error(err)
			this.errorMessage.set("AI Analysis failed. Please try manual entry.")
		} finally {
			this.isAnalyzing.set(false)
			input.value = ""
		}
	}

	async save() {
		this.errorMessage.set("")

		const tagsArray = this.tags()
			.split(",")
			.map(t => t.trim())
			.filter(t => t.length)
		const factsArray = this.facts()
			.split("\n")
			.map(t => t.trim())
			.filter(t => t.length)

		const payload: CreateFriendDto = {
			name: this.name(),
			email: this.email() || undefined,
			tags: tagsArray,
			facts: [...factsArray, `Notes: ${this.notes()}`],
			tier: "network",
			targetFrequency: "monthly",
		}

		try {
			await this.friendService.addFriend(payload)
			this.resetForm()
		} catch (err) {
			console.error(err)

			if (err instanceof HttpErrorResponse) {
				const apiError = err.error as ApiErrorResponse
				this.errorMessage.set(this.getZodError(apiError))
			} else {
				this.errorMessage.set("An unexpected error occurred.")
			}
		}
	}

	private resetForm() {
		this.name.set("")
		this.email.set("")
		this.tags.set("")
		this.facts.set("")
		this.notes.set("")
	}

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

	private toBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = error => reject(error)
		})
	}
}
