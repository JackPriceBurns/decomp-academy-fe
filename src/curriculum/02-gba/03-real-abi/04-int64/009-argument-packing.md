---
id: 25556f8b-754e-4b36-9b37-4a41764c0b7c
slug: gba-int64-argument-packing
title: No Gap in the Argument Registers
difficulty: 5
concepts:
  - int64
  - abi
  - arguments
symbol: func_083af348
hints:
  - "`r1:r2` is one 64-bit argument. Walk the argument registers from `r0`
    upward, giving each parameter one register unless it is 64 bits wide, in
    which case it takes two."
  - Three parameters - an `s32`, an `s64` and an `s32` - and an `s64` result.
    Both 32-bit parameters are added into the 64-bit one.
---

# The pair starts wherever the last argument stopped

agbcc uses the original APCS, which fills argument registers strictly in order
and has no alignment rule whatsoever. A 64-bit argument takes the **next two**
registers, whichever two those happen to be. A 32-bit parameter followed by a
64-bit one therefore puts the pair in `r1:r2` - an odd/even pair that no modern
ARM ABI would ever produce, because AAPCS would skip `r1` and start the pair at
`r2`.

Every instinct you have from modern ARM says `r2:r3`, and a listing built on
that guess never matches.

Here is a function whose first parameter is a single byte:

```asm
0        str       r1, [r3, #8]
2        str       r2, [r3, #12]
4        bx        lr
```

Three instructions, and they settle the whole layout. Nothing reads `r0` at all,
and the 64-bit parameter still starts at `r1` - a byte-wide parameter consumes a
whole register and the next parameter takes the one after it, with no packing
and no padding anywhere. That 64-bit parameter is `r1:r2`, stored low half
first, and the pointer that follows it lands in `r3`. The offsets +8 and +12 say
the store went to the second 8-byte slot, not the first.

If you want the layout confirmed from the arithmetic side rather than from a
store:

```asm
0        mov       r1, r2
2        sub       r1, r0
4        mov       r0, r1
6        bx        lr
```

`mov r1, r2` picks up the high half of the 64-bit parameter - `r2`, not `r3` -
and subtracts the 32-bit parameter in `r0` from it.

Read your target from `r0` upward and let the arithmetic tell you where one
parameter ends and the next begins.

## Your task

Write `func_083af348` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_083af348(s32 n, s64 a, s32 m) {
    return a + n + m;
}
```
