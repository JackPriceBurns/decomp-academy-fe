---
id: control-short-circuit
title: Short-Circuit && and ||
difficulty: 3
concepts:
  - boolean
  - short-circuit
  - branch
  - logic
symbol: both_positive
hints:
  - "`&&` short-circuits: a failing first test skips the second compare."
  - Expect two `cmpwi ..., 0` with a `ble-` after each jumping to the false exit.
---

# Two compares, lazily evaluated

C's `&&` and `||` are **short-circuit**: the second operand is only evaluated if
the first didn't already decide the answer. That laziness shows up directly as
*two separate compares with branches between them*.

With `&&`, the *first* failing test jumps straight to the false exit — the
second operand is skipped. Here is a `&&` function that tests whether both
arguments are negative:

```asm
# both_negative(int a, int b): return 1 if a < 0 && b < 0
cmpwi r3, 0
bge-  .false     # a >= 0 -> whole && is false, skip the b test
cmpwi r4, 0
bge-  .false     # b >= 0 -> false
li    r3, 1      # both passed
blr
.false:
li    r3, 0
blr
```

`||` inverts the logic: the first *passing* test jumps to the true exit. Here
is a `||` function that tests whether either argument is at least 10:

```asm
# either_large(int a, int b): return 1 if a >= 10 || b >= 10
cmpwi r3, 10
bge-  .true      # a >= 10 -> short-circuit, the || is already true
cmpwi r4, 10
blt-  .false     # last test still gates: b < 10 -> false
.true:
li    r3, 1
blr
.false:
li    r3, 0
blr
```

Note only the *early* operand jumps to true on success; the final compare still
falls through to the true path and branches to false on failure. Counting the
compares and reading which branch each one takes reconstructs the exact
`&&`/`||` expression.

## Your task

Write `both_positive`: return `1` if both arguments satisfy a positive condition, otherwise `0`.

<!-- starter -->
```c
int both_positive(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int both_positive(int a, int b) {
    if (a > 0 && b > 0) return 1;
    return 0;
}
```
