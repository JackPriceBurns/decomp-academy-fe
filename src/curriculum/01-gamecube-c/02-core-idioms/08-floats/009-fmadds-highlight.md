---
id: f195baf0-6958-559f-847a-5daa79da561c
slug: floats-fmadds-highlight
title: ★ Fused Multiply-Add
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - fp-contract
  - highlight
symbol: func_800656e8
hints:
  - With fp_contract on, a multiply feeding an add fuses into one instruction.
  - "`a * b + c` becomes a single `fmadds f1, f1, f2, f3`."
---

# One instruction for multiply-then-add

PowerPC can multiply and add with a single rounding step. With `fp_contract`
on, MWCC can combine a multiply and add in one expression into `fmadds`.

Here the first argument is the addend:

```c
f32 scaled_bias(f32 bias, f32 scale, f32 value) {
    return scale * value + bias;
}
```

```asm
fmadds  f1,f2,f3,f1
blr
```

`fmadds fD, fA, fC, fB` means `fD = (fA * fC) + fB`. The middle two source
operands are multiplied; the last is added. In this example, `f2` and `f3`
are multiplied and `f1` supplies the addend.

To keep the operations separate, assign the product to a temporary variable,
then add in a later statement:

```c
f32 scaled_bias_split(f32 bias, f32 scale, f32 value) {
    f32 product = scale * value;
    return product + bias;
}
```

```asm
fmuls   f0,f2,f3
fadds   f1,f0,f1
blr
```

With this MWCC toolchain and `fp_contract on`, the temporary prevents fusion.
The separate operations round twice, so they can produce a different result
from the fused instruction. Match the form in the target assembly.

The double-precision equivalent is `fmadd`. An `f64` product temporary also
keeps the multiply and add separate as `fmul` and `fadd`. Related instructions
include `fmsubs` (`a*b - c`), `fnmadds`, and `fnmsubs`.

## Your task

Write `func_800656e8` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_800656e8(f32 a, f32 b, f32 c) {
    return a * b + c;
}
```
