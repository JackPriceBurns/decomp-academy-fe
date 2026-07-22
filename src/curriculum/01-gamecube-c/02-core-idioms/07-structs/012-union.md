---
id: 43d4c0a4-7f9c-5067-8f4c-0246694ffd31
slug: structs-union
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

Stuff several fields into a union and they all share one patch of storage, every
one of them starting at offset 0. Pick a different member and you're just reading
those same bytes through a different type. Here's the union:

```c
typedef union { f32 f; u32 bits; } FloatBits;
```

Here `f` and `bits` both sit at offset 0, both 4 bytes wide. What changes between
them is the instruction the compiler picks. A member's type decides whether the
bytes come in through an integer load or a float load. Ask for the `f` member and
you get:

```asm
lfs  f1, 0(r3)
blr
```

Ask for `bits` instead and the displacement stays at 0, but now it's an integer
load landing in a different register class entirely.

That's type punning at its cleanest. You yank the raw bit pattern out of a float,
or you treat a 32-bit word as four separate bytes. You could write a pointer cast
like `*(u32*)&u->f` and it would compile to the very same integer load, so the
assembly can't tell the two apart on its own. When you do recover a load like
this, reach for the union member anyway. It's the idiomatic MWCC spelling.

## Your task

With `FloatBits` above, write `floatRawBits` to match the target.

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
