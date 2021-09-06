import type { Entity } from "../entity"
import { EntityAction } from "./action"


export function save<T extends Entity>(entity: T) {
    return new EntityAction(save, (options) => {
        const link = options.getLink(entity)
        const storage = options.getStorage(entity)

        return link.save(entity)
            .success(storage.set.bind(storage))
    })
}
