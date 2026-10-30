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
  - One `s32` argument and an `s32` return value. Count how many arithmetic right
    shifts by one it takes for the value to reach zero. The first shift always
    counts.
symbol: func_08173b48
---

# The loop that cannot be skipped

The guard from the last lesson has a cost. It is a compare and a branch, and
they run every time the program enters the loop. A `do`/`while` does not need a
guard. Its body runs before anything is tested, so there is nothing to decide on
entry. The code falls straight through into the loop top.

So a missing guard tells you a lot when you are reading. Here are two ways to
write the same accumulation:

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

Both have the same body and give the same result for a positive count. The
second is four bytes longer. The first is `do { ... } while (--n);`. The second
is the `while (n > 0)` version, with an `n--` at the end of the body. The
`while` version has to handle the case where the loop never runs at all, so it
needs a guard.

The branch at the bottom is different too. The `do`/`while` decrements first and
tests the new value against zero, so it loops back on `bne`. The guarded version
tests `n > 0`, which is a signed comparison, so it loops back on `bgt`. In
general, if the counter is decremented and then compared against zero with
`bne`, the source tested the decremented value. If it is compared with `bgt` or
`ble`, the source compared against zero explicitly.

One more detail to remember: `sub r1, #1` already sets the flags, so the
`cmp r1, #0` on the next line changes nothing. gcc 2.9 still emits that compare
in every countdown loop it builds. It is redundant, but you have to match it
anyway.

Your target has no forward branch anywhere before its body. Treat that as a fact
about the source. Then work out what the single test at the bottom is checking.

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
