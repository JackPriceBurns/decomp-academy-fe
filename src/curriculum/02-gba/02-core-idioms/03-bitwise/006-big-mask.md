---
id: 8e1d84f9-6ddf-4f09-a109-31f06e65663b
slug: gba-bitwise-big-mask
title: A Mask That Will Not Fit
difficulty: 2
concepts:
  - bitwise
  - constants
  - immediates
symbol: func_080e4cc8
hints:
  - Do the arithmetic on the `mov`/`lsl` pair first. 255 shifted left by 7 is
    the mask that the C wrote.
  - The function takes two `u32` arguments and returns a `u32`. The first
    argument is masked. The second is or-ed in as it is, with no mask.
---

# Building a mask out of a mov and a shift

A mask has to be in a register before `and` can use it, and `mov Rd, #imm`
holds only 8 bits. So masks above 255 have to be *built*, and the way they are
built tells you the value.

The cheap case is a mask whose set bits form a run of at most 8 bits, which one
shift can move into place:

```asm
0        mov       r0, #252
2        lsl       r0, #3
4        and       r0, r1
6        bx        lr
```

252 shifted left by 3 is `0x7E0`, so that function masks its second argument
with `0x7E0`. Read every `mov`/`lsl` pair this way: multiply the moved constant
by two to the power of the shift amount, and you have the number the C wrote.

The compiler always chooses the shift count the same way, so there is only one
way to read the pair. gcc puts the highest set bit at bit 7 of the `mov`, and
shifts up from there. That is why the constant above is 252. A person building
a run of six bits by hand would probably use 63. It is also why `0x300` becomes
`mov #192, lsl #2`. If the constant is not the one you expected, count from the
top bit.

When the mask needs more than 8 significant bits, it cannot be built this way.
Instead, the compiler uses a PC-relative load from a word stored at the end of
the function:

```asm
0        mov       r1, r0
2        ldr       r0, [pc, #4] (->8)
4        and       r0, r1
6        bx        lr
8        .word     65535
```

`.word 65535` is `0xFFFF`. This literal pool entry is part of the function, and
it has to match too. The workspace prints it in decimal, so keep a converter
handy.

The mask in your target is built with a `mov` and a shift, so it is a run of at
most eight bits. Do that multiplication first, and the rest of the listing
follows from it.

## Your task

Write `func_080e4cc8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080e4cc8(u32 a, u32 b) {
    return (a & 0x7F80) | b;
}
```
