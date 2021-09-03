import type { Entity } from "../entity"
import { EntityAction } from "./action"


export function save<T extends Entity>(entity: T) {
    return new EntityAction(save, (link, storage) => {
        return link.save(entity)
            .success(storage.set.bind(storage))
    })
}
