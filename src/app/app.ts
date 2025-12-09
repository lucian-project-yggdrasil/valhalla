import { Component, OnInit, signal } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { greet } from "@lucian/runes"

@Component({
	selector: "app-root",
	imports: [RouterOutlet],
	templateUrl: "./app.html",
	styleUrl: "./app.scss",
})
export class App implements OnInit {
	protected readonly title = signal("valhalla")
	protected readonly message = signal("Connecting...")

	ngOnInit() {
		// 1. Call the library
		const response = greet("Lucian")
		this.message.set(response)

		// 2. Log to console to verify Zoneless is happy
		console.log("Valhalla Initialized via Runes:", this.message())
	}
}
