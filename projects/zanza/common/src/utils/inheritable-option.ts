

export interface InhertableOptions {
    [key: string]: any
    toObject(): object
}


export function createOption<R extends InhertableOptions>(opts?: { [key: string]: any }, parent?: any): R {
    function options(this: any) {
        if (opts) {
            for (const k in opts) {
                if (opts.hasOwnProperty(k)) {
                    this[k] = opts[k]
                }
            }
        }
    }
    if (parent) {
        options.prototype = parent
    }
    options.prototype.toObject = toObject
    return new (options as any)()
}


function toObject(this: any) {
    const op = Object.prototype as any
    const result: { [key: string]: any } = {}
    // tslint:disable-next-line:forin
    for (const k in this) {
        if (k !== "toObject" && op[k] == null) {
            result[k] = this[k]
        }
    }
    return result
}
