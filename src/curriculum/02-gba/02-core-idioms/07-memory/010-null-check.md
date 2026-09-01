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
  - An `s32 *` and an `s32` in, an `s32` out. The `beq` is taken when the
    pointer is zero and it lands on the arm that never touches memory, so the
    `if` in the C tests for null and that arm is its body.
---

# A pointer is a number like any other

`NULL` is zero, and a pointer sits in an ordinary register, so testing one is
the same `cmp rB, #0` you would write for an integer. There is no special
instruction and no special flag; the branch chapter's rules apply unchanged.

```asm
0        cmp       r0, #0
2        beq       6 ~>
4        str       r1, [r0, #0]
6      ~>bx        lr
```

The compiler branches on the condition being *false*, so a test for "pointer
is set" compiles to `beq` jumping over the body. The branch lands on the
function's own return, because a guarded body that does nothing else needs no
second exit — skipping the store is the whole of the else case.

`p != NULL`, `p`, and `!(p == NULL)` are the same C to this compiler and all
three produce that listing. The only thing the spelling can change is the
branch condition, and only when you invert the test.

Where it gets interesting is when both paths have to produce a value. Then the
guard cannot simply skip forwards to the return: the arm that runs has to jump
over the arm that does not, and you get an unconditional `b` in the middle of
the function separating them. Both arms end up landing on the same `bx lr`.

Once the arms are laid out that way, which one gcc puts first is its own
decision, and the branch condition follows that layout rather than the order
you wrote the C in. So read where the branch lands before you decide which way
the test ran.

Your target has two routes to its return, and only one of them goes anywhere
near memory.

## Your task

Write `func_0821d680` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0821d680(s32 *p, s32 fallback) {
    if (p == NULL) return fallback;
    return *p;
}
```
