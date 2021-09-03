import { Directive, OnDestroy } from "@angular/core"

import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs"
import { take, takeUntil } from "rxjs/operators"

import { IAttribute } from "./attributes"


export interface IDisposable {
    dispose(): void
}


export class Destruct {
    readonly on: Observable<void> = new BehaviorSubject<void>(undefined)

    constructor(fn?: () => void) {
        if (fn != null) {
            this.any(fn)
        }
    }
    get done(): boolean { return (this.on as BehaviorSubject<void>).closed }

    sattr<T extends Subscription = Subscription>() {
        if (this.done) {
            throw new Error("Destruction is completed before seubscription attribute created")
        }
        const attr = new DSAttribute<T>()
        this.any(attr.del.bind(attr))

        return attr
    }

    sub<T>(o: Observable<T>): Observable<T> {
        if (this.done) {
            return o.pipe(take(0))
        } else {
            return o.pipe(takeUntil(this.on))
        }
    }

    disposable<T extends IDisposable>(d: T): T {
        if (this.done) {
            d.dispose()
        } else {
            this.on.subscribe(d.dispose.bind(d))
        }

        return d
    }

    node<T extends Node>(el: T): T {
        const remove = () => {
            const parent = el.parentNode
            if (parent) {
                parent.removeChild(el)
            }
        }
        if (this.done) {
            remove()
        } else {
            this.on.subscribe(remove)
        }

        return el
    }

    any(f: () => void): void {
        if (this.done) {
            f()
        } else {
            this.on.subscribe(f)
        }
    }

    run() {
        if (!this.done) {
            (this.on as Subject<void>).next();
            (this.on as Subject<void>).complete()
        }
    }
}


@Directive()
export abstract class Destructible implements OnDestroy, IDisposable {
    readonly d = new Destruct()

    ngOnDestroy() {
        this.d.run()
        delete (this as any).d

    }

    dispose() {
        this.ngOnDestroy()
    }
}


export class DSAttribute<T extends Subscription> implements IAttribute<T> {
    private _value?: T

    get(): T | undefined {
        return this._value
    }

    set(val: T) {
        this._value?.unsubscribe()
        this._value = val
    }

    del() {
        if (this._value != undefined) {
            this._value.unsubscribe()
            delete this._value
        }
    }
}
