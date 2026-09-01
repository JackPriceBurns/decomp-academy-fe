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

# A remainder you can see through

An unsigned value modulo 2 to the power `n` is the bottom `n` bits of that
value, and keeping the bottom `n` bits is exactly what an `and` with a mask of
`n` ones does. So `% 8` on an unsigned operand is a mask with 7, and the mask is
the entire operation:

```asm
0        mov       r1, r0
2        mov       r0, #7
4        and       r0, r1
6        bx        lr
```

Four instructions and no call. Notice the order gcc chose. Thumb's `and` is
two-operand and destructive, and there is no immediate form of it, so the mask
has to be materialised in a register first — and gcc 2.9 prefers to build the
constant in the register the result must end up in, then move the incoming value
out of the way to make room. That `mov r1, r0` before a `mov r0, #imm` is a
fingerprint of this compiler; the obvious ordering, with the mask in the scratch
register, is what most other compilers emit.

The value never has to move when it arrives somewhere other than `r0`:

```asm
0        mov       r0, #7
2        and       r0, r2
4        bx        lr
```

Same operation on a third argument, one instruction shorter, because `r0` was
already free for the constant.

The mask is where the divisor is hiding, and it is always one less than it: 7
for `% 8`, 63 for `% 64`, 255 for `% 256`. Above 255 a mask can no longer be
moved with an immediate, and since a run of ones wider than eight bits cannot be
built with a `mov` and an `lsl` either, it goes to the literal pool — the same
`ldr rN, [pc, #k]` and trailing `.word` you met building large constants in the
arithmetic chapter. A pool word one less than a power of two, sitting next to an
`and`, is a modulo.

The usual honesty applies: `x % 8` and `x & 7` on an unsigned value produce
identical instructions, so either spelling matches. Write whichever describes
what the value means.

Your target masks a value it had to compute first.

## Your task

Write `func_080af310` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080af310(u32 a, u32 b) {
    return (a - b) % 512;
}
```
