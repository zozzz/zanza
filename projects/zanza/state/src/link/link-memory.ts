import { Injectable } from "@angular/core"
import { Observable, of } from "rxjs"

import { Slice } from "@zanza/common"
import { Entity, EntityType, EntityPk, getEntityPk } from "../entity"
import { MemoryStorage } from "../storage"
import { Link } from "./link"
import { Filter, Query, Reducer, Sorter } from "./query"
import { Request } from "./request"


export class MemoryRequest<E extends Entity, R = E> extends Request<E, R> {
    constructor(private cb: () => R) {
        super()
    }

    reduce(reducer: Reducer<E>): this {
        return this
    }

    options(...option: any): this {
        return this
    }

    protected do(): Observable<R> {
        return of(this.cb())
    }

}


export class MemoryQuery<T extends Entity> extends Query<T> {
    readonly #items: T[]

    constructor(entityType: EntityType<T>, items: T[]) {
        super(entityType)
        this.#items = items
    }

    protected query(filter: Filter<T>, sorter: Sorter<T>, slice: Slice, reduce: Reducer<T>): Observable<T[]> {
        console.log("MemoryQuery.query", { filter, sorter, slice, reduce })
        throw new Error("Method not implemented.")
    }

    options(...option: any): this {
        throw new Error("Method not implemented.")
    }

}


export class MemoryLink<T extends Entity = Entity> extends Link {
    readonly isAsync: boolean = false
    readonly #items = new MemoryStorage()

    constructor(values: T[])
    constructor(entityType: EntityType<T>, values: T[])

    constructor(a1?: any, a2?: any) {
        super()

        // if (Array.isArray(a1)) {
        //     for (const ent of a1) {
        //         this.items[ent.pk] = ent
        //     }
        // } else if (typeof a1 === "function") {
        //     if (Array.isArray(a2)) {
        //         for (const inp of a2) {
        //             const ent = isEntity(inp) ? inp : new a1(inp)
        //             this.items[ent.pk] = ent
        //         }
        //     } else {
        //         for (const k in a1) {
        //             if (a1.hasOwnProperty(k)) {
        //                 this.items[k] = a1[k]
        //             }
        //         }
        //     }
        // }
    }

    save<E extends Entity = Entity>(entity: E): Request<E, E> {
        return new MemoryRequest(() => {
            if (getEntityPk(entity)) {
                throw new Error("Missing primary key fields")
            }
            this.#items.set(entity)
            return entity
        })
    }

    query<E extends Entity = Entity>(entityType: EntityType<E>): Query<E> {
        return new MemoryQuery<E>(entityType, [])
    }

    load<E extends Entity = Entity>(entityType: EntityType<E>, id: EntityPk): Request<E, E | undefined> {
        return new MemoryRequest(() => {
            return this.#items.get(entityType, id)
        })
    }

    remove<E extends Entity = Entity>(entityType: EntityType<E>, id: EntityPk): Request<E, boolean> {
        return new MemoryRequest(() => {
            this.#items.del(entityType, id)
            return true as boolean
        })
    }
}
