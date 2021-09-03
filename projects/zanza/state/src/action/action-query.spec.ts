import { Provider } from "@angular/core"
import { TestBed } from "@angular/core/testing"

import { Link, MemoryLink } from "../link"
import { Storage, MemoryStorage } from "../storage"
import { Entity } from "../entity"
import { EntityActions } from "./action"
import { query } from "./action-query"
import { catchError } from "rxjs/operators"
import { of } from "rxjs"


class User extends Entity {
    name?: string
}


describe("action:save", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                EntityActions,
                { provide: Link, useFactory: () => new MemoryLink<User>([]) },
                { provide: Storage, useClass: MemoryStorage },
            ]
        })
    })

    // it("run", () => new Promise<void>((resolve, reject) => {
    //     console.log("WTF???")
    //     const actions = TestBed.inject(EntityActions)
    //     const q = actions.do(query(User))
    //     console.log(q)

    //     q
    //         .filter({ x: 42 })
    //         .sort({ name: "asc" })
    //         .failure(reject)
    //         .subscribe(res => {
    //             console.log("DONE", res)
    //             resolve()
    //         })
    // })
    // )
})
