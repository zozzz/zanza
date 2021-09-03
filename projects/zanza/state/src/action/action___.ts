// tslint:disable:max-line-length

import { Observable } from "rxjs"

import { Omit1Parameter } from "@zanza/common"
import { Entity, EntityType, getEntityType } from "../entity"
import { EntityQuery } from "../query"

import { ActionConstraint, EntityAction, EntityActionType, WatchState, WatchReturnEvents, WatchReturnFiltered } from "./interface"
import { Delete } from "./action-delete"
import { Get } from "./action-get"
import { Save } from "./action-save"
import { WriteStream } from "tty"


export class EntityActions {
    public save<T extends Entity>(entity: T) {
        return this._do<Save<T>>(Save, getEntityType(entity), entity)
    }

    public get<T extends Entity>(entityType: EntityType<T>, pk: string | number) {
        return this._do<Get<T>>(Get, entityType, pk)
    }

    public delete<T extends Entity, A extends Delete<T> = Delete<T>>(entity: T): ReturnType<A["do"]>

    public delete<T extends Entity, A extends Delete<T> = Delete<T>>(entityType: EntityType<T>, pk: string | number): ReturnType<A["do"]>

    public delete(et: any, pk?: any) {
        if (et instanceof Entity) {
            et = getEntityType(et)
            pk = et.pk
        } else if (pk == null) {
            throw Error("TODO...")
        }

        return this._do<any>(Delete, et, pk)
    }

    public query<T extends Entity>(entityType: EntityType<T>) {
        return new EntityQuery(entityType, null)
    }

    public watch<T extends Entity, A extends Get<T>>(entityType: EntityType<T>, action: EntityActionType<A>): WatchReturnEvents<A["do"]>
    public watch<T extends Entity, A extends Get<T>, WS extends WatchState>(entityType: EntityType<T>, action: EntityActionType<A>, state: WS): WatchReturnFiltered<WS, A["do"]>

    public watch<T extends Entity, A extends Delete<T>>(entityType: EntityType<T>, action: EntityActionType<A>): WatchReturnEvents<A["do"]>
    public watch<T extends Entity, A extends Delete<T>, WS extends WatchState>(entityType: EntityType<T>, action: EntityActionType<A>, state: WS): WatchReturnFiltered<WS, A["do"]>

    public watch<T extends Entity, A extends Save<T>>(entityType: EntityType<T>, action: EntityActionType<A>): WatchReturnEvents<A["do"]>
    public watch<T extends Entity, A extends Save<T>, WS extends WatchState>(entityType: EntityType<T>, action: EntityActionType<A>, state: WS): WatchReturnFiltered<WS, A["do"]>

    public watch<T extends Entity, A extends ActionConstraint<T>>(entityType: EntityType<T>, action: { new(): A }): WatchReturnEvents<A["do"]>
    public watch<T extends Entity, A extends ActionConstraint<T>, WS extends WatchState>(entityType: EntityType<T>, action: { new(): A }, state: WatchState): WatchReturnFiltered<WS, A["do"]>

    public watch<T extends Entity>(entityType: EntityType<T>, action: { new(): EntityAction }, state?: WatchState): any {
        return null as any
    }

    public do<T extends Entity, A extends ActionConstraint<T>>(entity: T | EntityType<T>, action: { new(): A }, ...args: Omit1Parameter<A["do"]>): ReturnType<A["do"]> {
        return null as any
    }

    protected _do<T extends EntityAction>(action: EntityActionType<T>, ...args: Parameters<T["do"]>): ReturnType<T["do"]> {
        return null as any
    }
}


class NoWay extends Entity {
    public x: number
}

export class User extends Entity {
    public name: string
}


export class MultiAction extends EntityAction {
    public do<T extends (NoWay | User)>(entityType: EntityType<T>, p1: string): Observable<[T, boolean]> {
        return null as any
    }
}

export class SingleAction extends EntityAction {
    public do<T extends (NoWay)>(entityType: EntityType<T>, p1: string): Observable<[T, boolean]> {
        return null as any
    }
}


function almafa(x: number) {
    return 10
}

almafa(45)


// class XYZ {
//     public constructor(actions: EntityActions) {
//         // actions.query(User).where().limit(1).offset(0).subscribe(user => {

//         // })

//         // actions.query(User).subscribe(users => {

//         // })

//         actions.get(User, 1).subscribe(user => {

//         })

//         actions.save(new User()).subscribe(user => {

//         })

//         actions.delete(new User()).subscribe(result => {

//         })

//         actions.delete(User, 1).subscribe(result => {

//         })

//         actions.do(User, MultiAction, "").subscribe(xxx => {

//         })

//         actions.do(User, SingleAction, "").subscribe(xxx => {

//         })

//         actions.do(NoWay, SingleAction, "").subscribe(xxx => {

//         })
//     }
// }

