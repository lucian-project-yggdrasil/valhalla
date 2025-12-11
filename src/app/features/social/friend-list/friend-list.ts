import { CommonModule } from "@angular/common"
import { Component, inject, OnInit } from "@angular/core"
import { Friend, getRelationshipStatus } from "@lucian/runes/social"
import { FriendService } from "../../../core/services/friend"

@Component({
	selector: "app-friend-list",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./friend-list.html",
	styleUrls: ["./friend-list.scss"],
})
export class FriendListComponent implements OnInit {
	friendService = inject(FriendService)

	ngOnInit() {
		this.friendService.loadFriends()
	}

	refresh() {
		this.friendService.loadFriends()
	}

	getStatus(friend: Friend) {
		return getRelationshipStatus(friend)
	}

	async logQuickInteraction(friend: Friend) {
		const note = prompt(`Log interaction with ${friend.name}?`, "Caught up over coffee")
		if (!note) return

		try {
			await this.friendService.logInteraction(friend.id!, "meet", note)
		} catch {
			alert("Failed to log.")
		}
	}
}
