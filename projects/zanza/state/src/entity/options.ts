import { Injector } from "@angular/core"

import { isSubclass } from "@zanza/common"

import type { EntityType, EntityTypeId, Entity } from "./entity"
import { getEntityType, getEntityTypeId, getEntityTypeOptions } from "./entity"
import type { Link } from "../link"
import type { Storage } from "../storage"


export interface EntityOptions {
    link?: typeof Link
    storage?: typeof Storage
    [key: string]: any
}


export interface OptionsForEntity {
    entity: EntityType | EntityType[],
    options: EntityOptions
}


export class EntityOptionsManager {
    readonly #cache = new Map<EntityTypeId, EntityOptions>()
    private readonly defaultOptions: EntityOptions
    private readonly entityOptions: OptionsForEntity[]

    constructor(
        readonly injector: Injector,
        defaultOptions?: EntityOptions[],
        entityOptions?: OptionsForEntity[]) {
        if (defaultOptions) {
            let options: EntityOptions = {}
            for (const o of defaultOptions) {
                options = { ...options, ...o }
            }
            this.defaultOptions = options
        } else {
            this.defaultOptions = {}
        }

        if (!entityOptions) {
            this.entityOptions = []
        } else {
            this.entityOptions = entityOptions
        }
    }

    getLink(entity: Entity | EntityType): Link {
        return this.get(entity, "link")
    }

    getStorage(entity: Entity | EntityType): Storage {
        return this.get(entity, "storage")
    }

    get<T = any>(entity: Entity | EntityType, key: string): T {
        return this.getOptions(entity)[key] as T
    }

    getOptions(entity: Entity | EntityType): EntityOptions {
        const typeId = getEntityTypeId(entity)
        let options = this.#cache.get(typeId)
        if (options != null) {
            return options
        } else {
            const type = getEntityType(entity)
            options = { ...this.defaultOptions }

            const entityTypeOptions = getEntityTypeOptions(entity)
            if (entityTypeOptions) {
                options = { ...options, ...entityTypeOptions.toObject() }
            }

            for (const eopt of this.entityOptions) {
                if (Array.isArray(eopt.entity)) {
                    if (eopt.entity.filter(v => isSubclass(type, v)).length > 0) {
                        options = { ...options, ...eopt.options }
                    }
                } else if (isSubclass(type, eopt.entity)) {
                    options = { ...options, ...eopt.options }
                }
            }

            this.#cache.set(typeId, options)
            return options
        }
    }
}
