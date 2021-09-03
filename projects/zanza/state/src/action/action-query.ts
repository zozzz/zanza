import type { Entity, EntityType } from "../entity"
import { EntityAction } from "./action"


export function query<T extends Entity>(entityType: EntityType<T>) {
    return new EntityAction(query, (link, storage) => {
        return link.query(entityType)
            .success(entities => {
                for (const ent of entities) {
                    storage.set(ent)
                }
            })
    })
}
