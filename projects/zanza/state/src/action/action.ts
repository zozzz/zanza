// tslint:disable:max-line-length
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"

import { Storage } from "../storage"
import { Link } from "../link"
import { ActionRunner } from "./runner"


type EntityActionExec = (link: Link, storage: Storage) => Observable<any>


const LINK = Symbol("EntityAction.link")
const STORAGE = Symbol("EntityAction.storage")


export class EntityAction<F extends EntityActionExec = EntityActionExec> {
    readonly #executor: F

    [LINK]: Link
    [STORAGE]: Storage

    constructor(readonly id: any, executor: F) {
        this.#executor = executor
    }

    do(): ReturnType<F> {
        return this.#executor(this[LINK], this[STORAGE]) as any
    }
}


@Injectable()
export class EntityActions {
    constructor(
        private readonly runner: ActionRunner,
        private readonly link: Link,
        private readonly storage: Storage) {

    }

    // TODO: multiple actions
    do<A extends EntityAction, R extends Observable<unknown> = ReturnType<A["do"]>>(action: A): R {
        action[LINK] = this.link
        action[STORAGE] = this.storage
        return this.runner.do(action)


        // return new Observable(subscriber => {
        //     const s = action[ACTION_RESULT].subscribe(subscriber)
        //     this.runner.run(action)
        //     return s.unsubscribe.bind(s)
        // })
    }

    on<L extends (stream: any) => Observable<any>>(listener: L): ReturnType<L> {
        return null as any
    }
}
