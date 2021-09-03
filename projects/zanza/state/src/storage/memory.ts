import { Entity, EntityType, EntityPk, getEntityTypeId, getEntityPk } from "../entity"
import { Storage } from "./interface"


export class MemoryStorage extends Storage {
    readonly #data = new Map<symbol, { [key: string]: Entity }>()

    set<T extends Entity>(entity: T): void {
        const entId = getEntityTypeId(entity)
        const entPk = getEntityPk(entity)
        const container = this.#data.get(entId)
        if (container == null) {
            this.#data.set(entId, { [entPk]: entity })
        } else {
            container[entPk] = entity
        }
    }

    merge<T extends Entity>(entity: T): void {
        throw new Error("Method not implemented.")
    }

    get<T extends Entity>(entityType: EntityType<T>, id: EntityPk): T | undefined {
        const entId = getEntityTypeId(entityType)
        const container = this.#data.get(entId)
        return container ? container[id.toString()] as T : undefined
    }

    del<T extends Entity>(entityType: EntityType<T>, id: EntityPk): void {
        const entId = getEntityTypeId(entityType)
        const container = this.#data.get(entId)
        if (container != null) {
            delete container[id.toString()]
        }
    }

    query(): void {
        throw new Error("Method not implemented.")
    }

}
