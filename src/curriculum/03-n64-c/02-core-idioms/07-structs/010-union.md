---
id: d4577cc7-60fa-4935-99c5-2c7902597580
slug: structs-union
title: "Unions: One Offset, Many Readings"
difficulty: 3
concepts:
  - unions
  - types
  - endianness
symbol: func_80115df0
hints:
  - "There is a word store, then a *halfword* load from the same address. The write goes in through one union member, and the read comes out through the other."
  - "The load is `lh` at offset 0. On this machine, the first two bytes of a stored word are its upper half. Choose the inner field to match."
---

# The same bytes, read in different ways

A union places all its members at **offset 0**, so they overlap. Each member
is a different way of reading the same bytes. In assembly, this shows up as
accesses to one address with *mismatched widths*. Here is a union used to take
one byte out of a word:

```c
typedef union {
    u32 word;
    u8 bytes[4];
} Reg32;

u32 first_byte(Reg32 *r, u32 w) {
    r->word = w;
    return r->bytes[0];
}
```

```asm
sw    a1, 0(a0)     # in through .word (all 32 bits)
lbu   v0, 0(a0)     # out through .bytes[0] (one byte)
jr    ra
nop
```

There is a `sw` and an `lbu` on the same `0(a0)`. This clash of widths is the
sign of a union. A plain `u32` field would never be read back with a narrower
load.

The main point of this lesson is *which* byte comes back. **This machine is
big-endian.** When a word is stored, its *most significant* byte goes to the
lowest address. So `bytes[0]` is the top byte of `w`, and not the bottom byte.
(This is why, in the target diffs throughout this tier, halves and bytes come
back "upper first" whenever widths mix.) Also note that the compiler really
does go through memory here. It stores and then reloads, instead of shifting
in a register, so both instructions stay in the listing for you to read.

The target's union (below) puts an `s32` and a pair of halfwords in the same
place. The function stores the whole value, then returns one half. The load's
width, sign and offset tell you which inner field the C names.

## Your task

Write `func_80115df0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80115df0(Split *s, s32 v) {
    s->whole = v;
    return s->half.hi;
}
```

<!-- context -->
```c
typedef union {
    s32 whole;
    struct {
        s16 hi;
        s16 lo;
    } half;
} Split;
```
