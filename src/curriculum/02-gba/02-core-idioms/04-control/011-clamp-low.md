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
  - Two constants in four instructions, one apart. The one that gets moved into
    `r0` is the floor itself; the one in the `cmp` is the compiler's nudged
    bound.
  - One `s32` argument and an `s32` result. Values that are already large enough
    pass through untouched.
---

# The floor only exists on the path that needs it

Clamping from below is a guarded statement, so it gets the plainest shape in the
chapter: compare, skip, and one `mov` that runs only when the clamp bites.

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        mov       r0, #0
6      ~>bx        lr
```

Three instructions and a return. Nothing is computed on the common path — a
value that is already at or above the floor walks straight from the compare to
the `bx lr` with `r0` untouched. Write this same clamp as a ternary, with the
variable itself as one of the arms, and gcc emits these same four rows — the arm
that needs no work is already in `r0`, so there is nothing to seed and nothing
to join. The two spellings stop agreeing as soon as the floor stops being zero,
so check the compare constant before you lean on it.

The floor does not have to be a constant:

```asm
0        cmp       r0, r1
2        bge       6 ~>
4        mov       r0, r1
6      ~>bx        lr
```

Identical shape with the bound in a register. The tell is the same in both: the
value that appears in the `mov` under the branch is the floor, because that is
what the variable becomes when it is too small.

When the floor is a constant other than zero, the off-by-one from the constants
lesson shows up in a way that is easy to misread — the number in the `cmp` and
the number in the `mov` are different, and only one of them is the floor. The
`cmp` constant has been nudged so gcc could use its preferred relation; the
`mov` constant is untouched, because it is data rather than a comparison bound.

Your target clamps against a constant, so both numbers are sitting there in
front of you. Only one of them was written in the source.

## Your task

Write `func_081470c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081470c0(s32 x) {
    if (x < 10) x = 10;
    return x;
}
```
