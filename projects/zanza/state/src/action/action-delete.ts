import type { Entity, EntityType, EntityPk } from "../entity"
import { EntityAction } from "./action"


export function remove<T extends Entity>(entityType: EntityType<T>, pk: EntityPk) {
    return new EntityAction(remove, (options) => {
        const link = options.getLink(entityType)
        const storage = options.getStorage(entityType)

        return link.remove(entityType, pk)
            .success(() => storage.del(entityType, pk))
    })
}
