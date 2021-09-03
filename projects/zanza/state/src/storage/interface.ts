import type { Entity, EntityType, EntityPk } from "../entity"


export abstract class Storage {
    abstract set<T extends Entity>(entity: T): void
    abstract merge<T extends Entity>(entity: T): void
    abstract get<T extends Entity>(entityType: EntityType<T>, id: EntityPk): T | undefined
    abstract del<T extends Entity>(entityType: EntityType<T>, id: EntityPk): void
    abstract query(): void
}
