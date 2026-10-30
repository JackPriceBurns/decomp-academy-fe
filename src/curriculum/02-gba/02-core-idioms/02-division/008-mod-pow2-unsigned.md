---
id: 42245dc1-e9eb-41cc-9737-a1f5acc9f5ab
slug: gba-division-mod-pow2-unsigned
title: An Unsigned Remainder That Is a Mask
difficulty: 3
concepts:
  - division
  - bitwise
  - literal-pool
symbol: func_080af310
hints:
  - The `.word` at the bottom is the mask, printed in decimal. Add one to it and
    you have the divisor.
  - Two `u32` parameters in, a `u32` out. The second is subtracted from the first
    and the difference is taken modulo 512.
---

# Keeping the bottom bits

An unsigned value modulo 2 to the power `n` is the bottom `n` bits of that
value. An `and` with a mask of `n` one bits keeps exactly those bottom `n` bits.
So `% 8` on an unsigned operand is an `and` with 7, and that `and` is the whole
operation:

```asm
0        mov       r1, r0
2        mov       r0, #7
4        and       r0, r1
6        bx        lr
```

That is four instructions and no call. Look at the order gcc chose. Thumb's
`and` takes two operands and overwrites the first, and it has no immediate form.
So the mask must be loaded into a register first. gcc 2.9 prefers to build the
constant in the register where the result must end up, so it first moves the
incoming value out of the way. A `mov r1, r0` before a `mov r0, #imm` is typical
of this compiler. Most other compilers do it the other way round and put the
mask in the scratch register.

When the value arrives in a register other than `r0`, it does not need to move:

```asm
0        mov       r0, #7
2        and       r0, r2
4        bx        lr
```

This is the same operation on a third argument. It is one instruction shorter,
because `r0` was already free for the constant.

The mask gives you the divisor. It is always one less than the divisor: 7 for
`% 8`, 63 for `% 64`, and 255 for `% 256`. A mask above 255 is too big for a
`mov` immediate. A run of more than eight one bits also cannot be built with a
`mov` and an `lsl`. So the mask goes to the literal pool, using the same
`ldr rN, [pc, #k]` and `.word` at the end of the function that you met for large
constants in the arithmetic chapter. A pool word one less than a power of two,
used by an `and`, is a modulo.

As with an unsigned divide by a power of two, `x % 8` and `x & 7` on an unsigned
value produce identical instructions, so either spelling matches. Write the one
that best describes what the value means.

Your target applies a mask to a value that it has to compute first.

## Your task

Write `func_080af310` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080af310(u32 a, u32 b) {
    return (a - b) % 512;
}
```
