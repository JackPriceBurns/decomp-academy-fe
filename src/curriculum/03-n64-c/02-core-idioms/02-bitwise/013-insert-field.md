---
id: 32e8f548-352e-4a4c-b78a-197f1189701a
slug: bitwise-insert-field
title: Replacing a Field
difficulty: 3
concepts:
  - bitwise
  - masks
  - fingerprints
symbol: func_800ba3d4
hints:
  - "Two AND lines prepare the two ingredients — one clears the slot in `x`, the other clips the new value — and the `or` merges them. Each AND's constant tells you the slot."
  - "The negative `addiu` constant is the inverted mask from the clear-bits lesson; the `andi` mask is its positive twin."
---

# Clear the slot, drop in the new value

The last packing trick: replacing one field inside a word while leaving the
rest untouched. It's the previous two lessons glued together — *clear* the
field's bits in the old word, *clip* the new value to the field's width, *OR*
the pieces. Here's the low nibble (4 bits) being replaced:

```asm
addiu at, zero, -16   # 0xfffffff0 — everything EXCEPT the low nibble
and   t6, a0, at      # x with its low nibble cleared to zero
andi  t7, a1, 0xf     # the new value, clipped to nibble width
or    v0, t6, t7      # slot the new nibble into the hole
jr    ra
nop
```

You've met every piece. The `addiu`-negative-then-`and` is the bit-clear
idiom — -16 sign-extends to `0xfffffff0`, which is `~0xf`. The `andi 0xf`
clips the incoming value with the *positive* twin of that same mask. And the
`or` pastes them, safe because the clear guaranteed the two sides share no
bits.

In C, that reads exactly the way you'd say it:

```c
(x & ~0xf) | (y & 0xf)
```

The tell that you're looking at an *insert*, not two unrelated masks: **the
two AND constants are inverses of each other**. Spot a negative
`addiu`+`and` whose mask is the complement of a nearby `andi`, and you know a
field is being swapped out.

The target replaces a wider field. Recover the mask from the negative
constant (remember: `~m` is `-m - 1`) and write the clear-clip-merge in C.

## Your task

Write `func_800ba3d4` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_800ba3d4(u32 x, u32 y) {
    return (x & ~0xff) | (y & 0xff);
}
```
