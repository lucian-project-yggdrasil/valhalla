import { Component } from "@angular/core"
import { AddFriendComponent } from "./features/social/add-friend/add-friend"
import { FriendListComponent } from "./features/social/friend-list/friend-list"

@Component({
	selector: "app-root",
	standalone: true,
	imports: [AddFriendComponent, FriendListComponent],
	templateUrl: "./app.html",
	styleUrls: ["./app.scss"],
})
export class App {}
