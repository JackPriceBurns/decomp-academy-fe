---
id: 5f5bab48-1499-47db-b062-fdb55f0eed2f
slug: gba-memory-null-check
title: Checking for NULL
difficulty: 3
concepts:
  - pointers
  - branches
  - control-flow
symbol: func_0821d680
hints:
  - There are two paths to the `bx lr` and only one of them touches memory.
    The other one has to put something in `r0` by hand.
  - It takes an `s32 *` and an `s32`, and returns an `s32`. The `beq` is taken
    when the pointer is zero, and it lands on the arm that never touches memory.
    So the `if` in the C tests for null, and that arm is its body.
---

# A pointer is a number like any other

`NULL` is zero, and a pointer is held in an ordinary register. So testing a
pointer uses the same `cmp rB, #0` you would write for an integer. There is no
special instruction and no special flag. The rules from the branch chapter
apply unchanged.

```asm
0        cmp       r0, #0
2        beq       6 ~>
4        str       r1, [r0, #0]
6      ~>bx        lr
```

The compiler branches when the condition is *false*. So a test for "pointer is
set" compiles to a `beq` that jumps over the body. The branch lands on the
function's own return. A guarded body that does nothing else needs no second
exit, because skipping the store is all the else case does.

`p != NULL`, `p`, and `!(p == NULL)` are the same C to this compiler, and all
three produce that listing. The way you write the test can only change the
branch condition, and only when you invert the test.

The case to study is when both paths have to produce a value. Then the guard
cannot skip straight to the return. The arm that runs has to jump over the arm
that does not run, so you get an unconditional `b` in the middle of the
function between them. Both arms end at the same `bx lr`.

When the arms are laid out like this, gcc decides which one comes first. The
branch condition follows that layout, not the order you wrote the C in. So
check where the branch lands before you decide which way the test ran.

Your target has two paths to its return, and only one of them touches memory.

## Your task

Write `func_0821d680` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0821d680(s32 *p, s32 fallback) {
    if (p == NULL) return fallback;
    return *p;
}
```
