---
id: loops-countdown
title: Counting Down Is Cheaper
difficulty: 2
concepts:
  - countdown
  - induction-variable
  - immediates
symbol: sum
hints:
  - Loop `for (; n > 0; n--)` and accumulate `s += n` — reuse `n` itself as the
    counter.
  - Counting down lets the test be `cmpwi r3, 0` instead of a register compare.
  - The decrement is `addi r3, r3, -1`; the test is `bgt+`.
---

# Compare against zero, not a bound

Counting *up* to `n` forces the loop test to compare the induction variable
against `n` — a register-to-register `cmpw`. Counting *down* to zero lets the
compiler compare against the constant 0 instead, using the immediate form
`cmpwi rA, 0`. There is no separate bound to keep live, so the loop is a touch
cheaper and the variable can double as both counter and value:

```asm
li   r0, 0          # s = 0
b    test
body:
add  r0, r0, r3     # s += n
addi r3, r3, -1     # n--
test:
cmpwi r3, 0         # n > 0 ?  (compare against immediate 0)
bgt+ body
mr   r3, r0
blr
```

This is why hand-tuned 2002 game code so often counts down: `cmpwi rX, 0` needs
no register for the limit. Recognizing a downward-counting loop and rewriting it
as `for (i = n; i > 0; i--)` is a common matching move.

> A count-down in the asm does **not** always mean the developer wrote one.
> Optimizing compilers will sometimes flip a count-up loop into count-down form
> for exactly this reason, so don't reflexively assume the source counted down —
> match what the asm shows, and reach for count-down in your own C only when it
> is what reproduces the target.

> `#pragma optimization_level 1` again keeps the loop from unrolling.

## Your task

Write `sum`, returning `n + (n-1) + ... + 1` by counting **down** from `n`.

<!-- starter -->
```c
#pragma optimization_level 1
int sum(int n) {
    int s = 0;
    // count down from n to 1
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int sum(int n) {
    int s = 0;
    for (; n > 0; n--) s += n;
    return s;
}
```
