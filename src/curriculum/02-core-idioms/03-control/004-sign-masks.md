---
id: control-sign-masks
title: Two's Complement, srawi, and andc by Hand
difficulty: 2
concepts:
  - twos-complement
  - srawi
  - andc
  - bitwise
  - sign-mask
concept: true
---

# Where branchless clamps come from

The next few lessons lean on a trick that turns a sign test into pure
arithmetic: shift a value right to manufacture a **mask**, then combine that mask
with the original to keep or kill it — no comparison, no branch. Before you meet
it in an exercise, let's dry-run the two instructions involved, `srawi` and
`andc`, by hand. We'll work in **8 bits** so the whole value fits in a byte and
every step is visible. The logic is identical at 32 bits; only the shift amount
changes.

## Two's complement in 8 bits

In two's complement the top bit is the **sign bit**. With 8 bits, bit 7 carries
the weight `-128`; the remaining bits carry their usual positive weights. So:

| binary      | computation                | decimal |
|-------------|----------------------------|--------:|
| `0000 0000` | 0                          | 0       |
| `0000 0101` | 4 + 1                      | 5       |
| `0111 1111` | 64+32+16+8+4+2+1           | 127     |
| `1111 1111` | -128 + 127                 | -1      |
| `1111 1011` | -128 + 123                 | -5      |
| `1000 0000` | -128                       | -128    |

The one fact that matters below: **a value is negative exactly when its top bit
is 1.** Everything that follows is a way of broadcasting that single bit.

## srawi is an *arithmetic* shift

`srawi rD, rA, n` shifts `rA` right by `n` bits, and because it is *arithmetic*
it fills the vacated top bits with **copies of the sign bit** rather than zeros.
Two consequences fall out of that:

- positive numbers get `0`s shifted in, negative numbers get `1`s shifted in;
- the result is the input floor-divided by `2ⁿ` (rounding toward −∞).

Dry-run a few (8-bit), shifting by 1 and by 2:

| decimal | binary      | `srawi 1`   | = dec | `srawi 2`   | = dec |
|--------:|-------------|-------------|------:|-------------|------:|
| 20      | `0001 0100` | `0000 1010` | 10    | `0000 0101` | 5     |
| -20     | `1110 1100` | `1111 0110` | -10   | `1111 1011` | -5    |
| -5      | `1111 1011` | `1111 1101` | -3    | `1111 1110` | -2    |

Notice the negatives: ones flood in from the left, and `-5 >> 1` lands on `-3`
(not `-2`) because the rounding goes *down*. This isn't theory — `int x; x >> 2`
compiles straight to a single instruction:

```asm
srawi r3,r3,2   # x >> 2, for signed x
blr
```

## The special case: shift by width − 1

Now push the shift all the way: shift an 8-bit value right by **7** (one less
than the width). Every output bit becomes a copy of the *one* sign bit, so the
result can only be one of two patterns:

| decimal | binary      | `srawi 7`   |
|--------:|-------------|-------------|
| 5       | `0000 0101` | `0000 0000` |
| 127     | `0111 1111` | `0000 0000` |
| 0       | `0000 0000` | `0000 0000` |
| -1      | `1111 1111` | `1111 1111` |
| -20     | `1110 1100` | `1111 1111` |
| -128    | `1000 0000` | `1111 1111` |

That's a **sign mask**: `0x00` for any value `≥ 0`, `0xFF` for any value `< 0`.
A whole-byte yes/no answer to "is this negative?", derived with one instruction
and zero branches. (At 32 bits the same idea uses `srawi rD, rA, 31`.)

## andc applies the mask

`andc rD, rA, rB` computes `rA AND (NOT rB)` — an AND where the second operand is
inverted first. Feed it the value and its sign mask and watch what happens. The
`~mask` column is the step learners usually skip, so it's spelled out here:

| decimal | binary `x`  | mask (`srawi 7`) | `~mask`     | `x & ~mask` | result |
|--------:|-------------|------------------|-------------|-------------|-------:|
| 5       | `0000 0101` | `0000 0000`      | `1111 1111` | `0000 0101` | 5      |
| 127     | `0111 1111` | `0000 0000`      | `1111 1111` | `0111 1111` | 127    |
| -1      | `1111 1111` | `1111 1111`      | `0000 0000` | `0000 0000` | 0      |
| -128    | `1000 0000` | `1111 1111`      | `0000 0000` | `0000 0000` | 0      |

Read the result column: non-negative values pass through untouched, negative
values collapse to `0`. The mask *selects* — `~0x00 = 0xFF` is "keep every bit",
`~0xFF = 0x00` is "drop every bit" — and `andc` does the inversion and the AND in
one shot, which is exactly why the compiler reaches for it instead of a separate
`not` plus `and`.

## Putting it together

Two instructions, no branch:

```asm
srawi r0, r3, 31   # r0 = sign mask: 0x00000000 if r3 >= 0, else 0xFFFFFFFF
andc  r3, r3, r0   # r3 = r3 AND (NOT mask): unchanged if >= 0, else 0
```

The shift manufactures a mask out of the sign bit; `andc` uses that mask to keep
the value or zero it. Hold onto this dry-run — the very next lesson asks you to
produce this exact pair from C, and several later idioms are just variations on
"build a mask, then apply it."
