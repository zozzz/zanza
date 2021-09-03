// tslint:disable:max-line-length

import { isSubclass, getClassProtoChain, createOption } from "@zanza/common"
import type { Link } from "../link"
import type { Storage } from "../storage"


export type EntityPk = string

export interface EntityOptions {
    link?: typeof Link
    storage?: typeof Storage
}

// tslint:disable-next-line:ban-types
export type EntityFunctionNames<E extends Entity> = { [P in keyof E]: E[P] extends Function ? P extends symbol ? never : P : never }[keyof E]
export type EntityFunctions<E extends Entity> = Pick<E, EntityFunctionNames<E>>

// tslint:disable-next-line:ban-types
export type EntityFieldNames<E extends Entity> = { [P in keyof E]: E[P] extends Function ? never : P extends symbol ? never : P }[keyof E]
export type EntityFields<E extends Entity> = Pick<E, EntityFieldNames<E>>
export type EntityFieldNamesByType<E extends Entity, T, F = EntityFields<E>> = {
    [P in keyof F]: F[P] extends T ? P extends string ? P : never : never
}[keyof F]


type EntityFieldPath<N extends string, V> =
    V extends Entity
    ? `${N}.${EntityFieldPathNames<V>}`
    : V extends Array<infer A>
    ? A extends Entity
    ? `${N}.${EntityFieldPathNames<A>}`
    : never
    : N

export type EntityFieldPathNames<E extends Entity, F = EntityFields<E>> = {
    [P in keyof F]: F[P] extends any ? P extends string ? EntityFieldPath<P, F[P]> : never : never
}[keyof F]


type Prefixed<K, P extends string> =
    K extends string
    ? `${P}${K}`
    : never

type Unprefixed<K, P extends string> =
    K extends Prefixed<infer R, P>
    ? R
    : ""

type PrefixedField<F extends object, K extends string, P extends string> =
    F extends { [X in Unprefixed<K, P>]: infer V }
    ? V
    : never

type PrefixFields<F, P extends string> =
    F extends object
    ? { [K in Prefixed<keyof F, P>]: K extends string ? PrefixedField<F, K, P> : never }
    : never

type ConcatStr<S1, S2 extends string> = S1 extends string ? `${S1}${S2}` : never
type Scalar = boolean | number | string | bigint | Date

export type EntityFieldPaths<E extends Entity, P extends string = "", FP = PrefixFields<EntityFields<E>, P>> = {
    [K in keyof FP]:
    FP[K] extends Entity
    ? EntityFieldPaths<FP[K], ConcatStr<K, ".">>
    : FP[K] extends Array<infer A>
    ? A extends Entity
    ? EntityFieldPaths<A, ConcatStr<K, ".">>
    : never
    : FP[K] extends Scalar
    ? { [k in K]: FP[K] }
    : never
}[keyof FP]


// export type EntityFieldPaths<E extends Entity, F = EntityFields<E>> = {
//     [K in keyof F]: F[K]
// } & SubEntityPaths<E>

// {"field": Type, "field.sub_field": Type}
// export type EntityFieldPaths<E extends Entity, F = EntityFields<E>> = {
//     [P in keyof F]: F[P]
// } & {
//         [P in SubEntityFieldPaths<keyof F, F>]: SubEntityFieldValue
//     }


// export type EntityFieldPathNames<E extends Entity, P = EntityFieldPaths<E>> = {
//     [K in keyof P]: P
// }


type FieldConverter = (arg: any) => any

type FieldOptions = { primary?: true, map: FieldConverter }

type NormalizedField = FieldOptions & { name: string }

type NormalizedFields = NormalizedField[]

type Field = FieldConverter | FieldOptions | EntityType

type Fields = { [key: string]: Field }

type InstanceField<F extends Field> =
    F extends { map: FieldConverter }
    ? ReturnType<F["map"]>
    : F extends FieldConverter
    ? ReturnType<F>
    : F extends EntityType<infer E>
    ? E
    : never

type InstanceFields<F extends Fields> = { [M in keyof F]: InstanceField<F[M]> }

type Instance<PE extends Entity, F extends Fields> = PE & InstanceFields<F>

type CtorParamFV<T> =
    T extends Entity
    ? CtorParam<T>
    : T extends Array<infer A>
    ? Array<CtorParamFV<A>>
    : T

type CtorParam<E extends Entity, F = EntityFields<E>> = Partial<{ [P in keyof F]: CtorParamFV<F[P]> }>

interface EntityClass<E extends Entity, F extends Fields, O extends EntityOptions, I extends Entity = Instance<E, F>> {
    new(data?: CtorParam<I>): I,
    name: string,
    // options: O,
    extend<
        EE extends Entity,
        EF extends Fields,
        EO extends EntityOptions>(this: EntityType<EE>, name: string, fields: EF, options?: EO): EntityClass<EE, EF, EO>
    coerce(this: EntityType<I>, value: I | CtorParam<I>): I
}

export type EntityType<E extends Entity = Entity> = { new(values?: CtorParam<E>): E }

const ID = Symbol("id")
const OPTIONS = Symbol("options")
const FIELDS = Symbol("fields")
const NAME = Symbol("name")
const PK = Symbol("pk")


function validateName(name: string) {
    if (!name.match(/^[a-z][a-z0-9_]*$/i)) {
        throw new Error(`Invalid class name: ${name}`)
    }
}

