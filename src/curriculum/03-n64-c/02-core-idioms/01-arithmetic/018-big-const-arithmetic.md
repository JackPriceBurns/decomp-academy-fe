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
  - "First join the `lui` and `ori` immediates into one 32-bit value. Then read the final register instruction as normal."
  - "0x186a0 is a very round number in decimal. Convert it before you decide how to write it in C."
---

# Big constants go through at

A constant that fits in 16 bits is stored inside the `addiu` instruction. For
one that doesn't fit, the compiler must first build the constant in a
register, and then do *register* arithmetic. The register it uses is `at`, the
assembler temporary, which exists for this kind of scratch work. Here's
`x + 0x12340`:

```asm
lui  at, 0x1          # at = 0x0001_0000
ori  at, at, 0x2340   # at = 0x0001_2340
addu v0, a0, at       # v0 = x + 0x12340
jr   ra
nop
```

You already know both decoding steps. First join the `lui`/`ori` pair into one
constant. Then read the `addu` as a plain register add: one operand is a
variable, and the other is the constant you rebuilt. The same pattern works for
any operation. A `subu` on the third line would subtract the big constant, and
earlier you saw `div` use a divisor held in `at`.

Here you often have to make a choice: **hex or decimal?** The instructions
only give you 0x12340. Whether the programmer wrote `0x12340` or `74560` is
lost. Both compile identically, so the match is the same either way, but the
choice matters for readable decomp. Values that are round in hex (masks,
addresses) should stay in hex. Values that are round in *decimal* (offsets
like 100000, timeouts, prices) read better in decimal. Convert the target's
constant both ways and see which one looks deliberate.

## Your task

Write `func_80294440` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80294440(s32 a) {
    return a + 100000;
}
```
