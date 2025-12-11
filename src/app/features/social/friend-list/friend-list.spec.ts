import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FriendListComponent } from "./friend-list"

describe("FriendList", () => {
	let component: FriendListComponent
	let fixture: ComponentFixture<FriendListComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FriendListComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(FriendListComponent)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
