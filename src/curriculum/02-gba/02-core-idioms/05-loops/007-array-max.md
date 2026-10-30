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
    also used, so the value it is compared against is the running result.
  - An `s32 *` and an `s32` count in, `s32` out. It keeps a running maximum that
    starts at zero and is replaced whenever an element is larger.
symbol: func_0818a08c
---

# A branch in the body costs you the writeback

An `if` inside a loop body compiles to a forward branch that skips some code.
gcc evaluates the condition, inverts it, and branches forward over the
conditional instructions to the point where both paths meet. This point is the
merge point, and the loop machinery continues from there. So when you find the
target of that forward branch, you can split the body into "the conditional
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
`bge 16` jumps past the increment when the element is *not* negative. An `if` in
the body is always inverted like this. So read a forward `bge` as a `<` in the
source, a `bne` as a `==`, and so on.

Now look at address 16. The pointer advance is *at* the merge point, and the
load at 8 is a plain `ldr` instead of the load-multiple from the last lesson.
This is the third load-multiple condition failing. The forward branch splits the
body into two runs of instructions. The advance has to be on the path that both
of them take, so it is no longer next to the load, and gcc cannot combine the
two. So when a loop over a word array shows `ldr` plus a separate `add rP, #4`,
there is a branch in the body. You can tell this before you have read the
branch.

Everything else is the same as before. The guard still compares the accumulator,
which was set to zero, against the bound. The countdown still uses up the count
in r1.

Your target has the same structure, with one conditional instruction in the
body. Its compare is between two live values, instead of against an immediate.

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
