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
*two separate compares with branches between them*. For `a > 0 && b > 0`:

```asm
cmpwi r3, 0
ble-  .false     # a <= 0 -> whole && is false, skip the b test
cmpwi r4, 0
ble-  .false     # b <= 0 -> false
li    r3, 1      # both passed
blr
.false:
li    r3, 0
blr
```

With `&&`, the *first* failing test jumps straight to the false exit — `b` is
never compared when `a <= 0`. `||` inverts the logic: the first *passing* test
jumps to the true exit. The same `a > 0 || b > 0` compiles to:

```asm
cmpwi r3, 0
bgt-  .true      # a > 0 -> short-circuit, the || is already true
cmpwi r4, 0
ble-  .false     # last test still gates: b <= 0 -> false
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

Write `both_positive`: return `1` if `a > 0` **and** `b > 0`, otherwise `0`.

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
