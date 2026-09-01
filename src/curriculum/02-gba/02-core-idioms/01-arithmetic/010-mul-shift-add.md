---
id: 07b448cf-c9ad-4bfe-8f20-798527644822
slug: gba-arithmetic-mul-shift-add
title: Multiply by Nine, Pay for Two Instructions
difficulty: 3
concepts:
  - multiply
  - strength-reduction
  - shifts
symbol: func_0805c910
hints:
  - Shift a value left by k and add the untouched original back and you have 2^k
    plus one copies of it. The shift amount is the only thing you need to read.
  - "Two `s32` parameters in, an `s32` out. The first is scaled by 33 and the
    second is then subtracted from the result."
---

# A shift and an add is a multiply

A constant multiply does not have to use `mul`. gcc 2.9 knows a shift is cheaper,
and any constant of the form 2^k + 1 falls apart into two instructions.

Here is `y * 9`:

```asm
0        lsl       r0, r1, #3
2        add       r0, r1
4        bx        lr
```

The shift makes eight copies of `y`; the add folds in one more, for nine. Notice
that the `add` reads `r1` — the original, untouched value. **The register every
step of a chain refers back to is the multiplicand**, and the shift amount plus
one is the factor.

The same shape with a different shift, `z * 5`:

```asm
0        lsl       r0, r2, #2
2        add       r0, r2
4        bx        lr
```

Four copies plus one. The whole family works this way: shift by 1 and add for 3,
by 3 and add for 9, by 6 and add for 65 — any 2^k + 1 at all.

Both of those examples were free of copies because the multiplicand arrived in a
register the chain did not have to write. When the value being scaled is in `r0`,
the register the result has to end up in, gcc has a problem: the first `lsl`
would destroy the multiplicand that the `add` still needs to read. Something has
to be copied, and which register is free decides where. With a spare register
beside `r0`,
gcc parks the multiplicand there and runs the chain in `r0`. With that register
already holding another argument, it leaves the multiplicand where it is, builds
the chain further up, and carries the result home with a `mov r0, rN` at the very
end.

The two copies read differently. One at the top saved a value before its register
was reused. One at the bottom means the accumulator was never `r0` — the whole
chain ran in a scratch register, and the last instruction is only putting the
result where the ABI wants it.

Your target ends with one of those moves. Read the chain in the scratch register
first, then see what happens to it.

## Your task

Write `func_0805c910` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0805c910(s32 a, s32 b) {
    return a * 33 - b;
}
```
