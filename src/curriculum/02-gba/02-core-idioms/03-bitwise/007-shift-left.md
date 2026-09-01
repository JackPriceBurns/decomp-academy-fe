---
id: 19c4d165-3aaf-431e-8642-28192ea6e2e6
slug: gba-bitwise-shift-left
title: Shifting Left
difficulty: 2
concepts:
  - shifts
  - bitwise
  - register-allocation
symbol: func_080e943c
hints:
  - The opening `mov` keeps a copy of the incoming value, which means the value
    is needed twice — once shifted, once as it arrived.
  - One `u32` in, one `u32` out. Shift it up and combine it with itself.
---

# lsl, and the copy that comes with it

`lsl` shifts left by a constant count and costs one instruction per shift.
Thumb has no shifted-operand form — nothing like ARM mode's
`add r0, r0, r1, lsl #2`, where the shift rides along inside another
instruction — so each shift in your C is its own line in the listing:

```asm
0        lsl       r0, #2
2        lsl       r1, #5
4        add       r0, r1
6        bx        lr
```

Two shifted arguments, added. Which register the `lsl` lands on tells you which
C operand carried which shift, and both shifts survive because they are
different amounts.

Equal amounts are a different story:

```asm
0        eor       r0, r1
2        lsl       r0, #3
4        bx        lr
```

That function shifts *both* of its arguments left by 3 before combining them.
gcc 2.9 factored the common shift out and did it once at the end, because
shifting distributes over `eor`. One shift in the listing, two in the C. When
your own attempt produces more instructions than the target, an identity like
this one is often the reason.

The other rendering to get used to is the three-operand form. `lsl r0, r1, #4`
takes its input from `r1` and writes `r0`; `lsl r0, #4` shifts `r0` in place.
They are the same instruction — the workspace prints the short form when the
destination and source are the same register — and the long form appears exactly
when the compiler needs the pre-shift value to survive. A `mov rN, r0` followed
by a three-operand shift is the compiler stashing a copy of a value it is going
to need again.

## Your task

Write `func_080e943c` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080e943c(u32 a) {
    return (a << 4) | a;
}
```
