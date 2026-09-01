---
id: f8bf32a0-d093-4a92-8070-1d97fa2f949a
slug: gba-numbers-float-constant
title: A Float Constant in the Pool
difficulty: 3
concepts:
  - floating-point
  - literal-pool
  - constants
symbol: func_0829eea4
hints:
  - Decode the pool word before anything else. 1120403456 is 0x42C80000 — sign
    0, exponent 0x85, mantissa 0x480000.
  - "One `f32` in, an `f32` out. 1120403456 is 100.0f, and it is loaded once
    into `r4` because both calls want it."
---

# Reading a number out of the text

Thumb cannot put a 32-bit value in an instruction. An 8-bit immediate is all
you get, so every float literal in a program has to be stored somewhere and
loaded. gcc stores it in the function itself: the raw IEEE-754 bit pattern is
emitted as a `.word` in the middle of `.text`, and a PC-relative `ldr` fetches
it.

```asm
0        push      {lr}
2        ldr       r1, [pc, #8] (->12)
4        bl        __addsf3-4
8        pop       {r1}
10       bx        r1
12       .word     1075838976
```

The workspace prints pool words in decimal, so recovering the literal is a
three-step conversion you will do hundreds of times. 1075838976 in hex is
0x40200000. Split that into IEEE-754 fields:

- sign bit 0, so positive;
- exponent byte 0x80 = 128, and the bias is 127, so the value is scaled by
  2^1 = 2;
- mantissa 0x200000 out of 0x800000 = 0.25, and the leading 1 is implicit, so
  the significand is 1.25.

1.25 x 2 = 2.5. The literal was `2.5f`. A few of these are worth memorising
outright, because they turn up constantly: 0x3F800000 is 1.0f, 0x3F000000 is
0.5f, 0x40000000 is 2.0f, 0xBF800000 is -1.0f, and 0 is 0.0f.

The pool does not always sit at the end. It goes wherever gcc can reach it,
including the middle of the body:

```asm
0        push      {lr}
2        ldr       r1, [pc, #12] (->16)
4        bl        __gtsf2-4
8        cmp       r0, #0
10       bgt       20 ~>
12       mov       r0, #0
14       b         22 ~>
16       .word     0
20     ~>mov       r0, #1
22     ~>pop       {r1}
24       bx        r1
```

The `.word 0` at address 16 sits between a branch and its destination. It is
data, not an instruction, and it sits there because the unconditional `b` at 14
leaves a gap that control cannot fall into — the cheapest place gcc has to park
a word.
Note what that zero costs, too: comparing a float against a literal `0` still
needs a pool word of 0.0f and a full helper call. There is no compare-to-zero
shortcut when there is no hardware to shortcut with.

One more habit to recognise. A literal used twice is emitted **once** and kept
in a callee-saved register between uses — which is why a function with a single
constant in it can end up pushing `r4` for no visible reason. That is what your
target does.

## Your task

Write `func_0829eea4` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_0829eea4(f32 x) {
    return (x + 100.0f) * 100.0f;
}
```
