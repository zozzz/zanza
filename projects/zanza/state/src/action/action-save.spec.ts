import { TestBed } from "@angular/core/testing"

import { Link, MemoryLink, Request } from "../link"
import { Storage, MemoryStorage } from "../storage"
import { Entity, getEntityTypeOptions } from "../entity"
import { EntityActions, DEFAULT_ENTITY_OPTIONS } from "./action"
import { save } from "./action-save"


class User extends Entity.extend("User", {
    id: { primary: true, map: Number },
    name: String
}) { }


// PLAN
// function staticStorage(entity: any, items: any[]) {
//     const opt = getEntityTypeOptions(entity)
//     opt.link = opt.storage = new MemoryStorage(items.map(entity.coerce.bind(entity)))
// }


describe("action:save:success", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                EntityActions,
                {
                    provide: DEFAULT_ENTITY_OPTIONS,
                    useValue: {
                        link: new MemoryLink([]),
                        storage: new MemoryStorage(),
                    },
                    multi: true
                }
            ]
        })
    })

    it("run", (done) => {
        const actions = TestBed.inject(EntityActions)
        let beginCalled = false
        let successCalled = false
        let failureCalled = false
        let finallyCalled = false

        actions.do(save(new User({ id: 1 })))
            .begin(request => {
                expect(request).toBeInstanceOf(Request)
                beginCalled = true
            })
            .success(user => {
                expect(user).toBeInstanceOf(User)
                successCalled = true
            })
            .failure(() => {
                failureCalled = true
            })
            .finally(request => {
                expect(request).toBeInstanceOf(Request)
                finallyCalled = true
            })
            .subscribe(user => {
                expect(beginCalled).toBeTrue()
                expect(successCalled).toBeTrue()
                expect(failureCalled).toBeFalse()
                expect(finallyCalled).toBeTrue()
                expect(user).toBeInstanceOf(User)
                done()
            })
    })
})
