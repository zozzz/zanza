import { TestBed } from "@angular/core/testing"

import { Entity, EntityType, getEntityTypeFields, getEntityPk, getEntityTypeName } from "./entity"
import { Sorter, Reducer, Filter } from "../link"


describe("Entity", () => {
    // beforeEach(async () => {

    // })

    it("creation (basic)", () => {
        const User = Entity.extend("User", {
            id: { primary: true, map: Number },
            user_field: String
        })
        type User = InstanceType<typeof User>

        const Worker = User.extend("Worker", {
            worker_field: String,
            numbers: (v: any[]) => v.map(Number)
        })
        type Worker = InstanceType<typeof Worker>

        expect(getEntityTypeName(User)).toEqual("User")
        expect(getEntityTypeName(new User())).toEqual("User")
        expect(new User()).toBeInstanceOf(Entity)
        expect(new User()).toBeInstanceOf(User)
        expect(getEntityTypeFields(User))
            .toContain(jasmine.objectContaining({ name: "id", primary: true, map: Number }))
        expect(getEntityTypeFields(User))
            .toContain(jasmine.objectContaining({ name: "user_field", map: String }))

        expect(getEntityTypeName(Worker)).toEqual("Worker")
        expect(getEntityTypeName(new Worker())).toEqual("Worker")
        expect(new Worker()).toBeInstanceOf(Entity)
        expect(new Worker()).toBeInstanceOf(User)
        expect(new Worker()).toBeInstanceOf(Worker)
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "id", primary: true, map: Number }))
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "user_field", map: String }))
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "worker_field", map: String }))

    })

    it("creation (with methods)", () => {
        class User extends Entity.extend("User", {
            id: { primary: true, map: Number },
            user_field: String
        }) {
            userMethod() {
                return this.user_field
            }
        }

        class Worker extends User.extend("Worker", {
            worker_field: String,
            numbers: (v: any[]) => v.map(Number)
        }) {
            workerMethod() {
                return this.worker_field
            }
        }

        expect(User.name).toEqual("User")
        expect(new User()).toBeInstanceOf(Entity)
        expect(new User()).toBeInstanceOf(User)
        expect(getEntityTypeFields(User))
            .toContain(jasmine.objectContaining({ name: "id", primary: true, map: Number }))
        expect(getEntityTypeFields(User))
            .toContain(jasmine.objectContaining({ name: "user_field", map: String }))

        const worker = new Worker({ id: 2, user_field: "user_field in worker", worker_field: "worker_field in worker" })
        expect(Worker.name).toEqual("Worker")
        expect(worker).toBeInstanceOf(Entity)
        expect(worker).toBeInstanceOf(User)
        expect(worker).toBeInstanceOf(Worker)
        expect(worker.id).toEqual(2)
        expect(getEntityPk(worker)).toEqual("2")
        expect(worker.user_field).toEqual("user_field in worker")
        expect(worker.worker_field).toEqual("worker_field in worker")
        expect(worker.userMethod()).toEqual("user_field in worker")
        expect(worker.workerMethod()).toEqual("worker_field in worker")
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "id", primary: true, map: Number }))
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "user_field", map: String }))
        expect(getEntityTypeFields(Worker))
            .toContain(jasmine.objectContaining({ name: "worker_field", map: String }))

    })

    it("create (related entity)", () => {
        const UserTag = Entity.extend("UserTag", {
            id: { primary: true, map: Number },
            value: String
        })
        type UserTag = InstanceType<typeof UserTag>

        const AddressTag = Entity.extend("AddressTag", {
            address_tag: { primary: true, map: String }
        })
        type AddressTag = InstanceType<typeof AddressTag>

        const Address = Entity.extend("Address", {
            id: { primary: true, map: Number },
            city: String,
            address: String,
            tags: (v: any[]) => v.map(AddressTag.coerce.bind(AddressTag))
        })
        type Address = InstanceType<typeof Address>

        const User = Entity.extend("User", {
            id: { primary: true, map: Number },
            user_field: String,
            address: Address,
            addressFwd: (val: any) => Address.coerce(val),
            tags: (tags: any[]) => tags.map(UserTag.coerce.bind(UserTag))
        })
        type User = InstanceType<typeof User>

        const user = new User({
            id: 42,
            address: {
                id: 10,
                city: "City"
            },
            addressFwd: {
                id: 11,
                city: "CityFwd"
            },
            tags: [
                { id: 100, value: "tag 100" },
                new UserTag({ id: 101, value: "tag 101" })
            ]
        })

        expect(user.id).toEqual(42)
        expect(user.address).toBeInstanceOf(Address)
        expect(user.address.id).toEqual(10)
        expect(user.address.city).toEqual("City")
        expect(user.addressFwd).toBeInstanceOf(Address)
        expect(user.addressFwd.id).toEqual(11)
        expect(user.addressFwd.city).toEqual("CityFwd")
        expect(user.tags[0]).toBeInstanceOf(UserTag)
        expect(user.tags[0].id).toEqual(100)
        expect(user.tags[0].value).toEqual("tag 100")
        expect(user.tags[1]).toBeInstanceOf(UserTag)
        expect(user.tags[1].id).toEqual(101)
        expect(user.tags[1].value).toEqual("tag 101")
    })
})
