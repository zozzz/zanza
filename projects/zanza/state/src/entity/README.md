# Entity

## Definition

### First form

```typescript
import { Entity } from "@zanza/state"

const User = Entity.extend("User", {
   id: {primary: true, map: Number},
   name: String
})
type User = InstanceType<typeof User>
```


### Second form

```typescript
import { Entity } from "@zanza/state"

class User extends Entity.extend("User", {
   id: {primary: true, map: Number},
   name: String
}) {
   doSomething() {
      console.log(this.name)
   }
}
```
