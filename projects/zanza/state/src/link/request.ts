import { Observable } from "rxjs"

import type { Entity } from "../entity"
import type { Reducer } from "./query"


type SuccessFn<T> = (arg: T) => void
type FailureFn = (arg: Error) => void


export abstract class Request<E extends Entity, R = E> extends Observable<R> {
    abstract reduce(reducer: Reducer<E>): this
    abstract options(...option: any): this
    protected abstract do(): Observable<R>

    readonly #begin: Array<(request: Request<E, R>) => void> = []
    readonly #success: Array<SuccessFn<R>> = []
    readonly #failure: FailureFn[] = []
    readonly #finally: Array<(request: Request<E, R>) => void> = []

    constructor() {
        super(subscriber => {
            for (const fn of this.#begin) {
                fn(this)
            }

            const s = this.do()
                .subscribe(
                    succ => {
                        for (const fn of this.#success) {
                            fn(succ)
                        }
                    },
                    err => {
                        // TODO: hogyan legyen a hibakezelés
                        // console.error(err)
                        for (const fn of this.#failure) {
                            fn(err)
                        }

                        if (this.#failure.length === 0) {
                            subscriber.error(err)
                        }
                    },
                    () => {
                        for (const fn of this.#finally) {
                            fn(this)
                        }
                        subscriber.complete.bind(subscriber)
                    }
                )

            return s.unsubscribe.bind(s)
        })
    }

    begin(fn: (request: Request<E, R>) => void) {
        this.#begin.push(fn)
        return this
    }

    success(fn: SuccessFn<R>) {
        this.#success.push(fn)
        return this
    }

    failure(fn: FailureFn) {
        this.#failure.push(fn)
        return this
    }

    finally(fn: (request: Request<E, R>) => void) {
        this.#finally.push(fn)
        return this
    }
}
