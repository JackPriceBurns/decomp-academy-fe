---
id: gauntlet-field-s8-0
title: Read a s8 field at offset 0
difficulty: 2
concepts:
  - structs
  - loads
  - s8
symbol: read
hints:
  - A s8 loads with lbz.
  - The field sits at offset 0, so expect a displacement of 0.
  - Just `return s->field;`.
---

# Load a `s8` at byte offset 0

A typed field access compiles to a single load with the field's displacement.
A `s8` field reads with **`lbz`** at displacement 0. The *type* picks the load opcode; the *offset* picks the displacement.

Note that `s8` reads with `lbz` (the same byte-load as `u8`), *not* a
sign-extending load. MWCC returns the byte directly in r3 without extending it
in the callee — the ABI only requires the low 8 bits of the return register to
hold a valid `s8`.

```c
typedef struct { s8 field; } S;
```

## Your task
Write `read` to reproduce the assembly above.

<!-- starter -->
```c
s8 read(S* s) {
    return 0;
}
```

<!-- solution -->
```c
s8 read(S* s) {
    return s->field;
}
```

<!-- context -->
```c
typedef struct { s8 field; } S;
```
