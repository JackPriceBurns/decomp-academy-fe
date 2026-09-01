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
  - "The `.word 1023` is a mask and the `mov #128` / `lsl #3` pair is the
    single constant 1024. Neither of those numbers was written as a decimal
    literal in the source."
  - Two `s32` parameters, an `s32` out. The first is masked down to its low
    bits, the second is shifted up into the high half, and one fixed bit is
    OR-ed in on top.
---

# The constants are already finished

Any operator whose operands are both constants is evaluated by the compiler
before code generation begins. `8 * 8 - 4` never exists as arithmetic; the
machine only ever sees 60. That is unremarkable on its own, and it has two
consequences that matter for matching.

The first is that the spelling is unrecoverable. `1 << 10`, `1024` and `0x400`
reach the optimizer as the same integer, so no listing can tell you which one
the original programmer typed. Write whichever documents the hardware best — a
shift for a bit position, hex for a mask — and the bytes come out the same.

The second is that the folded value, not the expression, decides how many
instructions you get. Thumb can put anything under 256 in an immediate, can
build `k << n` with a `mov`/`lsl` pair, and needs a pool word for everything
else. Fold two constants together and the result may cross one of those
boundaries in either direction, so the arithmetic you never see still changes
the size of the function.

Here is `rowOffset`, which multiplies by `16 * 2` and adds `8 * 8 - 4`:

```asm
0        lsl       r0, #5
2        add       r0, #60
4        bx        lr
```

Two instructions for five written operations. The multiply by `16 * 2` folded
to 32 and then strength-reduced to a shift, and `8 * 8 - 4` folded to 60, which
fits an immediate.

Folding also deletes things. `blend` writes three terms, one of which is a
constant subtraction:

```asm
0        lsl       r0, #2
2        asr       r1, #3
4        add       r0, r1
6        bx        lr
```

`(100 - 100)` folded to zero and the whole subtraction went with it, and
`(8 - 5)` became the shift count 3. Nothing in the listing records that either
expression was ever written.

Your target ORs a hardware attribute word together out of three pieces. Two
constants shape it: a mask too wide for an immediate, which had to go in the
pool, and a single set bit built in a register by `mov`/`lsl`. Recover both
values from the listing, then write them in whichever form documents the
hardware — the bytes are the same either way.

## Your task

Write `func_083e0544` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083e0544(s32 tile, s32 pal) {
    return (tile & 0x3FF) | (pal << 12) | (1 << 10);
}
```
