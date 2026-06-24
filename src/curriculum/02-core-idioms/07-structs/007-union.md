---
id: structs-union
title: Unions Overlay the Same Bytes
difficulty: 2
concepts:
  - structs
  - unions
  - type-punning
symbol: floatRawBits
hints:
  - Both union members live at offset 0.
  - Reading the `u32` member is just `lwz r3, 0(r3)`.
---

# Two names, one address

A **union** lets several fields share the *same* storage — they all start at
offset 0. Reading a different member just reinterprets the same bytes with a
different type. Given:

```c
typedef union { f32 f; u32 bits; } FloatBits;
```

both `f` and `bits` are at offset 0. Reading `u->bits` is an ordinary integer
load of those four bytes:

```asm
lwz  r3, 0(r3)   # reinterpret the float's bytes as u32
blr
```

This is the clean way to express **type punning** — pulling the raw bit pattern
out of a float, or viewing a 32-bit word as four bytes. A pointer cast like
`*(u32*)&u->f` would compile to the very same `lwz r3, 0(r3)`, so the asm alone
can't tell the two source forms apart — but a union member is the idiomatic MWCC
spelling, and the one to prefer when you recover this load.

## Your task

With `FloatBits` above, write `floatRawBits` to match the target.

<!-- starter -->
```c
u32 floatRawBits(FloatBits* u) {
    return 0;
}
```

<!-- solution -->
```c
u32 floatRawBits(FloatBits* u) {
    return u->bits;
}
```

<!-- context -->
```c
typedef union { f32 f; u32 bits; } FloatBits;
```
