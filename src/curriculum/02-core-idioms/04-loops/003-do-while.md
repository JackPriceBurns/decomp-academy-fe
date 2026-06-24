---
id: loops-do-while
title: "Do-While: The Tightest Loop"
difficulty: 2
concepts:
  - do-while
  - control-flow
  - branch-elimination
symbol: sum
hints:
  - "`do { s += i; i++; } while (i < n);` puts the test at the bottom only."
  - There is no leading `b` — the body is entered directly, then the branch
    loops back.
  - "This is the canonical tight loop: body, compare, conditional branch."
---

# One branch, none wasted

A `do { } while ()` loop always runs its body **at least once**, so the compiler
doesn't need the pre-test. That leading `b test` from the `for`/`while` shape
*disappears*. What's left is the tightest possible loop: body, test, branch back
— a single conditional branch and nothing else:

```asm
li   r4, 0          # i = 0
li   r0, 0          # s = 0
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
cmpw r4, r3         # i < n ?
blt+ body           # only branch in the whole loop
mr   r3, r0
blr
```

Because this form is so clean, MWCC at full `-O4,p` is happy to leave it rolled —
no `#pragma` needed here. When you spot a loop with **no pre-test branch at the
top**, the original was almost certainly a `do`/`while` — or a loop where the
author had reason to guarantee the body would run.

> **A caution on semantics.** A `do`/`while` runs the body even when the guard
> is false on entry. For this sum that happens to be harmless — `n == 0` runs
> the body once (`s += 0`, `i` becomes 1), then `1 < 0` is false and we return
> 0, which is still correct, but only by accident of the arithmetic. In real
> decompilation you choose `do`/`while` only when you can confirm the loop is
> always entered at least once — often because a caller-side check guarantees
> `n` is positive. Don't reach for it just to drop the pre-test branch.

## Your task

Write `sum` as a `do`/`while` loop. Assume the body always runs at least once.

<!-- starter -->
```c
int sum(int n) {
    int i = 0, s = 0;
    // use a do/while loop
    return s;
}
```

<!-- solution -->
```c
int sum(int n) {
    int i = 0, s = 0;
    do {
        s += i;
        i++;
    } while (i < n);
    return s;
}
```
