---
id: 76c32bca-f98e-46f0-b021-d5f73e1daf9f
slug: int64-divide-family
title: The Divide Family
difficulty: 3
concepts:
  - int64
  - divide
  - millicode
  - calls
symbol: func_801b0cac
hints:
  - "Read the helper's name in two parts. The prefix gives the signedness, and the suffix gives the operation."
  - "The signedness in the name must match the types in your signature, or the relocation will not match."
---

# Four helpers, one naming scheme

64-bit division and remainder are millicode calls too, and here the *name* of
the helper tells you everything. Here is `quotient(a, b)`, which returns one
`s64` divided by another:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)      # a…
sw     a1, 28(sp)
sw     a2, 32(sp)      # …b
sw     a3, 36(sp)
lw     a0, 24(sp)      # all four words reloaded, each to its own register
lw     a1, 28(sp)
lw     a2, 32(sp)
jal    __ll_div        # signed 64-bit divide
lw     a3, 36(sp)      # (slot) the last reload, in the delay slot
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

The setup is the same as for `__ll_mul`. All of these millicode helpers use
one calling shape, so by now you can read it at a glance. The name is what
changes, and the name is a code in two parts:

- **Prefix**: `__ll_` means *signed* operands, `__ull_` means *unsigned*.
- **Suffix**: `div` is `/`, `rem` is `%`.

Two prefixes and two suffixes give four helpers: `__ll_div`, `__ull_div`,
`__ll_rem` and `__ull_rem`. The prefix must agree with your C types, and the
suffix with your operator. If either is wrong, the `jal`'s relocation names
the wrong symbol. That is the clearest kind of mismatch to diagnose.

Also notice what is missing: there is no `break 0x7` and no `break 0x6`. The
trap checks around every *32-bit* variable division do not appear here. The
helper now handles those edge cases itself. A 64-bit divide site is actually
*cleaner* than a 32-bit one.

The target calls a different member of the family. Read both parts of its
name.

## Your task

Write `func_801b0cac` to reproduce the target assembly.

<!-- solution -->
```c
u64 func_801b0cac(u64 a, u64 b) {
    return a % b;
}
```
