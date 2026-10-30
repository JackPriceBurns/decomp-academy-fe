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
  - "Two AND lines prepare the two parts. One clears the slot in `x`, and the other clips the new value. Then the `or` merges them. The constant in each AND tells you where the slot is."
  - "The negative `addiu` constant is the inverted mask from the lesson on clearing bits. The `andi` mask is the positive form of the same mask."
---

# Clear the slot, then put in the new value

The last packing technique replaces one field inside a word and leaves the
rest unchanged. It combines what you learned about clearing bits and packing
values: *clear* the field's bits in the old word, *clip* the new value to the
field's width, and *OR* the two pieces together. Here the low nibble (4 bits)
is replaced:

```asm
addiu at, zero, -16   # 0xfffffff0: everything EXCEPT the low nibble
and   t6, a0, at      # x with its low nibble cleared to zero
andi  t7, a1, 0xf     # the new value, clipped to nibble width
or    v0, t6, t7      # put the new nibble into the cleared slot
jr    ra
nop
```

You have seen every piece before. The negative `addiu` followed by `and` is
the bit-clear idiom. The constant -16 sign-extends to `0xfffffff0`, which is
`~0xf`. The `andi 0xf` clips the incoming value with the *positive* form of
that same mask. Then the `or` combines them. This is safe because the clear
made sure the two sides share no bits.

In C, it reads the way you would describe it:

```c
(x & ~0xf) | (y & 0xf)
```

To tell an *insert* apart from two unrelated masks, check whether **the two
AND constants are inverses of each other**. If a negative `addiu`+`and` uses
the complement of the mask in a nearby `andi`, a field is being replaced.

The target replaces a wider field. Recover the mask from the negative constant
(remember that `~m` is `-m - 1`), then write the clear, clip and merge in C.

## Your task

Write `func_800ba3d4` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_800ba3d4(u32 x, u32 y) {
    return (x & ~0xff) | (y & 0xff);
}
```
