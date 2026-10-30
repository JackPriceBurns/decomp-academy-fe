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
  - The opening `mov` keeps a copy of the incoming value. That means the value
    is needed twice, once shifted and once as it arrived.
  - The function takes one `u32` and returns a `u32`. Shift the value up and
    combine it with itself.
---

# lsl, and the copy that comes with it

`lsl` shifts left by a constant count, and each shift costs one instruction.
Thumb has no shifted-operand form. ARM mode has instructions such as
`add r0, r0, r1, lsl #2`, where the shift is part of another instruction, but
Thumb does not. So each shift in your C is its own line in the listing:

```asm
0        lsl       r0, #2
2        lsl       r1, #5
4        add       r0, r1
6        bx        lr
```

This function shifts two arguments and adds them. The register that each `lsl`
writes to tells you which C operand had which shift. Both shifts stay in the
listing because the amounts are different.

When the amounts are equal, the result is different:

```asm
0        eor       r0, r1
2        lsl       r0, #3
4        bx        lr
```

That function shifts *both* of its arguments left by 3 before combining them.
gcc 2.9 took the shared shift out and did it once at the end, because shifting
distributes over `eor`. So there is one shift in the listing and two in the C.
When your own attempt produces more instructions than the target, an identity
like this one is often the reason.

The other thing to get used to is the three-operand form. `lsl r0, r1, #4`
takes its input from `r1` and writes the result to `r0`. `lsl r0, #4` shifts
`r0` in place. They are the same instruction: the workspace prints the short
form when the destination and the source are the same register. The long form
appears exactly when the compiler needs the value from before the shift to
survive. A `mov rN, r0` followed by a three-operand shift means the compiler is
saving a copy of a value that it will need again.

## Your task

Write `func_080e943c` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080e943c(u32 a) {
    return (a << 4) | a;
}
```