function newCls(name: string, parent: any): any {
    const parentName = parent.name
    validateName(name)
    validateName(parentName)

    let factory: (name: any, parent: any) => any

    try {
        factory = new Function(`name,${parentName}`, `return class ${name} extends ${parentName} {}`) as any
    } catch (EvalError) {
        // tslint:disable-next-line: only-arrow-functions
        factory = function (n: any, p: any) {
            return { [n]: class extends p { } }[n]
        }
    }
    return factory(name, parent)
}


const builtinTypes: Map<any, any> = new Map
builtinTypes.set(String, String)
builtinTypes.set(Number, Number)
builtinTypes.set(Boolean, Boolean)
builtinTypes.set(Date, (value: any): any => { return value instanceof Date ? value : new Date(value) })
builtinTypes.set(Function, (value: any): any => { throw new Error("Function type is not supported") })
builtinTypes.set(Object, (value: any): any => { return value })


function normalizeFieldDef(name: string, f: Field): NormalizedField {
    let converter = builtinTypes.get(f)
    if (converter) {
        return { name, map: converter }
    } else if ("map" in f) {
        converter = builtinTypes.get(f.map)
        return { ...f, name, map: converter || f.map }
    } else if (isEntityType(f)) {
        // TODO: workaround any cast
        return { name, map: (f as any).coerce.bind(f) }
    } else {
        return { name, map: f }
    }
}


function normalizeFieldsDef<F extends Fields>(fields: F): NormalizedFields {
    const result: NormalizedFields = []
    for (const k of Object.keys(fields)) {
        result.push(normalizeFieldDef(k, fields[k]))
    }
    return result
}


class PrimaryKey {
    value: EntityPk | undefined
    constructor(public fieldNames: string[]) {
    }
}


// TODO: mutable or not?
export class Entity {
    static extend<
        E extends Entity,
        F extends Fields,
        O extends EntityOptions>(this: EntityType<E>, name: string, fields: F, options?: O): EntityClass<E, F, O> {

        const cls = newCls(name, this)
        const normFields = normalizeFieldsDef(fields)
        const allFields: NormalizedFields = (this as any)[FIELDS].concat(normFields)

        Object.defineProperty(cls, ID, {
            value: Symbol(name),
            enumerable: false,
            configurable: false,
            writable: false
        })

        Object.defineProperty(cls, NAME, {
            value: name,
            enumerable: false,
            configurable: false,
            writable: false
        })

        Object.defineProperty(cls, OPTIONS, {
            value: createOption(options, (this as any)[OPTIONS]),
            enumerable: false,
            configurable: false,
            writable: false
        })

        Object.defineProperty(cls, FIELDS, {
            value: allFields,
            enumerable: false,
            configurable: false,
            writable: false
        })

        const pkFields = allFields.filter(f => f.primary).map(f => f.name)
        Object.defineProperty(cls.prototype, PK, {
            value: new PrimaryKey(pkFields),
            enumerable: false,
            configurable: false,
            writable: false
        })

        if (pkFields.length === 0) {
            console.warn(`Missing primary fields from ${name}`)
        }

        return cls
    }

    static coerce<E extends Entity>(this: EntityType<E>, value: E | CtorParam<E>): E {
        return value instanceof Entity ? value : new this(value)
    }

    static [ID]: symbol
    static [OPTIONS] = createOption()
    static [FIELDS]: NormalizedFields = [];

    [PK]: PrimaryKey

    constructor(values?: any) {
        if (values != null) {
            if (typeof values === "object") {
                for (const field of ((this.constructor as any)[FIELDS] as NormalizedFields)) {
                    const name = field.name
                    if (name in values) {
                        const value = values[name];
                        (this as any)[name] = value != null ? field.map(value) : value
                    }
                }
            } else {
                throw new Error("Invalid paramater for entity")
            }
        }
    }

    something() {
        return null
    }

    isEq(other: this): boolean {
        // if (this instanceof getEntityType(other)) {

        // }
        return false
    }
}


// export function provideEntityOptions(cls: EntityType, options: EntityOptions): any[] {
//     return []
// }

export function getEntityPk<T extends Entity>(entity: T) {
    const pk = entity[PK]
    if (pk.value == null) {
        pk.value = pk.fieldNames
            .map(n => `${(entity as any)[n]}`)
            .join("-")
    }
    return pk.value
}


export function getEntityType<T extends Entity>(entity: T | EntityType<T>): EntityType<T> {
    return entity instanceof Entity ? (entity as any).constructor : entity
}


export function getEntityTypeId<T extends Entity>(entity: T | EntityType<T>): symbol {
    return (getEntityType(entity) as any)[ID]
}


export function getEntityTypeName<T extends Entity>(entity: T | EntityType<T>): string {
    return (getEntityType(entity) as any)[NAME]
}


export function getEntityTypeFields<T extends Entity>(entity: T | EntityType<T>): NormalizedFields {
    return (getEntityType(entity) as any)[FIELDS]
}


export function isEntity<T extends Entity>(entity: T): entity is T {
    return entity instanceof Entity
}


export function isEntityType(entity: any): entity is EntityType {
    return isSubclass(entity, Entity)
}


export function getEntityProtoChain<T extends Entity>(entity: T | EntityType<T>): Array<EntityType<any>> {
    return getClassProtoChain(getEntityType(entity) as any, Entity)
}
