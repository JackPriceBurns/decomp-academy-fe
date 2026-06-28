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

# A ladder of tests

An `if` / `else if` / `else` chain is just a ladder. Each rung, a compare. Fail
it and you're on the next rung down. First rung to hold wins and returns; the
final `else` catches whatever nothing else matched. Assembly keeps that shape
almost verbatim, one compare after another, each jumping past the body it guards.

Take `temp_zone(t)`, three bands and three answers, `5`, `3`, or `1`.

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

Top rung's the easy one. Compare holds, out you go through `blr`. The middle
rung is sneakier. MWCC stashes the bottom band's value before testing anything,
then `bltlr-` flings it back the moment the input drops under 20. Doesn't drop?
You land on the middle band's `li`. One compare, one early exit, two bands
covered.

Those answers, `5`, `3`, `1`, sit at uneven gaps on purpose. Give MWCC an even
run and it might throw the branches away and compute the thing outright. Lumpy
values keep the compare-per-rung shape you see above. So take the rungs one at a
time. Each compare-and-branch pair tells you the threshold, and which band falls
on which side.

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
