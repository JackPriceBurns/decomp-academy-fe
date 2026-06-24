---
id: gauntlet-field-u8-4
title: Read a u8 field at offset 4
difficulty: 3
concepts:
  - structs
  - loads
  - u8
symbol: read
hints:
  - A u8 loads with lbz.
  - The field sits at offset 4, so expect a displacement of 4.
  - Just `return s->field;`.
---

# Load a `u8` at byte offset 4

A typed field access compiles to a single load with the field's displacement.
A `u8` field reads with **`lbz`** at displacement 4. The *type* picks the load opcode; the *offset* picks the displacement.

```c
typedef struct { u8 _pad[4]; u8 field; } S;
```

## Your task
Write `read` to reproduce the assembly above.

<!-- starter -->
```c
u8 read(S* s) {
    return 0;
}
```

<!-- solution -->
```c
u8 read(S* s) {
    return s->field;
}
```

<!-- context -->
```c
typedef struct { u8 _pad[4]; u8 field; } S;
```
