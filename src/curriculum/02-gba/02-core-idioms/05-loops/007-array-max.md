---
id: 8bd84ed2-3ba5-4cf5-b662-426993f08d63
slug: gba-loops-array-max
title: A Comparison Inside the Loop
difficulty: 3
concepts:
  - loops
  - branches
  - arrays
hints:
  - The conditional part of the body is the single instruction between the `ble`
    and the address it branches to. Everything from that address down is loop
    machinery.
  - The compare is between the loaded element and the register that the guard
    also used, so the thing being compared against is the running result.
  - An `s32 *` and an `s32` count in, `s32` out - a running maximum starting from
    zero, replaced whenever an element beats it.
symbol: func_0818a08c
---

# A branch in the body costs you the writeback

An `if` inside a loop body compiles to a skip. gcc evaluates the condition,
inverts it, and branches forward over the conditional instructions to the point
where both paths meet. The merge point is where the loop machinery resumes, so
finding the target of that forward branch splits the body into "the conditional
part" and "the part that always runs".

Here is a loop that counts the negative elements of an array:

```asm
0        mov       r3, #0
2        cmp       r3, r1
4        bge       24 ~>
6        mov       r2, r0
8      ~>ldr       r0, [r2, #0]
10       cmp       r0, #0
12       bge       16 ~>
14       add       r3, #1
16     ~>add       r2, #4
18       sub       r1, #1
20       cmp       r1, #0
22       bne       8 ~>
24     ~>mov       r0, r3
26       bx        lr
```

The source condition is `a[i] < 0`, and the assembly tests the opposite:
`bge 16` jumps past the increment when the element is *not* negative. That
inversion is universal for a body-level `if`, so read a forward `bge` as a
source-level `<`, a `bne` as a `==`, and so on.

Now look at address 16. The pointer advance sits *at* the merge point, and the
load at 8 is a plain `ldr` rather than the load-multiple from the last lesson.
That is the third of the load-multiple's conditions breaking: the forward branch
splits the body into two runs of instructions, the advance has to sit on the
path both of them take, and once it is no longer beside the load gcc cannot fold
the two together. A word-array loop showing `ldr` plus a separate `add rP, #4`
is telling you there is a branch in the body, before you have read the branch.

Everything else is unchanged: the guard still compares the zeroed accumulator
against the bound, and the countdown still consumes the count in r1.

Your target has the same skeleton with one conditional instruction in the body,
and its compare is between two live values rather than against an immediate.

## Your task

Write `func_0818a08c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0818a08c(s32 *a, s32 n) {
    s32 i;
    s32 m = 0;
    for (i = 0; i < n; i++)
        if (a[i] > m)
            m = a[i];
    return m;
}
```
