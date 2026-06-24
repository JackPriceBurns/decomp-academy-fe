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

Single-precision `f32` math uses the `...s` ("single") forms, so summing three
floats is two `fadds`:

```asm
fadds f0, f1, f2   # a + b  (into scratch f0)
fadds f1, f3, f0   # + c, result in the return reg f1
blr
```

The compiler uses `f0` as its float scratch register — it is caller-saved and
the compiler reaches for it first when it needs a temporary. Notice the final
result lands in `f1`, the float return register — the mirror of `r3` on the
integer side.

## Your task

Write `fadd3`, taking three `f32`s, to match the target assembly above.

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
