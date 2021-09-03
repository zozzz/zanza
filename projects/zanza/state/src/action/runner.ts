import { Injectable } from "@angular/core"
import { Observable, Subject } from "rxjs"
import { share } from "rxjs/operators"

import { Destructible } from "@zanza/common"
import { Request } from "../link"
import type { EntityAction } from "./action"


export class ActionEvent {

}


@Injectable({ providedIn: "root" })
export class ActionRunner extends Destructible {
    readonly #actions = new Subject<EntityAction>()
    readonly #events = new Subject<ActionEvent>()

    readonly actions = this.#actions.pipe(share())
    readonly events = this.#events.pipe(share())

    constructor() {
        super()
        this.d.sub(this.#actions).subscribe(this.#execute.bind(this))
    }

    do<A extends EntityAction, R extends Observable<unknown> = ReturnType<A["do"]>>(action: A): R {
        const req = action.do()
        if (req instanceof Request) {
            req
                .begin(a => this.#events.next())
                .success(succ => this.#events.next())
                .failure(succ => this.#events.next())
        }
        return req as any
    }

    #execute(action: EntityAction) {
        return null
    }
}
