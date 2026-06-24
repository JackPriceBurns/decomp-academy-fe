---
id: abi-float-args
title: Floats Use Their Own Registers
difficulty: 1
concepts:
  - calling-convention
  - floating-point
  - registers
symbol: fadd3
hints:
  - Float arguments arrive in f1, f2, f3; the float result returns in f1.
  - Single-precision add is `fadds`; expect two of them, ending in f1.
---

# A separate file for floating point

Floating-point arguments do **not** share the `r3`–`r10` integer registers.
They have their own bank: the first eight `float`/`double` arguments go in
**`f1`, `f2`, … `f8`**, and a floating-point result comes back in **`f1`**.

Single-precision `f32` math uses the `...s` ("single") variants. For example,
subtracting one `f32` from another compiles to a single `fsubs`:

```asm
fsubs  f1,f1,f2
blr
```

That is `fsub2(f32 a, f32 b) { return a - b; }`. The result lands directly in
`f1` — the float return register, which mirrors `r3` on the integer side.

When a third `f32` argument joins the operation, `f3` holds it. Because there
are now two operations, the compiler needs a temporary: it uses `f0`, a
caller-saved scratch register it reaches for first. The two-instruction
sequence therefore ends with the final result in `f1`.

Now look at the target assembly for `fadd3`. There are two `fadds` instructions.
Trace the registers to figure out which operands each one combines, and what
single C expression produces that two-step sequence.

## Your task

Write `fadd3`, taking three `f32`s, to match the target assembly.

<!-- starter -->
```c
f32 fadd3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 fadd3(f32 a, f32 b, f32 c) {
    return a + b + c;
}
```
