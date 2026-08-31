---
id: 2670e03a-c8de-46c1-aa27-1d409aed7094
slug: bitwise-and-mask
title: "andi: Keeping Only Some Bits"
difficulty: 1
concepts:
  - bitwise
  - immediates
symbol: func_8019c380
hints:
  - "The immediate on the `andi` is the mask — the bits it keeps. Use the same constant in your C."
  - "Write the constant in hex; it describes bit positions, not a quantity."
---

# AND as a filter

This chapter is about instructions that treat a register not as a number but
as **32 individual switches**. The first is AND: a bit survives only where
*both* inputs have a 1. Give one input a constant — a **mask** — and AND
becomes a filter: ones in the mask mark the bits to keep, zeros erase.

The immediate form is `andi`. Here's a function keeping bits 8 through 15 —
the second byte — of its input:

```asm
andi v0, a0, 0xff00   # keep bits 8-15, clear everything else
jr   ra
nop
```

Everything outside the mask's ones is now zero; everything inside came through
untouched. In C that's `x & 0xff00`.

Two things worth knowing about `andi` specifically:

- **The immediate is *zero*-extended**, not sign-extended like `addiu`'s.
  The 16-bit field fills the low half; the upper 16 bits of the mask are
  always zero. A mask touching the top half of the register can't use `andi`
  at all — remember `lui` when you meet one.
- You saw `andi` do arithmetic duty as `% 2^k` last chapter, where its mask
  was a solid run of ones ending at bit 0. A mask that *isn't* that shape —
  like 0xff00, floating up in the middle — is genuine bit work, and the C
  should say `&`, not `%`.

Read the target's mask, and mind the second habit: hex, because masks are
positions.

## Your task

Write `func_8019c380` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8019c380(s32 a) {
    return a & 0xf0;
}
```
