---
id: cb5ee752-24d3-588a-9c32-ccb13027b9d0
slug: floats-abs-neg
title: Absolute Value and Negation
difficulty: 2
concepts:
  - floating-point
  - fabs
  - fneg
  - sign-bit
symbol: negabs
hints:
  - "`__fabsf` lowers to `fabs` (clear sign bit); unary minus lowers to `fneg`
    (flip sign bit)."
  - "`-__fabsf(x)` becomes `fabs f0, f1` then `fneg f1, f0`."
---

# Sign-bit instructions

A couple of one-instruction operations close out the chapter, and both are dead simple. Floating-point **negation** is `fneg`, which flips the sign bit. **Absolute value** is `fabs`, which clears it. On their own, each costs exactly one instruction:

```asm
# absval(f32 v):
fabs  f1, f1       # clear sign bit
blr

# negate(f32 v):
fneg  f1, f1       # flip sign bit
blr
```

Reach for the single-precision intrinsic `__fabsf` and it lowers straight to `fabs`.

Here's the quirk. These two skip the `s` suffix entirely, so even on an `f32` you'll read `fabs` and `fneg`, never an `s`-tagged form. That breaks the single/double naming rule from before, and for good reason. Toggling a sign bit gives identical bits at single or double width, so there's nothing to round and no second variant to define.

Spot the two instructions one after another and the order is everything. They don't commute, so which sign-bit op runs first and which runs second changes the meaning. The C that lays them down in that exact sequence follows from what you read off the disassembly.

## Your task

Write `negabs` to compile to the two sign-bit instructions above.

<!-- solution -->
```c
f32 negabs(f32 x) {
    return -__fabsf(x);
}
```
