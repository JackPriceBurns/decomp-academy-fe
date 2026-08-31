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
  - "`andi` with a *small* immediate keeps only the tested bit; the
    `sltu` against `zero` turns \"any bit survived\" into exactly 0 or
    1. That's a `!= 0` comparison being returned."
  - "The C is one return line — flag byte AND mask, compared against zero. The mask is the `andi` immediate."
---

# The other two flag verbs

Setting was `ori`. The remaining flag operations are both `andi`, told
apart by their masks:

**Clearing** ANDs with everything *except* the bit. Here's bit 1 going
off:

```c
typedef struct {
    u8 flags;    // offset 0 — bit 1 = "locked"
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

The C says `~2` but the listing says `0xfffd` — `andi`'s immediate
field is 16 bits, so the complement gets truncated to 16 bits on its
way in. An `andi` whose mask is "0xff.. with a hole" is a clear;
invert the mask to find the bit. (Write `~2` in the C, not `0xfffd` —
the idiomatic source form produces the truncated listing form.)

**Testing** ANDs with *just* the bit, then asks whether anything
survived. No store this time — the sandwich loses its top slice, and
the result feeds a branch or, as in the target, becomes a returned
0-or-1 through the boolean materialization tricks from the control
chapter.

The target tests one bit of the `Item`'s flag byte (layout below) and
returns the answer as a plain truth value.

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
