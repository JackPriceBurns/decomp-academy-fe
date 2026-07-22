---
id: 10bf2507-2baf-52db-bc9e-a6f8700638b3
slug: control-clamp-low
title: Clamping to Zero, Branchlessly
difficulty: 2
concepts:
  - if
  - clamp
  - branchless
  - idiom
symbol: clamp_low
hints:
  - Clamping a signed value up to zero needs no branch.
  - Expect a sign mask via `srawi r0, r3, 31` then `andc r3, r3, r0`.
---

# A guard that compiles to no branch at all

An `if`/`else` usually means a comparison followed by a jump. Not always. MWCC
matches a handful of shapes and rewrites them as arithmetic, control flow and
all. The canonical one is clamping a signed value up against zero. Two
instructions, no `cmpwi`, no branch:

```asm
srawi r0, r3, 31   # arithmetic shift right 31: produces a sign mask in r0
andc  r3, r3, r0   # r3 = r3 AND (NOT r0)
blr
```

Start with `srawi r0, r3, 31`. It's an **arithmetic right shift by 31**.
Arithmetic shifts replicate the sign bit rather than feeding in zeros, so the
result is `0xFFFFFFFF` when `r3` was negative and `0` when it wasn't. `r0` now
holds a sign mask.

`andc rD, rA, rB` is the second half. It evaluates `rA AND (NOT rB)`. Hand it
an all-ones mask and the inversion becomes all-zeros, dragging the result down
to `0`. An all-zeros mask inverts to all-ones, and `rA` passes straight through.
So the mask decides which of the two you get.

Notice there's no test anywhere. That's the whole trick, and MWCC will only use
it when both arms of the original return something derived from the *same*
register. Swap the order of the branches and the spell breaks: write
`if (x >= 0) return x; return 0;` and you get a different sequence. The shape of
the source matters as much as what it computes.

## Your task

Write `clamp_low` to reproduce the assembly above.

<!-- solution -->
```c
int clamp_low(int x) {
    if (x < 0) return 0;
    return x;
}
```
