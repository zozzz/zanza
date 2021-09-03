import { Subject, BehaviorSubject, Observable, isObservable, merge, of } from "rxjs"
import { startWith, tap, debounceTime, switchMap, share, take, mapTo } from "rxjs/operators"


import { Destruct, DictAttr, SliceAttr, Slice } from "@zanza/common"

import type { Entity, EntityType, EntityFieldPaths, EntityFieldPathNames, EntityFields, EntityFieldNames } from "../entity"
import { Request } from "./request"


type Filter_Eq<T> = { $eq: T }
type Filter_Neq<T> = { $neq: T }
type Filter_Gt<T> = { $gt: T }
type Filter_Gte<T> = { $gte: T }
type Filter_Lt<T> = { $lt: T }
type Filter_Lte<T> = { $lte: T }
type Filter_Contains<T> = { $contains: T }
type Filter_StartsWith<T> = { $startsWith: T }
type Filter_EndsWith<T> = { $endsWith: T }
type Filter_Between<T> = ((Filter_Gt<T> | Filter_Gte<T>) & (Filter_Lt<T> | Filter_Lte<T>))
type Filter_FieldOr<T> = { $or: Array<T | Filter_Basic<T>> }
type Filter_FieldAnd<T> = { $and: Array<T | Filter_Basic<T>> }
type Filter_Basic<T> =
    Filter_Eq<T>
    | Filter_Neq<T>
    | Filter_Gt<T>
    | Filter_Gte<T>
    | Filter_Lt<T>
    | Filter_Lte<T>
    | Filter_Between<T>
    | Filter_Contains<T>
    | Filter_StartsWith<T>
    | Filter_EndsWith<T>

type Filter_Field<T> = Filter_Basic<T> | Filter_FieldOr<T> | Filter_FieldAnd<T>

type Filter_Or<E extends Entity> = { $or: Array<Filter<E>> }

// export type Filter<E extends Entity, F extends object = EntityFieldPaths<E>> = {
//     [K in keyof F]: Filter_Field<F[K]>
// }

// export type Filter<E extends Entity, F = EntityFieldPaths<E>> = {
//     [K in keyof F]: Filter_Field<F[K]>
// } & Filter_Or<E>

export type Filter<E extends Entity, F extends string = EntityFieldPathNames<E>> = {
    [K in F]: Filter_Field<any>
} & Filter_Or<E>

// TODO: maybe array: [{field: "asc"}, {field2: "desc"}]
export type Sorter<E extends Entity, P extends string = EntityFieldPathNames<E>> = { [K in P]: "asc" | "desc" }

type SubReducerV<V, P extends string> =
    V extends Entity
    ? { [X in P]: Reducer<V> }
    : V extends Array<infer A>
    ? SubReducerV<A, P>
    : never

type SubReducer<E extends Entity, F = EntityFields<E>> = {
    [P in keyof F]: SubReducerV<F[P], P extends string ? P : never>
}[keyof F]

export type Reducer<E extends Entity> = Array<EntityFieldNames<E> | SubReducer<E>>


export abstract class Query<T extends Entity = Entity> extends Request<T, T[]> {
    // tslint:disable-next-line:max-line-length
    protected abstract query(filter?: Filter<T>, sorter?: Sorter<T>, slice?: Slice, reduce?: Reducer<T>): Observable<T[]>

    readonly d = new Destruct()

    readonly busy = new BehaviorSubject<boolean>(false)

    readonly #filter = new DictAttr<Filter<T>>()
    readonly #slice = new SliceAttr()
    readonly #sorter = new DictAttr<Sorter<T>>()
    readonly #reducer = new DictAttr<Reducer<T>>()
    readonly #reload = new Subject<void>()

    readonly #refresh = merge(
        this.#filter,
        this.#slice,
        this.#sorter,
        this.#reducer,
        this.#reload
    ).pipe(mapTo(null))

    readonly #fs = this.d.sattr()
    readonly #sls = this.d.sattr()
    readonly #sos = this.d.sattr()
    readonly #rs = this.d.sattr()

    readonly #query = this.#refresh.pipe(
        startWith(null),
        tap(() => this.busy.next(true)),
        debounceTime(20),
        switchMap(() => {
            return this.query(
                this.#filter.value,
                this.#sorter.value,
                this.#slice.value,
                this.#reducer.value
            ).pipe(take(1))
        }),
        tap((x) => console.log("AAA", x)),
        tap(() => this.busy.next(false)),
        share(),
    )

    constructor(readonly entityType: EntityType<T>) {
        super()
    }


    filter(filter: Filter<T> | Observable<Filter<T>>): this {
        if (isObservable(filter)) {
            this.#fs.set(filter.subscribe(v => this.#filter.set(v)))
        } else {
            this.#fs.del()
            this.#filter.set(filter)
        }
        return this
    }

    mergeFilter(filter: Filter<T> | Observable<Filter<T>>): this {
        throw new Error("NotImplemented")
        return this.filter(filter)
    }

    slice(slice: Observable<Slice>): this
    slice(start: number, end?: number): this
    slice(start: number | Observable<Slice>, end?: number): this {
        if (isObservable(start)) {
            this.#sls.set(start.subscribe(v => this.#slice.next(v)))
        } else {
            this.#sls.del()
            this.#slice.next(new Slice(start, end))
        }
        return this
    }

    sort(sorter: Sorter<T> | Observable<Sorter<T>>): this {
        if (isObservable(sorter)) {
            this.#sos.set(sorter.subscribe(v => this.#sorter.set(v)))
        } else {
            this.#sos.del()
            this.#sorter.set(sorter)
        }
        return this
    }

    mergeSort(sorter: Sorter<T> | Observable<Sorter<T>>): this {
        throw new Error("NotImplemented")
        return this.sort(sorter)
    }

    reduce(reducer: Reducer<T> | Observable<Reducer<T>>): this {
        if (isObservable(reducer)) {
            this.#rs.set(reducer.subscribe(v => this.#reducer.set(v)))
        } else {
            this.#rs.del()
            this.#reducer.set(reducer)
        }
        return this
    }

    reload() {
        this.#reload.next()
    }

    override do() {
        return this.#query
    }

    clone() {
        // TODO: ...
    }

    proxy() {
        // TODO: ...
    }
}
