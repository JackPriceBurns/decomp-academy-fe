---
id: 5852636c-f0ed-5432-8205-c61d126a0700
slug: loops-do-while
title: "Do-While: The Tightest Loop"
difficulty: 2
concepts:
  - do-while
  - control-flow
  - branch-elimination
symbol: func_8021498c
hints:
  - "`do { s += i; i++; } while (i < n);` puts the test at the bottom only."
  - There is no leading `b` — the body is entered directly, then the branch
    loops back.
  - "This is the canonical tight loop: body, compare, conditional branch."
---

# One branch, none wasted

Run a `do { } while ()` and the body always executes **at least once**, which
means the compiler can skip the pre-test entirely. The leading `b test` you saw
in the `for`/`while` shape just *disappears*. What's left is the leanest loop
there is — body, test, a branch back. One conditional jump carries the whole
thing.

Below, `squares(n)` sums 1 through `n` as a `do`/`while`. No pre-test branch
this time; the body fires straight away and the compare shows up only at the
very bottom:

```asm
li   r4, 1          # i = 1
li   r0, 0          # s = 0
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
cmpw r4, r3         # i <= n ?
ble+ body           # only branch in the whole loop
mr   r3, r0
blr
```

The shape is clean enough that MWCC at full `-O4,p` leaves it rolled on its
own, so this one needs no optimization adjustment. Run into a loop with **no
pre-test branch at the top** and you're almost surely looking at a `do`/`while`
— or at least a loop whose author knew the body would always run. Remember,
`func_8021498c` kicks its induction variable off at 0 rather than 1, which
pushes its initializer and test away from what this example shows.

> **A caution on semantics.** A `do`/`while` runs its body even when the guard
> is already false at entry. Here that's harmless luck: with `n == 0` the body
> runs once (`s += 0`, and `i` becomes 1), `1 < 0` then fails, and we hand back
> 0 — right purely by accident of the arithmetic. When you actually decompile,
> reach for `do`/`while` only once you can prove the loop is always entered,
> often thanks to a caller-side check that keeps `n` positive. Dropping the
> pre-test branch is never reason enough on its own.

## Your task

Write `func_8021498c` to reproduce the target assembly, expressed as a
`do`/`while` loop.

<!-- solution -->
```c
int func_8021498c(int n) {
    int i = 0, s = 0;
    do {
        s += i;
        i++;
    } while (i < n);
    return s;
}
```
