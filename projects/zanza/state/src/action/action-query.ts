import type { Entity, EntityType } from "../entity"
import { EntityAction } from "./action"


export function query<T extends Entity>(entityType: EntityType<T>) {
    return new EntityAction(query, (options) => {
        const link = options.getLink(entityType)
        const storage = options.getStorage(entityType)

        return link.query(entityType)
            .success(entities => {
                for (const ent of entities) {
                    storage.set(ent)
                }
            })
    })
}
