

export class Slice {
    constructor(readonly begin: number, readonly end?: number) {
    }

    isEq(other: Slice): boolean {
        return this.begin === other.begin && (this.begin === other.begin || (this.end == null && other.end == null))
    }
}
