---
id: 07b448cf-c9ad-4bfe-8f20-798527644822
slug: gba-arithmetic-mul-shift-add
title: Multiplying by Nine in Two Instructions
difficulty: 3
concepts:
  - multiply
  - strength-reduction
  - shifts
symbol: func_0805c910
hints:
  - If you shift a value left by k and then add the original value back, you
    get 2^k plus one times the value. The shift amount is the only thing you
    need to read.
  - The function takes two `s32` parameters and returns an `s32`. The first is
    multiplied by 33, and then the second is subtracted from the result.
---

# A shift and an add make a multiply

A multiply by a constant does not have to use `mul`. gcc 2.9 knows that a shift
is cheaper, and it can turn any constant of the form 2^k + 1 into two
instructions.

Here is `y * 9`:

```asm
0        lsl       r0, r1, #3
2        add       r0, r1
4        bx        lr
```

The shift gives eight times `y`, and the add adds one more `y`, for nine times
`y`. Notice that the `add` reads `r1`, which still holds the original value.
**Every step of the chain refers back to one register, and that register holds
the multiplicand.** The factor is 2 to the power of the shift amount, plus one.

Here is the same pattern with a different shift, `z * 5`:

```asm
0        lsl       r0, r2, #2
2        add       r0, r2
4        bx        lr
```

That is four times `z`, plus one more. Every constant of this kind works the
same way. Shift by 1 and add for 3, by 3 and add for 9, by 6 and add for 65,
and so on for any 2^k + 1.

Neither example needed a copy, because the multiplicand arrived in a register
that the chain did not have to write. When the value being scaled is in `r0`,
the register where the result has to end up, gcc has a problem. The first `lsl`
would overwrite the multiplicand, and the `add` still needs to read it. So
something has to be copied, and which register is free decides where it goes.
If the register next to `r0` is free, gcc copies the multiplicand there and
builds the chain in `r0`. If that register already holds another argument, gcc
leaves the multiplicand where it is. It builds the chain in a higher register,
and at the very end it moves the result into `r0` with a `mov r0, rN`.

The two copies mean different things. A copy at the top saves a value before
its register is reused. A copy at the bottom means the running result was never
in `r0`. The whole chain ran in a scratch register, and the last instruction
only puts the result where the ABI expects it.

Your target ends with one of those moves. First read the chain in the scratch
register, then see what happens to its result.

## Your task

Write `func_0805c910` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0805c910(s32 a, s32 b) {
    return a * 33 - b;
}
```
