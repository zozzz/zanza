import { TestBed } from "@angular/core/testing"

import { Entity, EntityType, getEntityTypeFields, getEntityPk, getEntityTypeName, getEntityTypeOptions } from "./entity"
import { Sorter, Reducer, Filter } from "../link"
import { EntityOptionsManager } from "./options"

class User extends Entity.extend("User", {
    id: { primary: true, map: Number },
}, {
    user_option: "user",
    override: "user",
    manager_override1: "user",
    manager_override2: "user",
}) { }

class Worker extends User.extend("Worker", {

}, {
    worker_option: "worker",
    override: "worker",
    manager_override1: "worker",
    manager_override2: "worker",
}) {

}


describe("EntityOptionsManager", () => {
    it("options", () => {
        const options = new EntityOptionsManager(
            null as any,
            [
                { custom_option: "manager", manager_override1: "default" }
            ],
            [
                {
                    entity: User,
                    options: {
                        user_manager_option: "umo",
                        manager_override2: "manager-user"
                    }
                },
                {
                    entity: Worker,
                    options: {
                        worker_manager_option: "wmo",
                        manager_override2: "manager-worker"
                    }
                }
            ]
        )

        expect(options.getOptions(User)).toEqual({
            custom_option: "manager",
            override: "user",
            user_manager_option: "umo",
            user_option: "user",
            manager_override1: "user",
            manager_override2: "manager-user",

        })

        expect(options.getOptions(Worker)).toEqual({
            custom_option: "manager",
            override: "worker",
            user_manager_option: "umo",
            worker_manager_option: "wmo",
            worker_option: "worker",
            user_option: "user",
            manager_override1: "worker",
            manager_override2: "manager-worker",
        })
    })
})
