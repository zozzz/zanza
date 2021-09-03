import { BehaviorSubject } from "rxjs"

import { diff as deepDiff } from "deep-diff"
import { Slice } from "./slice"


// TODO: Utils

export interface IAttribute<T> {
    get(): T | undefined
    set(value: T | undefined): void
    del(): void
}


export abstract class Attribute<T> extends BehaviorSubject<T> implements IAttribute<T> {
    constructor(intialValue?: T) {
        super(intialValue as any)
    }

    get(): T | undefined {
        return this.value
    }

    set(val: T): void {
        if (!this.isEq(val)) {
            this.next(val)
        }
    }

    del(): void {
        this.next(undefined as any)
    }

    trigger(): void {
        this.next(this.value)
    }

    abstract isEq(other: T): boolean
}


export class DictAttr<T extends { [key: string]: any } = { [key: string]: any }> extends Attribute<T> {
    override get(): T | undefined {
        return this.value === undefined ? undefined : clone(this.value)
    }

    isEq(other: T) {
        const diff = deepDiff(this.value, other)
        return !diff || diff.length === 0
    }
}


export class SliceAttr extends Attribute<Slice> {
    isEq(other: Slice) {
        return this.value.isEq(other)
    }
}


function clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v))
}
