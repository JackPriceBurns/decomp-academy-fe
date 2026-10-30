---
id: f70e5d6f-85ec-4bda-a1ed-9dd52e6a166f
slug: gba-control-clamp-low
title: A Floor
difficulty: 2
concepts:
  - branches
  - constants
  - control-flow
symbol: func_081470c0
hints:
  - There are two constants in four instructions, and they differ by one. The
    one moved into `r0` is the floor itself. The one in the `cmp` is the bound
    after the compiler changed it by one.
  - There is one `s32` argument and an `s32` result. Values that are already
    large enough are returned unchanged.
---

# The floor appears only on the path that needs it

Clamping from below is a guarded statement, so it has the simplest pattern in
the chapter: a compare, a skip, and one `mov` that runs only when the clamp
applies.

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        mov       r0, #0
6      ~>bx        lr
```

That is three instructions and a return. Nothing is computed on the common
path. A value that is already at or above the floor goes straight from the
compare to the `bx lr`, and `r0` is not changed. If you write the same clamp as
a ternary, with the variable itself as one of the arms, gcc emits the same four
rows. The arm that needs no work is already in `r0`, so there is nothing to
seed and nothing to join. The two ways of writing it stop giving the same code
once the floor is not zero, so check the compare constant before you rely on
this.

The floor does not have to be a constant:

```asm
0        cmp       r0, r1
2        bge       6 ~>
4        mov       r0, r1
6      ~>bx        lr
```

This is the same pattern, with the bound in a register. You read both versions
the same way. The value in the `mov` under the branch is the floor, because
that is what the variable becomes when it is too small.

When the floor is a constant other than zero, you will see the change of one
from the constants lesson, and it can mislead you. The number in the `cmp` and
the number in the `mov` are different, and only one of them is the floor. The
`cmp` constant was changed by one so that gcc could use its preferred
comparison. The `mov` constant is unchanged, because it is a value that gets
stored. Only comparison bounds are changed.

Your target clamps against a constant, so you can see both numbers in the
listing. Only one of them was written in the source.

## Your task

Write `func_081470c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081470c0(s32 x) {
    if (x < 10) x = 10;
    return x;
}
```
