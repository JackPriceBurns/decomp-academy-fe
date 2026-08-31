---
id: 43d4c0a4-7f9c-5067-8f4c-0246694ffd31
slug: structs-union
title: Unions Overlay the Same Bytes
difficulty: 2
concepts:
  - structs
  - unions
  - type-punning
symbol: func_800f5300
hints:
  - Both union members live at offset 0.
  - Reading the `u32` member is just `lwz r3, 0(r3)`.
---

# Two names, one address

Stuff several fields into a union and they all share one patch of storage —
every one starting at offset 0. Pick a different member and you're reading the
same bytes through a different type. Here's the union:

```c
typedef union { f32 f; u32 bits; } FloatBits;
```

`f` and `bits` both sit at offset 0, both 4 bytes wide. What changes between
them is the instruction the compiler picks. A member's type decides whether the
bytes come in through an integer load or a float load. Ask for `f` and you get:

```asm
lfs  f1, 0(r3)
blr
```

Ask for `bits` and the displacement stays at 0, but now it's an integer load
into a different register class.

That's type punning at its cleanest: pull the raw bit pattern out of a float,
or treat a 32-bit word as four separate bytes. You could write a pointer cast
like `*(u32*)&u->f` and it would compile to the same integer load, so the
assembly can't tell the two apart. When you recover a load like this, reach for
the union member anyway — it's the idiomatic MWCC spelling.

## Your task

Using the `FloatBits` union provided, write `func_800f5300` to match the
target.

<!-- solution -->
```c
u32 func_800f5300(FloatBits* u) {
    return u->bits;
}
```

<!-- context -->
```c
typedef union { f32 f; u32 bits; } FloatBits;
```
