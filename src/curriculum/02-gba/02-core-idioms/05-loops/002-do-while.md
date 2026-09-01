---
id: ef1b732c-5769-4b70-ad70-6fafb102564c
slug: gba-loops-do-while
title: A Loop With No Guard
difficulty: 2
concepts:
  - loops
  - control-flow
  - branches
hints:
  - Nothing branches forward past the body, so the body cannot be skipped. That
    rules out `while` and `for` and leaves one loop form.
  - The test at the bottom is against zero, and the body is what changes the
    value being tested.
  - One `s32` argument, `s32` back - count how many arithmetic right shifts by
    one it takes before the value reaches zero, counting the first shift always.
symbol: func_08173b48
---

# The loop that cannot be skipped

The guard from the last lesson is not free: it is a compare and a branch that
run on the way into every loop. A `do`/`while` does not need one. Its body runs
before anything is tested, so there is nothing to decide on entry, and the
compiler falls straight into the loop top.

That absence is a strong signal when you are reading. Two spellings of the same
accumulation:

```asm
0        mov       r2, #0
2      ~>add       r2, r0
4        add       r0, #2
6        sub       r1, #1
8        cmp       r1, #0
10       bne       2 ~>
12       mov       r0, r2
14       bx        lr
```

and

```asm
0        mov       r2, #0
2        cmp       r1, #0
4        ble       16 ~>
6      ~>add       r2, r0
8        add       r0, #2
10       sub       r1, #1
12       cmp       r1, #0
14       bgt       6 ~>
16     ~>mov       r0, r2
18       bx        lr
```

Same body, same result for a positive count, four bytes apart. The first is
`do { ... } while (--n);` and the second is the `while (n > 0)` version with an
`n--` at the end of the body. The `while` version has to consider the case where
it never runs at all, so it pays for a guard.

The bottom branch differs too. The `do`/`while` decrements first and tests the
new value against zero, so it loops back on `bne`. The guarded version tests
`n > 0`, a signed comparison, so it loops back on `bgt`. When the counter is
decremented and then compared against zero with `bne`, the source tested the
decremented value; when it is compared with `bgt` or `ble`, the source compared
against zero explicitly.

One more detail worth keeping: `sub r1, #1` already sets the flags, so the
`cmp r1, #0` on the next line changes nothing. gcc 2.9 emits it in every
countdown loop it builds. It is redundant and you have to match it anyway.

Your target has no forward branch anywhere before its body. Take that as a fact
about the source and work out what the single test at the bottom is watching.

## Your task

Write `func_08173b48` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08173b48(s32 n) {
    s32 c = 0;
    do {
        c++;
        n >>= 1;
    } while (n);
    return c;
}
```
