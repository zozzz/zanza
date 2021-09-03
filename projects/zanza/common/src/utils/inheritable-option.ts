

export function createOption<R extends { [key: string]: any }>(opts?: { [key: string]: any }, parent?: any): R {
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
    return new (options as any)()
}
