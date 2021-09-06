import type { Entity, EntityType, EntityPk } from "../entity"
import { EntityAction } from "./action"


export function load<T extends Entity>(entityType: EntityType<T>, pk: EntityPk) {
    return new EntityAction(load, (options) => {
        const link = options.getLink(entityType)
        const storage = options.getStorage(entityType)

        return link.load(entityType, pk)
            .success(result => {
                if (result != null) {
                    storage.merge(result)
                }
            })
    })
}
