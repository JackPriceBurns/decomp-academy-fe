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

When you access a struct field, the compiler emits a single load instruction. Two things determine which instruction:

- **Type** → chooses the opcode (`lbz` for an unsigned byte, `lwz` for a 32-bit word, etc.)
- **Byte offset** → becomes the displacement in the instruction

Consider this struct and accessor:

```c
typedef struct { u8 _pad[8]; u8 val; } T;
u8 get_val(T* p) { return p->val; }
```

MWCC produces:

```asm
get_val:
  lbz  r3,8(r3)
  blr
```

`val` is a `u8` (byte) at byte offset 8, so the instruction is `lbz` with displacement `8`. The layout of `S` in your exercise is different — look at the displacement in the target assembly to work out where the field sits.

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
