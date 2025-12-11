import { HttpClient } from "@angular/common/http"
import { Injectable, inject, signal } from "@angular/core"
import { CreateFriendDto, Friend } from "@lucian/runes/social"
import { firstValueFrom } from "rxjs"

@Injectable({ providedIn: "root" })
export class FriendService {
	private http = inject(HttpClient)
	readonly friends = signal<Friend[]>([])

	async loadFriends() {
		const data = await firstValueFrom(this.http.get<Friend[]>("/api/friends"))
		this.friends.set(data)
	}

	async addFriend(payload: CreateFriendDto) {
		const newFriend = await firstValueFrom(this.http.post<Friend>("/api/friends", payload))
		this.friends.update(list => [...list, newFriend])
		this.loadFriends()
	}

	async analyze(base64: string) {
		const response = await firstValueFrom(this.http.post<any>("/api/analyze", { image: base64 }))
		return response
	}
}
