import { CommonModule } from "@angular/common"
import { Component, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { CreateFriendDto, Friend } from "@lucian/runes"

@Component({
	selector: "app-root",
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App {
	friends = signal<Friend[]>([])
	newFriendName = ""
	errorMessage = signal("")

	async addFriend() {
		this.errorMessage.set("")
		const payload: CreateFriendDto = { name: this.newFriendName, status: "Warm" }
		const res = await fetch("/api/friends", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		})
		if (res.ok) {
			this.newFriendName = ""
			this.loadFriends()
		} else {
			const errorData = await res.json()
			if (errorData.error?.details?.name) {
				this.errorMessage.set(`Error: ${errorData.error.details.name._errors[0]}`)
			} else {
				this.errorMessage.set("Failed.")
			}
		}
	}

	async loadFriends() {
		const res = await fetch("/api/friends")
		const data = await res.json()
		this.friends.set(data)
	}
}
