import { ComponentFixture, TestBed } from "@angular/core/testing"
import { AddFriendComponent } from "./add-friend"

describe("AddFriend", () => {
	let component: AddFriendComponent
	let fixture: ComponentFixture<AddFriendComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AddFriendComponent],
		}).compileComponents()

		fixture = TestBed.createComponent(AddFriendComponent)
		component = fixture.componentInstance
		await fixture.whenStable()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
