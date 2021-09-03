import { TestBed } from "@angular/core/testing"

import { Link, MemoryLink, Request } from "../link"
import { Storage, MemoryStorage } from "../storage"
import { Entity } from "../entity"
import { EntityActions } from "./action"
import { save } from "./action-save"


class User extends Entity {
    name?: string
}


describe("action:save:success", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                EntityActions,
                { provide: Link, useClass: MemoryLink },
                { provide: Storage, useClass: MemoryStorage },
            ]
        })
    })

    // it("run", (done) => {
    //     const actions = TestBed.inject(EntityActions)
    //     let beginCalled = false
    //     let successCalled = false
    //     let failureCalled = false
    //     let finallyCalled = false

    //     actions.do(save(new User()))
    //         .begin(request => {
    //             expect(request).toBeInstanceOf(Request)
    //             beginCalled = true
    //         })
    //         .success(user => {
    //             expect(user).toBeInstanceOf(User)
    //             successCalled = true
    //         })
    //         .failure(() => {
    //             failureCalled = true
    //         })
    //         .finally(request => {
    //             expect(request).toBeInstanceOf(Request)
    //             finallyCalled = true
    //         })
    //         .subscribe(user => {
    //             expect(beginCalled).toBeTrue()
    //             expect(successCalled).toBeTrue()
    //             expect(failureCalled).toBeFalse()
    //             expect(finallyCalled).toBeTrue()
    //             expect(user).toBeInstanceOf(User)
    //             done()
    //         })
    // })
})
