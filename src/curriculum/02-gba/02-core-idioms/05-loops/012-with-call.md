---
id: 59b12ccd-e15b-4732-98d2-9273d04390cd
slug: gba-loops-with-call
title: Calling From a Loop
difficulty: 4
concepts:
  - loops
  - calling-convention
  - registers
hints:
  - Every value the loop carries across the `bl` had to move to a callee-saved
    register first. Three of them are pushed, so three things survive the call -
    the cursor, the countdown, and the result being built.
  - The loaded element goes straight into r0, which is the first argument
    register, and the value coming back in r0 is what gets accumulated.
  - An `s32 *` and an `s32` count in, `s32` out - each element is passed through
    `Adjust` and the returned values are summed.
symbol: func_081a05d0
---

# The call that empties your registers

A `bl` destroys r0 through r3 and lr. Anything the loop needs on the next trip
has to be somewhere the callee is obliged to preserve, which means r4 through
r7, which means pushing them. So the push list of a calling loop is a direct
count of how many values the loop carries.

Here is a loop that hands each element of a halfword array to a function:

```asm
0        push      {r4, r5, lr}
2        cmp       r1, #0
4        ble       24 ~>
6        mov       r4, r0
8        mov       r5, r1
10     ~>ldrh      r0, [r4, #0]
12       bl        Notify-4
16       add       r4, #2
18       sub       r5, #1
20       cmp       r5, #0
22       bne       10 ~>
24     ~>pop       {r4, r5}
26       pop       {r0}
28       bx        r0
```

Two values cross the call — the cursor and the countdown — so both arguments are
copied out of r0 and r1 into r4 and r5 before the loop starts, and the push list
is `{r4, r5, lr}`. lr is in there because the `bl` overwrites it with the return
address of the *callee*, which would otherwise destroy the way back to this
function's own caller.

Two rendering details. The `bl` is a 32-bit instruction, so the addresses step
by 4 across it rather than 2 — 12 to 16. And an undefined callee prints as
`Notify-4`: the `-4` is the relocation addend the linker will fix up, not part
of the name. Nothing in your C is called `Notify-4`.

The epilogue pops lr into r0 and returns with `bx r0`, because this function
returns nothing and r0 is free. A loop that returns a value pops into r1
instead, since r0 is carrying the result. Reading which register the epilogue
pops into tells you whether anything is handed back, before you have read a line
of the body.

A `bl` in the body does not cost you the load-multiple the way a branch in the
body does. The cursor sits in a callee-saved register and comes back from the
call untouched, so a word-sized walk keeps its `ldmia rN!, {rX}` with a call in
the middle of the loop. This example walks halfwords, which is why it pays for
its advance separately.

Your target calls `Adjust`, declared for you, and pushes one register more than
this one.

## Your task

Write `func_081a05d0` to reproduce the target assembly.

<!-- context -->
```c
s32 Adjust(s32 x);
```

<!-- solution -->
```c
s32 func_081a05d0(s32 *a, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += Adjust(a[i]);
    return t;
}
```
