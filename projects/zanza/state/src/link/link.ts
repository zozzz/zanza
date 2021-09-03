import type { Entity, EntityType, EntityPk } from "../entity"
import type { Request } from "./request"
import type { Query } from "./query"


export abstract class Link {
    abstract readonly isAsync: boolean
    abstract save<E extends Entity = Entity>(entity: E): Request<E>
    abstract query<E extends Entity = Entity>(entityType: EntityType<E>): Query<E>
    abstract load<E extends Entity = Entity>(entityType: EntityType<E>, id: EntityPk): Request<E, E | undefined>
    abstract remove<E extends Entity = Entity>(entityType: EntityType<E>, id: EntityPk): Request<E, boolean>
}
