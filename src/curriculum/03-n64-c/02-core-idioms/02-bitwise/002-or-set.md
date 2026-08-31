---
id: cd1f489b-79d3-4480-b687-c5b7341d6c87
slug: bitwise-or-set
title: "ori: Forcing Bits On"
difficulty: 1
concepts:
  - bitwise
  - immediates
symbol: func_80347d20
hints:
  - "The `ori` immediate lists exactly the bits being forced on — carry it into your C unchanged."
  - "Sketch the constant in binary if the hex doesn't speak; each 1 is a switch being flipped on."
---

# OR as a stamp

OR is AND's mirror: a bit of the result is 1 if *either* input has a 1. With a
constant mask, that reads as a stamp — ones in the mask are **forced on**,
zeros leave the input alone. Here's a function that switches on bit 15:

```asm
ori v0, a0, 0x8000   # force bit 15 on, keep the rest
jr  ra
nop
```

In C: `x | 0x8000`. You've technically known `ori` since warmup — it built
constants from `zero`, and it just helped `lui` assemble 32-bit values. Those
were both this same stamp: OR-ing bits into a register that had zeros
everywhere it mattered. Now you're seeing it with a *live* value underneath.

Like `andi`, the immediate is zero-extended — low 16 bits only. And like
masks, set-bit constants are almost always flags: game code ORs in "active",
"dirty", "visible" bits constantly, so expect to meet this instruction in
crowds. When a target ORs several scattered bits at once, the C is still one
`|` with one constant — count the ones in the immediate and write them as a
single hex number.

The mask in the target below has more than one bit on. Read them all.

## Your task

Write `func_80347d20` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80347d20(s32 a) {
    return a | 0x111;
}
```
