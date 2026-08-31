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
  - "Decode the helper's name in two parts — the prefix is the signedness, the suffix is the operation."
  - "The signedness in the name must match the types in your signature, or the reloc won't."
---

# Four helpers, one naming scheme

64-bit division and remainder are millicode calls too, and here the
*name* of the helper does all the talking. Here's `quotient(a, b)`,
returning one `s64` divided by another:

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
lw     a3, 36(sp)      # (slot) the last reload rides along
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

The setup is `__ll_mul`'s twin — this whole millicode family shares one
calling shape, so by now you read it in a glance. What changes is the name,
and the name is a two-part code:

- **Prefix**: `__ll_` means *signed* operands, `__ull_` means *unsigned*.
- **Suffix**: `div` is `/`, `rem` is `%`.

Four combinations, four helpers: `__ll_div`, `__ull_div`, `__ll_rem`,
`__ull_rem`. The prefix must agree with your C types and the suffix with
your operator — get either wrong and the `jal`'s relocation names the
wrong symbol, the cleanest possible mismatch to diagnose.

One absence worth savoring: no `break 0x7`, no `break 0x6`. The trap
choreography that surrounds every *32-bit* variable division is nowhere in
sight — the edge cases are the helper's problem now, handled once, inside.
A 64-bit divide site is actually *cleaner* than a 32-bit one.

The target calls a different family member. Read both halves of its name.

## Your task

Write `func_801b0cac` to reproduce the target assembly.

<!-- solution -->
```c
u64 func_801b0cac(u64 a, u64 b) {
    return a % b;
}
```
