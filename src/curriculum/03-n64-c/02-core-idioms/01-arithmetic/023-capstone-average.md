---
id: 4013a287-c1c7-4896-81d2-554702f75635
slug: arithmetic-capstone-average
title: "Capstone: The Average"
difficulty: 4
concepts:
  - arithmetic
  - divide
  - shifts
  - delay-slots
  - capstone
symbol: func_80004e88
hints:
  - "An addition flows into a guarded `sra` pair — you've decoded that divide shape before; this time its input is a sum, not an argument."
  - "The fix-up block ends by copying its result home with an `or` from `zero`. None of that is extra C; one expression produces the whole listing."
---

# A sum that isn't the answer

Last capstone. Averages are everywhere in game code — positions, blends,
midpoints — and they compile into exactly the pieces this chapter taught,
composed. Here's the three-way version, `(p + q + r) / 3`:

```asm
addu  t6, a0, a1     # t6 = p + q
addu  v0, t6, a2     # v0 = p + q + r
addiu at, zero, 3
div   zero, v0, at   # LO = sum / 3
mflo  v0
nop
nop
jr    ra
nop
```

Sum first, then the familiar divide ritual — with one structural note: the
`div` consumes `v0`, the *computed sum*, not an argument register. Just like
the multiply chain in the last capstone, the sub-expression funnels into the
idiom's input slot, and spotting that register is step one of the decode.

The target below divides its sum by a different constant — one that a signed
division handles without the divide unit at all. That means the shape
downstream of the sum is the *guarded* one: a branch, an `sra` doing double
duty in the delay slot, a small bias, and a final register copy pulling the
result into `v0`. Every line of it appeared earlier in this chapter; what's
new is only seeing them stacked.

Take it in two passes, like every compound expression: name the value the
first instruction computes, then recognize the idiom that value feeds. Write
the one line of C. That two-pass habit *is* the chapter — carry it with you.

## Your task

Write `func_80004e88` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80004e88(s32 a, s32 b) {
    return (a + b) / 2;
}
```
