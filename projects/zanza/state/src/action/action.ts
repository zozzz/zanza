// tslint:disable:max-line-length
import { Inject, Injectable, InjectionToken, Injector, Optional } from "@angular/core"
import { Observable } from "rxjs"

import type { EntityOptions, OptionsForEntity } from "../entity"
import { EntityOptionsManager } from "../entity"
import { ActionRunner } from "./runner"


type EntityActionExec = (options: EntityOptionsManager) => Observable<any>


const OPTIONS = Symbol("EntityAction.options")

/**
 * @example
 * ```
 * @NgModule({
 *     provides: [
 *         {
 *             provide: DEFAULT_ENTITY_OPTIONS,
 *             useValue: {storage: new MemoryStorage()},
 *             multi: true
 *         },
 *         EntityActions
 *     ]
 * })
 * export class Application {}
 * ```
 */
export const DEFAULT_ENTITY_OPTIONS = new InjectionToken<EntityOptions>("DEFAULT_ENTITY_OPTIONS")


/**
 * @example
 * ```
 * @Component({
 *     provides: [
 *         {
 *             provide: ENTITY_OPTIONS,
 *             useValue: {entity: User, options: {storage: new IndexedDbStorage("dbname")}},
 *             multi: true
 *         },
 *         EntityActions
 *     ]
 * })
 * export class SomeComponent {}
 * ```
 */
export const ENTITY_OPTIONS = new InjectionToken<OptionsForEntity>("ENTITY_OPTIONS")


export class EntityAction<F extends EntityActionExec = EntityActionExec> {
    readonly #executor: F

    [OPTIONS]: EntityOptionsManager

    constructor(readonly id: any, executor: F) {
        this.#executor = executor
    }

    do(): ReturnType<F> {
        return this.#executor(this[OPTIONS]) as any
    }
}


@Injectable()
export class EntityActions {
    readonly #options: EntityOptionsManager

    constructor(
        injector: Injector,
        private readonly runner: ActionRunner,
        @Inject(DEFAULT_ENTITY_OPTIONS) @Optional() defaultOptions: EntityOptions[],
        @Inject(ENTITY_OPTIONS) @Optional() entityOptions: OptionsForEntity[]) {

        this.#options = new EntityOptionsManager(injector, defaultOptions, entityOptions)
    }

    do<A extends EntityAction, R extends Observable<unknown> = ReturnType<A["do"]>>(action: A): R {
        action[OPTIONS] = this.#options
        return this.runner.do(action)
    }

    on<L extends (stream: any) => Observable<any>>(listener: L): ReturnType<L> {
        return null as any
    }
}
