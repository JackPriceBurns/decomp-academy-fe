---
id: 73bf8222-000d-4a47-8bed-97dba50b19fc
slug: gba-loops-countdown
title: The Loop That Runs Backwards
difficulty: 3
concepts:
  - loops
  - strength-reduction
  - registers
hints:
  - Nothing in the body reads a counter, so gcc deleted it and counted the trip
    count itself down instead. The register being decremented is the bound, not
    a variable the source decremented.
  - The guard compares two registers, which means one of them is a local
    initialized to zero before the loop.
  - One `s32` in, `s32` out - an ordinary ascending `for` whose body adds a fixed
    amount to a running total, once per trip.
symbol: func_0817ca30
---

# The counter you will not find

Counting up to a bound needs the bound in a register and a compare against it
every trip. Counting down to zero needs neither: the decrement sets the flags
itself, and the test is against zero, so no register has to carry the bound. So
when nothing in the body reads the loop counter, gcc throws the counter away and
counts the trip count down instead.

This function transforms `x` a fixed number of times:

```asm
0        cmp       r1, #0
2        ble       14 ~>
4      ~>lsl       r0, #1
6        add       r0, #1
8        sub       r1, #1
10       cmp       r1, #0
12       bne       4 ~>
14     ~>bx        lr
```

The source counted `i` from 0 up to `n`. There is no `i` in the output. r1 is
the argument `n`, and it is being decremented to zero — the trip count has
become the counter. The body is two instructions, and it never mentions the
number of the iteration because the source never did either.

This is worth being precise about, because it is easy to read backwards. A
listing that decrements an argument register does not mean the C wrote `n--`.
The trip count is *the same number* either way, so gcc is free to consume the
argument as its counter, and it will.

Compare the guard here — `cmp r1, #0 / ble` — with the two-register form from
the previous lesson. This function has no zero-initialized local, so there was
no spare zero lying around and gcc compared the bound against an immediate
instead. The guard's shape tells you whether a local was initialized to zero
before the loop.

The `cmp r1, #0` at address 10 is the redundant one again: `sub` already set the
flags. It is in every countdown loop this compiler emits, and there is no C that
produces the shorter version, so do not go looking for one.

Your target has the same missing counter, and its guard is the other form.

## Your task

Write `func_0817ca30` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0817ca30(s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += 7;
    return t;
}
```
