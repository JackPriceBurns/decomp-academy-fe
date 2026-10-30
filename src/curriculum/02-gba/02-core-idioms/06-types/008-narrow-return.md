---
id: d1eceb95-02f8-4c5e-9dad-a06acc391020
slug: gba-types-narrow-return
title: Narrowing on the Way Out
difficulty: 3
concepts:
  - narrow-types
  - return-values
  - constants
symbol: func_081d17cc
hints:
  - Work out the number that the `mov` and `lsl` build together. Then divide it
    by 65536 to get the constant written in the C.
  - "The function takes one `s16` and returns an `s16`. It does a single
    addition."
---

# Truncating before the return

A function whose return type is narrower than a word still returns a whole
register, and the callee is responsible for making the low bits correct. So a
narrow return type shows up as a shift pair at the very end, just before the
return branch:

```asm
0        sub       r0, r1
2        lsl       r0, #16
4        asr       r0, #16
6        bx        lr
```

The subtraction happens at full width. Then `lsl #16` / `asr #16` keeps 16 bits
and copies the sign bit into the top half. You read it the same way as before:
the count gives the width, and the second mnemonic gives the signedness of the
return type.

Something different happens when the value being returned is *already* narrow.
The result will be truncated again at the end, so the extension at the start
that you saw in the last lesson has no effect. gcc leaves it out, and does the
arithmetic in the top of the register instead:

```asm
0        lsl       r0, #24
2        mov       r1, #128
4        lsl       r1, #17
6        add       r0, r1
8        lsr       r0, #24
10       bx        lr
```

This function takes a `u8` argument, adds one, and returns a `u8`. The value is
shifted to the top of the register at the start, so the constant has to be
shifted too. Adding 1 to a byte held in bits 24-31 means adding 1 << 24, which
is 16777216. Here it is built as 128 << 17. The final `lsr #24` truncates the
value and moves it back down in a single instruction.

So the pattern tells you where the work happened. A single `lsl` at the start
and one matching shift at the end mean the compiler kept the value in the top of
the register the whole time. Any constant in the middle has been shifted up by
the same amount. To get the original constant back, shift it down by the amount
the value was shifted up.

Your target also does its work in the top of the register, sixteen bits wide.
Work out the constant in the middle before you write anything.

## Your task

Write `func_081d17cc` to reproduce the target assembly.

<!-- solution -->
```c
s16 func_081d17cc(s16 v) {
    return v + 100;
}
```
