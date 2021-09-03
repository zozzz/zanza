
type Class = { new(...args: any[]): any }


const proto = Object.getPrototypeOf
    ? Object.getPrototypeOf
    // tslint:disable-next-line:only-arrow-functions
    : function (o: any) { return o.__proto__ }


export function isSubclass<CLS extends Class>(obj: any, cls: CLS): obj is CLS {
    while (true) {
        if (obj === cls) {
            return true
        } else {
            obj = proto(obj)
            if (typeof obj === "object") {
                return false
            }
        }
    }
}


export function getClassProtoChain<T, P extends T>(cls: P, until?: any): T[] {
    const result = [cls]

    while (true) {
        cls = proto(cls)
        if (typeof cls === "object") {
            break
        } else if (cls === until) {
            result.push(cls)
            break
        } else {
            result.push(cls)
        }
    }

    return result
}
