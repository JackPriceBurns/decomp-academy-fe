---
id: control-guard
title: The Guard Clause / Early Return
difficulty: 3
concepts:
  - if
  - early-return
  - branch
  - guard
symbol: safe_div
hints:
  - A guard clause keeps a real branch when the arms do different work.
  - Expect `cmpwi r4, 0`, `bne-`, a `li r3, -1` bailout, then `divw`.
---

# Bailing out before the real work

A **guard clause** tests a precondition up front and returns early, so
everything past it can take that condition for granted. The two arms here do
genuinely different work. One hands back a constant, the other runs a
calculation. That gap is why MWCC keeps an actual branch instead of folding it
away.

```asm
cmpwi r4, 0       # test the second argument
bne-  .body       # skip the early-return block if not equal
li    r3, -1      # early-return path
blr
.body:
divw  r3, r3, r4  # main computation
blr
```

The giveaway is the pair of `blr` instructions, one exit per arm. Sitting right
after the branch is the guard body, inline, while the main path waits over at
the `bne-` target. See a single compare whose taken branch leaps *over* a short
return block and you're looking at an early-return guard.

Reading it is mechanical. Find the register under test and the value it meets in
`cmpwi r4, 0`. Watch `bne-` jump *past* the inline return when that register is
non-zero. Then check what runs at the target, here a `divw`. The sentinel `li`
and the computation after the label are both right there in the listing.

## Your task

Write `safe_div`, taking two `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int safe_div(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int safe_div(int a, int b) {
    if (b == 0) return -1;
    return a / b;
}
```
