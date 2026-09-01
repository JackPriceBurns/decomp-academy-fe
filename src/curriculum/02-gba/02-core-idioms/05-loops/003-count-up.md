---
id: 286b8108-5358-4192-b0de-a0e291ed383d
slug: gba-loops-count-up
title: Counting Up
difficulty: 3
concepts:
  - loops
  - registers
  - strength-reduction
hints:
  - The counter is the register that starts at zero, gains one per trip and is
    compared against the bound at the bottom. Everything else in the body is
    built from it.
  - "`mul` is destructive and two-operand, so the copy before it is there to
    protect the operand it would overwrite."
  - One `s32` in, `s32` out - a plain `for (i = 0; i < n; i++)` accumulating the
    square of the counter.
symbol: func_081782bc
---

# When the counter survives

A counted loop has two candidate values to test against: the counter and the
bound. Keeping both live costs two registers and a register-to-register compare
every trip. gcc will get rid of one of them whenever it can, and the next lesson
is about what happens when it does. First, the case where it cannot: the body
reads the counter, so the counter has to exist.

This function walks `i` from 0 up to `n` and adds `x - i` each time:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r3, #0
6        mov       r2, #0
8        cmp       r3, r1
10       bge       22 ~>
12     ~>sub       r0, r4, r2
14       add       r3, r0
16       add       r2, #1
18       cmp       r2, r1
20       blt       12 ~>
22     ~>mov       r0, r3
24       pop       {r4}
26       pop       {r1}
28       bx        r1
```

Three values live across the whole loop: the accumulator in r3, the counter in
r2, and the bound in r1. The body is one subtract and one add, and then the loop
machinery is `add r2, #1 / cmp r2, r1 / blt`. That trio — increment, compare
against a register, branch back on `blt` — is what a surviving counter looks
like.

The push is a consequence of how many values are in play: the accumulator, the
counter, the bound, `x`, and a scratch register for `x - i`. That is five, and
only four low registers are free to use without saving. gcc put the scratch in
r0, which is where `x` arrived, so `x` had to move, and with r1, r2 and r3
already taken the only seat left was a callee-saved one. `mov r4, r0` at address
2 moves it there, and r4 has to be saved and restored around the function. A
loop that pushes r4 for no obvious reason is usually holding an argument out of
reach of its own body.

Look at the guard at 8: `cmp r3, r1`, comparing the accumulator against the
bound rather than comparing the bound against zero. r3 was just set to 0 on line
4, so the compiler already had a zero in a register and used it instead of
building another one. When a loop guard compares two registers like that, one of
them is a local that happens to have been initialized to zero.

Your target is a leaf function with no push, so nothing in its body needs
protecting. It still has a surviving counter, and one instruction in the body is
there purely to keep a destructive operation from eating its own input.

## Your task

Write `func_081782bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081782bc(s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += i * i;
    return t;
}
```
