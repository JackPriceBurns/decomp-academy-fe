---
id: f5323951-b820-40b5-835a-ef049214b3f3
slug: gba-optimizer-constant-folding
title: Arithmetic Done at Compile Time
difficulty: 3
concepts:
  - optimizer
  - constants
  - literal-pool
symbol: func_083e0544
hints:
  - "The `.word 1023` is a mask, and the `mov #128` / `lsl #3` pair builds the
    single constant 1024. Neither number was written as a decimal literal in
    the source."
  - The function takes two `s32` parameters and returns an `s32`. The first is
    masked down to its low bits. The second is shifted up into the high half.
    Then one fixed bit is set with an OR.
---

# Constant arithmetic is already done

If both operands of an operator are constants, the compiler evaluates it before
code generation begins. `8 * 8 - 4` never exists as arithmetic in the output.
The machine only sees 60. This has two consequences that matter for matching.

First, you cannot recover how a constant was written. `1 << 10`, `1024` and
`0x400` reach the optimizer as the same integer, so no listing can tell you
which one the original programmer typed. Write whichever form describes the
hardware best, such as a shift for a bit position or hex for a mask. The bytes
come out the same.

Second, the folded value decides how many instructions you get. Thumb can put
any value under 256 in an immediate. It can build `k << n` with a `mov`/`lsl`
pair. Everything else needs a pool word. When two constants fold together, the
result may cross one of those limits in either direction. So arithmetic that you
never see in the listing still changes the size of the function.

Here is `rowOffset`, which multiplies by `16 * 2` and adds `8 * 8 - 4`:

```asm
0        lsl       r0, #5
2        add       r0, #60
4        bx        lr
```

There are two instructions for five written operations. The multiply by
`16 * 2` folded to 32, and strength reduction then turned it into a shift.
`8 * 8 - 4` folded to 60, which fits in an immediate.

Folding can also remove code. `blend` writes three terms, and one of them is a
constant subtraction:

```asm
0        lsl       r0, #2
2        asr       r1, #3
4        add       r0, r1
6        bx        lr
```

`(100 - 100)` folded to zero, so the whole subtraction was removed. `(8 - 5)`
became the shift count 3. Nothing in the listing shows that either expression
was ever written.

Your target builds a hardware attribute word by ORing three pieces together.
Two constants shape it. One is a mask too wide for an immediate, so it had to
go in the pool. The other is a single set bit, built in a register by
`mov`/`lsl`. Recover both values from the listing. Then write them in whichever
form describes the hardware best, because the bytes are the same either way.

## Your task

Write `func_083e0544` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083e0544(s32 tile, s32 pal) {
    return (tile & 0x3FF) | (pal << 12) | (1 << 10);
}
```
