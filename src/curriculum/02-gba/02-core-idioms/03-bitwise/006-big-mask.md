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
  - Do the arithmetic on the `mov`/`lsl` pair before anything else — 255 shifted
    left by 7 is the mask the C actually wrote.
  - Two `u32` arguments, one `u32` result. The first is masked; the second is
    or-ed on whole.
---

# Building a mask out of a mov and a shift

A mask has to be in a register before `and` can use it, and `mov Rd, #imm`
carries only 8 bits. Masks above 255 therefore get *built*, and the shape of the
build tells you the value.

The cheap case is a mask whose set bits form a run of at most 8 that can be
slid into place with one shift:

```asm
0        mov       r0, #252
2        lsl       r0, #3
4        and       r0, r1
6        bx        lr
```

252 shifted left by 3 is `0x7E0`, so that function masks its second argument
with `0x7E0`. Read every `mov`/`lsl` pair this way: multiply the moved constant
by two to the power of the shift amount and you have the number the C wrote.

The shift count is forced, which makes the read unambiguous. gcc puts the
highest set bit at bit 7 of the `mov` and shifts up from there. That is why the
constant above is 252 where a person writing a six-bit run by hand would have
reached for 63, and why `0x300` arrives as `mov #192, lsl #2`. If the constant
is not the one you expected, count from the top bit.

When the mask needs more than 8 significant bits it cannot be built this way at
all, and the compiler falls back to a PC-relative load from a word parked at the
end of the function:

```asm
0        mov       r1, r0
2        ldr       r0, [pc, #4] (->8)
4        and       r0, r1
6        bx        lr
8        .word     65535
```

`.word 65535` is `0xFFFF`. The pool row is part of the function and part of the
match, and the workspace prints it in decimal, so keep a converter handy.

The mask in your target is built rather than loaded, so it is a run of at most
eight bits. Do that multiplication first and the rest of the listing reads
straight off.

## Your task

Write `func_080e4cc8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080e4cc8(u32 a, u32 b) {
    return (a & 0x7F80) | b;
}
```
