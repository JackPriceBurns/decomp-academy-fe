---
id: 8de38c7c-0328-4bf1-aef0-2d5e5af56c6f
slug: gba-types-narrow-argument
title: A Narrow Argument Arrives Wide
difficulty: 3
concepts:
  - narrow-types
  - calling-convention
  - sign-extension
symbol: func_081cd058
hints:
  - There are two shift pairs at the very top, one on `r0` and one on `r1`. This
    means both parameters are narrow. The shift count gives the width, and the
    second mnemonic gives the signedness.
  - The function takes two `u8` parameters and returns an `s32`. It does one
    subtraction between them.
---

# The callee widens its own arguments

An argument narrower than a word is still passed in a full 32-bit register. The
ABI makes no promise about the bits above the value. So if the callee needs
those bits to be correct, it has to set them itself. That is why so many agbcc
functions start with shifts before they do any other work.

This is the same shift pair you have seen after loads, but here it is applied to
a value that is already in a register. In this example a `u8` is passed as the
second argument:

```asm
0        lsl       r1, #24
2        lsr       r1, #24
4        add       r0, r1
6        bx        lr
```

`lsl #24` removes everything above bit 7. `lsr #24` moves the byte back down and
fills the top with zeros. Only then is the value added. Here is an `s16` passed
as the first argument instead:

```asm
0        lsl       r0, #16
2        asr       r0, #16
4        add       r0, r1
6        bx        lr
```

A shift pair at the start of a function tells you three things. The register
tells you which parameter it is: `r0`, `r1`, `r2` and `r3`, in order. The shift
count tells you how wide the type is, because the count is 32 minus the width.
The second mnemonic tells you the signedness. `lsr` fills with zeros for an
unsigned type, and `asr` copies the sign bit for a signed one.

Parameters that are already 32 bits wide need no shifts. So a shift pair at the
start of a function is a sure sign of a narrow parameter. Count the pairs and
note their registers. That tells you most of the signature.

Read the start of your target the same way, one register at a time.

## Your task

Write `func_081cd058` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081cd058(u8 a, u8 b) {
    return a - b;
}
```
