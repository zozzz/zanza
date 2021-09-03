import { State, GLOBAL_STATE } from "./state"
import { MemoryStorage, IndexedDBStorageFactory, IndexedDBStorage } from "./storage"
import { Entity, provideEntityOptions } from "./entity"


class LocalEntity extends Entity {

}



class MyIndexedDBState extends State {
    public constructor(factory: IndexedDBStorageFactory) {
        super(factory.create("MyIndexedDBState"))
    }
}


class MyMemoryState extends State {
    public constructor(storage: MemoryStorage) {
        super(storage)
    }
}



@NgModule({
    provides: [
        MyMemoryState,
        MyIndexedDBState,
        ...provideEntityOptions(Entity, {
            state: MyMemoryState
        }),
        ...provideEntityOptions(LocalEntity, {
            state: MyIndexedDBState
        })
    ]
})
export class Application {

}
