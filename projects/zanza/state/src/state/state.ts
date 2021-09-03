import { Storage } from "../storage"


export const GLOBAL_STATE = ""


export class State {
    constructor(readonly storage: Storage) {
    }
}
