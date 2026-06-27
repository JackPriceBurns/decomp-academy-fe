---
id: control-nested-ladder
title: The if / else-if Ladder
difficulty: 2
concepts:
  - if-else
  - nested
  - branch
  - combining
symbol: size_class
hints:
  - Each rung is its own `cmpwi`; failing one falls through to the next.
  - A middle rung can collapse to `li` + `bltlr-`/`blelr-` (a conditional return).
---

# Falling down a ladder of tests

An `if` / `else if` / `else` chain is a **ladder**: each rung is a compare, and
failing it drops you to the next rung. The first rung that holds returns; the
final `else` is whatever's left after every test failed. In assembly this is a
straight run of compares, each branching past the rung's body.

Consider `temp_zone(t)`, returning `5`, `3`, or `1` for three temperature bands:

```asm
cmpwi r3,30        # top rung
blt-  .next        # below 30 -> drop to the next rung
li    r3,5         # >= 30: top band
blr
.next:
cmpwi r3,20        # middle rung
li    r3,1         # speculative: the bottom band
bltlr-             # below 20 -> return the bottom band now
li    r3,3         # otherwise the middle band
blr
```

The first rung exits with its own `blr` when it holds. The middle rung is
tidier: MWCC speculatively loads the *bottom* band's value, and `bltlr-` returns
it immediately if the value falls below 20 — otherwise execution falls through
to the middle band's `li`. One compare, one conditional return, two outcomes.

Notice the return values here (`5`, `3`, `1`) are deliberately *not* evenly
spaced. When a ladder's outputs form a neat arithmetic run, MWCC sometimes
replaces the branches with arithmetic; irregular outputs keep the honest
compare-per-rung shape you see above. Read each rung's compare and branch to
recover the threshold and which band sits on each side.

## Your task

Write `size_class`, taking one `int`, to reproduce the assembly above.

<!-- starter -->
```c
int size_class(int n) {
    return 0;
}
```

<!-- solution -->
```c
int size_class(int n) {
    if (n > 1000) return 100;
    else if (n > 100) return 10;
    else return 1;
}
```
