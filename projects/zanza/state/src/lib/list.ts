import { BehaviorSubject } from "rxjs"
import { Fields, Filter, IQuery, Order } from "./query"

import type { Observable } from "rxjs"
import type { Entity } from "./entity"
import type { EntityQuery } from "./action"



export class ObservableList<T extends Entity> extends BehaviorSubject<Array<T>> {
    readonly length: number

    public constructor(query: EntityQuery<T>)

    public constructor(...entries: T[]) {
        super(entries)
    }


    public view(): ListView<T> {
        return new ListView(this)
    }
}


export class ListView<T extends Entity> extends BehaviorSubject<Array<T>> implements IQuery<T> {
    public constructor(private src: ObservableList<T>) {
        super(src.value.slice())
        // TODO: every src changes updates this view
        // TODO: maybe view of view....
    }

    filter(filter: Filter<T> | Observable<Filter<T>>): this {
        // TODO: can request new items from link
        throw new Error("Method not implemented.")
    }
    slice(start: number, end: number): this {
        // TODO: can request new items from link
        throw new Error("Method not implemented.")
    }
    sort(order: Order<T> | Observable<Order<T>>): this {
        // TODO: can request new items from link
        throw new Error("Method not implemented.")
    }
    reduce(fields: Fields<T> | Observable<Fields<T>>): this {
        // TODO: can request new items from link
        throw new Error("Method not implemented.")
    }

}



class Grid {
    public constructor() {
        let items = new ObservableList<any>()
        let view = items.view()
        view.subscribe(items => {

        })
        view.slice(0, 30)
    }
}
