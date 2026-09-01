---
id: 05d77615-b7fe-4b8c-af7f-9cfa56d10b13
slug: gba-loops-break
title: Leaving Early
difficulty: 4
concepts:
  - loops
  - control-flow
  - branches
hints:
  - Two different tests end this loop. One compares the counter against the
    bound and branches out; the other tests a loaded element and leaves by
    falling through the branch at the bottom.
  - The counter is incremented and compared rather than counted down, which
    happens when something after the loop still needs its value.
  - An `s32 *`, an `s32` count and an `s32` value in; `s32` out. Scan for the
    first element equal to the value, stop there, and hand back the position
    reached - which is the count when nothing matched.
symbol: func_08192f74
---

# Two ways out

A `break` is one more way out of a loop, and the loop's own test is another. So
a loop with a break has two points where control leaves the loop's address
range, and both of them arrive at the same instruction: the first one past the
loop. Count the ways out and you have counted the conditions in the source. Only
one of them needs a branch — gcc arranges the layout so the other is a
fall-through.

The simplest case has only the break. This loop reads words until it finds a
zero:

```asm
0        mov       r2, #0
2        b         6 ~>
4      ~>add       r2, r1
6      ~>ldmia     r0!, {r1}
8        cmp       r1, #0
10       bne       4 ~>
12       mov       r0, r2
14       bx        lr
```

`while (1)` compiles to no test at all, so the only exit is the break, and it
appears as the *fall-through* of `bne 4`. When the branch back to the top is
taken the loop continues; when it is not, control falls into address 12. A break
that ends up as the last test in a rotated loop costs zero extra instructions.

There is one load here, not two. The C named the element in a local before
testing it:

```c
s32 v = *a++;
if (v == 0)
    break;
```

`while (1)` dereferences nothing, so the body's own `*a++` is the only read in
the source, and one `ldmia` serves both the test and the accumulate. That is the
lever for the double-load shape you matched in the previous lesson: there the
loop condition read through the pointer and the body read through it again, and
each read got its own load. When the number of loads in a listing does not match
the number of reads you wrote, look at the loop condition first.

Your target is a counted loop with a break in it, so both exits are present, and
one register keeps counting up rather than down. Something at the exit label
still wants that value.

## Your task

Write `func_08192f74` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08192f74(s32 *a, s32 n, s32 v) {
    s32 i;
    for (i = 0; i < n; i++) {
        if (a[i] == v)
            break;
    }
    return i;
}
```
