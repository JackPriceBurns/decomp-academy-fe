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
  - "`mul` is destructive and takes two operands, so the copy before it protects
    the operand that `mul` would overwrite."
  - One `s32` in, `s32` out. It is a plain `for (i = 0; i < n; i++)` loop that
    adds the square of the counter to a total.
symbol: func_081782bc
---

# When the counter survives

A counted loop has two values it could test: the counter and the bound. Keeping
both live (held in registers for the whole loop) costs two registers, plus a
compare between two registers on every trip. gcc removes one of them whenever it
can, and the next lesson shows what happens when it does. This lesson covers the
case where it cannot: the body reads the counter, so the counter has to exist.

This function counts `i` from 0 up to `n` and adds `x - i` to a total each time:

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

Three values stay live across the whole loop: the accumulator in r3, the
counter in r2, and the bound in r1. The body is one subtract and one add. After
that comes the loop machinery, `add r2, #1 / cmp r2, r1 / blt`. These three
instructions (an increment, a compare against a register, and a branch back on
`blt`) are what a surviving counter looks like.

The push happens because of how many values are in use: the accumulator, the
counter, the bound, `x`, and a scratch register for `x - i`. That is five, and
only four low registers can be used without saving them first. gcc put the
scratch value in r0, which is where `x` arrived, so `x` had to move. With r1, r2
and r3 already taken, the only register left was a callee-saved one.
`mov r4, r0` at address 2 moves `x` there, and r4 has to be saved and restored
around the function. When a loop pushes r4 for no obvious reason, it is usually
moving an argument to a safe place so that its own body cannot overwrite it.

Look at the guard at 8: `cmp r3, r1`. It compares the accumulator against the
bound, instead of comparing the bound against zero. r3 was set to 0 at address
4, so the compiler already had a zero in a register and used it instead of
building another one. When a loop guard compares two registers like this, one of
them is a local that was initialized to zero.

Your target is a leaf function with no push, so nothing in its body needs
protecting. It still has a surviving counter. One instruction in its body is
there only to stop a destructive operation from overwriting its own input.

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
