---
id: 1a51100c-a441-4f09-a55d-a357d6b8b5b6
slug: arithmetic-big-const-arithmetic
title: Big Constants in Arithmetic
difficulty: 2
concepts:
  - immediates
  - arithmetic
  - registers
symbol: func_80294440
hints:
  - "Concatenate the `lui` and `ori` immediates into one 32-bit value first, then read the final register instruction as normal."
  - "0x186a0 is a suspiciously round number in decimal — convert before you decide how to write it in C."
---

# When the helper is at

Add a constant that fits 16 bits and it rides inside `addiu`. Add one that
doesn't, and the compiler must build the constant first — in a register — and
then do *register* arithmetic. Which register? `at`, the assembler temporary,
doing exactly the scratch job it was named for. Here's `x + 0x12340`:

```asm
lui  at, 0x1          # at = 0x0001_0000
ori  at, at, 0x2340   # at = 0x0001_2340
addu v0, a0, at       # v0 = x + 0x12340
jr   ra
nop
```

The decode is two steps you already own: concatenate the `lui`/`ori` pair into
one constant, then read the `addu` as a plain register add — one operand a
variable, the other your rebuilt constant. The same pattern serves any
operation: a `subu` third line would subtract the big constant, and you saw
`div` lean on an `at`-parked divisor chapters ago.

One judgment call recurs here: **hex or decimal?** The instruction stream
only gives you 0x12340; whether the programmer wrote `0x12340` or `74560` is
lost. Both compile identically, so matching doesn't care — but readable
decomp does. Round hex (masks, addresses) should stay hex; round *decimal*
(offsets like 100000, timeouts, prices) reads better in decimal. Convert the
target's constant both ways and see which one looks intentional.

## Your task

Write `func_80294440` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80294440(s32 a) {
    return a + 100000;
}
```
