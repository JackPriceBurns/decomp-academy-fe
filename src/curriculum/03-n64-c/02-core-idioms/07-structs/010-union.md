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
  - "A word store then a *halfword* load from the same address — the write goes in through one union member, the read comes out through the other."
  - "The load is `lh` at offset 0. On this machine the first two bytes of a stored word are its upper half — pick the inner field accordingly."
---

# Same bytes, different glasses

A union stacks all its members at **offset 0** — they overlap, and
each member is just a different way of reading the same bytes. In
assembly that becomes: accesses to one address with *mismatched
widths*. Here's a union used to peel a byte out of a word:

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
sw    a1, 0(a0)     # in through .word — all 32 bits
lbu   v0, 0(a0)     # out through .bytes[0] — just one byte
jr    ra
nop
```

A `sw` and an `lbu` on the same `0(a0)` — that width clash is the
union fingerprint. A plain `u32` field would never be re-read narrow.

And *which* byte did we get? Here's the fact this lesson exists to
plant: **this machine is big-endian** — a stored word's *most
significant* byte lands at the lowest address. `bytes[0]` is the top
byte of `w`, not the bottom. (Check the target diffs all tier: that's
why halves and bytes come back "upper first" whenever widths mix.)
Also worth knowing: the compiler keeps these honest by actually going
through memory — store, then reload — rather than shifting in a
register, so the pair of instructions survives to be read.

The target's union (below) overlays an `s32` with a pair of
halfwords. It stores the whole thing, then returns one half — the
load's width, sign, and offset select which inner field the C names.

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
