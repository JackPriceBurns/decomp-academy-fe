---
id: 1dbac9d7-2595-41f5-a493-4a8c4612edda
slug: structs-flag-clear-test
title: "Clearing and Testing Flags"
difficulty: 3
concepts:
  - structs
  - flags
  - booleans
symbol: func_8036eb24
hints:
  - "`andi` with a *small* immediate keeps only the tested bit. The `sltu` against `zero` turns \"some bit is left\" into exactly 0 or 1. So the function returns a `!= 0` comparison."
  - "The C is one return line: the flag byte AND the mask, compared against zero. The mask is the `andi` immediate."
---

# The other two flag operations

Setting a flag uses `ori`. The other two flag operations both use `andi`, and
you tell them apart by their masks:

**Clearing** ANDs with every bit *except* the one to clear. Here bit 1 is
turned off:

```c
typedef struct {
    u8 flags;    // offset 0, bit 1 = "locked"
    u8 state;    // offset 1
} Door;

void unlock(Door *d) {
    d->flags &= ~2;
}
```

```asm
lbu   t6, 0(a0)      # read the flag byte
andi  t7, t6, 0xfffd # keep all bits but bit 1
sb    t7, 0(a0)      # write back
jr    ra
nop
```

The C says `~2`, but the listing says `0xfffd`. The immediate field of `andi`
is 16 bits, so the complement is truncated to 16 bits when it goes into the
instruction. An `andi` whose mask is "0xff.. with a hole" is a clear. Invert
the mask to find the bit. (In the C, write `~2` and not `0xfffd`. The usual
source form produces the truncated form you see in the listing.)

**Testing** ANDs with *only* the bit, then checks whether any bit is left.
There is no store this time, so only the load and the operation of the
sandwich remain. The result either feeds a branch or, as in the target,
becomes a returned 0 or 1. For that, the compiler uses the patterns from the
control chapter that build a boolean out of arithmetic.

The target tests one bit of the `Item`'s flag byte (layout below) and returns
the result as a plain truth value.

## Your task

Write `func_8036eb24` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8036eb24(Item *item) {
    return (item->flags & 2) != 0;
}
```

<!-- context -->
```c
typedef struct {
    u8 flags;
    u8 mode;
    s16 id;
} Item;
```
