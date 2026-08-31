---
id: 4981705b-197c-49bf-ad75-96c8fdf1083f
slug: bitwise-capstone-swap
title: "Capstone: The Rotate That Isn't There"
difficulty: 3
concepts:
  - bitwise
  - shifts
  - capstone
symbol: func_802605c0
hints:
  - "Both shifts read the SAME source register, and the two amounts sum to 32 — that's the rotate pattern. Write both shifts and the OR."
  - "Check each shift's direction against its operand in your C; swapping `<<` and `>>` compiles fine and matches nothing."
---

# Rotation, built by hand

MIPS has no rotate instruction — nothing that spins bits off one end of a
register and back onto the other. When C wants one, it's written as two
shifts of the *same* value OR'd together, and the compiler emits exactly
that. Here's a rotate left by 8:

```asm
sll  t6, a0, 8      # everything moves up a byte; the top byte falls off…
srl  t7, a0, 24     # …and here it is again, brought down to the bottom
or   v0, t6, t7     # the two parts overlap nowhere — paste
jr   ra
nop
```

It looks like the packing dance from three lessons ago, but the fingerprint
is different in two ways:

- **Both shifts read the same register** (`a0` twice) — one *value* split
  into two parts, not two values merged.
- **The shift amounts sum to 32** (8 + 24). Whatever `sll` pushes off the
  top, `srl` re-delivers at the bottom. No bit is lost — the word just
  spins.

Spot those two properties and you can write the C immediately:
`(x << 8) | (x >> 24)`, an unsigned `x` keeping the `srl` honest.

The target below is the same idiom with the amounts changed — and this
particular pair of amounts is special enough to have its own name in most
codebases: look at what it does to the two 16-bit halves of the word.
Rotating by half the width doesn't spin the word so much as *swap its
halves* — a shape you'll meet constantly wherever 16-bit values get packed
and unpacked.

## Your task

Write `func_802605c0` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_802605c0(u32 x) {
    return (x << 16) | (x >> 16);
}
```
