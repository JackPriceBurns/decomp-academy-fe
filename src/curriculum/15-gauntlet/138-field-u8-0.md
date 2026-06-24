---
id: gauntlet-field-u8-0
title: Read a u8 field at offset 0
difficulty: 2
concepts:
  - structs
  - loads
  - u8
symbol: read
hints:
  - A u8 loads with lbz.
  - The field sits at offset 0, so expect a displacement of 0.
  - Just `return s->field;`.
---

# Load a `u8` at byte offset 0

A typed field access compiles to a single load with the field's displacement.
A `u8` field reads with **`lbz`** at displacement 0. The *type* picks the load opcode; the *offset* picks the displacement.

```c
typedef struct { u8 field; } S;
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
typedef struct { u8 field; } S;
```
