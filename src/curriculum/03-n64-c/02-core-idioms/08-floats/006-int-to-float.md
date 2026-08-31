---
id: 94014527-ef12-40bf-b019-c6f111d57783
slug: floats-int-to-float
title: "Crossing the Border: int to float"
difficulty: 2
concepts:
  - floats
  - conversion
  - mtc1
  - hazards
symbol: func_80100514
hints:
  - "One integer instruction runs before the ferry. Its operands are both arguments — read the mnemonic."
  - "The cast in C wraps the whole integer expression; the trio at the end comes free."
---

# The ferry, then the conversion

You've already met `mtc1` carrying *constant* bits across to the FPU.
Now it carries a live value — and this time the bits have to change
meaning, because the integer 7 and the float 7.0f are different bit
patterns entirely. Here's `itofW(n)`, which returns an `s32` as an
`f32`:

```asm
 0:  mtc1    a0, ft0     # raw bits cross — still an integer pattern
 4:  nop                 # the mtc1 hazard, as ever
 8:  cvt.s.w fv0, ft0    # NOW it becomes a float
 c:  jr      ra
10:  nop
```

`mtc1` is the same dumb ferry as before — bits over, unchanged. The
new instruction is **`cvt.s.w`**: *convert to single, from word* —
the FPU reinterprets the word as the float with the same *value*.
Read the suffixes right-to-left, "from `.w`, to `.s`"; a whole family
of conversions shares this naming and you'll meet more of them soon.

File the three lines — `mtc1`, `nop`, `cvt.s.w` — as one unit
meaning **"an integer became a float here."** In C that's a cast,
`(f32)n`, or just an `s32` handed to float math and promoted
silently. Either spelling compiles to this trio.

When the integer being converted is *computed* rather than a bare
argument, the integer work simply runs first, on the integer side —
then its result takes the ferry. That's the target: one integer
operation on the two arguments, then the trio. The `.w` in `cvt.s.w`
also hints at the return trip — floats become integers by a different
pair of instructions, next lesson.

## Your task

Write `func_80100514` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_80100514(s32 a, s32 b) {
    return (f32)(a - b);
}
```
