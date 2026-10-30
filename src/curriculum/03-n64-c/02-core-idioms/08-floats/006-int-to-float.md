---
id: 94014527-ef12-40bf-b019-c6f111d57783
slug: floats-int-to-float
title: "Converting int to float"
difficulty: 2
concepts:
  - floats
  - conversion
  - mtc1
  - hazards
symbol: func_80100514
hints:
  - "One integer instruction runs before the `mtc1`. Both arguments are its operands. Read the mnemonic."
  - "The cast in C wraps the whole integer expression. That cast alone produces the three instructions at the end."
---

# Move first, then convert

You have already seen `mtc1` copy *constant* bits to the FPU. Here it copies
a live value. This time the bits also have to change meaning, because the
integer 7 and the float 7.0f have completely different bit patterns. This is
`itofW(n)`, which returns an `s32` as an `f32`:

```asm
 0:  mtc1    a0, ft0     # raw bits move across, still an integer pattern
 4:  nop                 # the mtc1 hazard, as always
 8:  cvt.s.w fv0, ft0    # NOW it becomes a float
 c:  jr      ra
10:  nop
```

`mtc1` does the same job as before: it copies the bits across unchanged. The
new instruction is **`cvt.s.w`**, *convert to single, from word*. The FPU
turns the word into the float with the same *value*. Read the suffixes from
right to left: "from `.w`, to `.s`". A whole family of conversion
instructions uses this naming, and you will see more of them soon.

Treat the three lines `mtc1`, `nop`, `cvt.s.w` as one unit that means **"an
integer became a float here."** In C this is a cast, `(f32)n`. It can also be
an `s32` used in float math, which C promotes to float without a cast. Both
ways of writing it compile to these three instructions.

When the integer being converted is *computed* instead of being a plain
argument, the integer work runs first, on the integer side. Then `mtc1` moves
its result across. That is the shape of the target: one integer operation,
then the three conversion instructions. The `.w` in `cvt.s.w` also points to
the opposite direction. Floats become integers through a different pair of
instructions, which is the next lesson.

## Your task

Write `func_80100514` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_80100514(s32 a, s32 b) {
    return (f32)(a - b);
}
```
