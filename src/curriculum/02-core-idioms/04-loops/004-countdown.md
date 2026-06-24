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
cheaper and the variable can double as both counter and value.

Here is an example: `countdown_ex(m)` counts `m` down to 1 and accumulates
double each value. The key insight is that `r3` (the parameter `m`) is used as
both the accumulator index *and* the loop counter — no separate `i` variable
needed:

```asm
li   r4, 0          # s = 0
b    test
body:
slwi r0, r3, 1      # m * 2
addi r3, r3, -1     # m--
add  r4, r4, r0     # s += m * 2
test:
cmpwi r3, 0         # m > 0 ?  (compare against immediate 0)
bgt+ body
mr   r3, r4
blr
```

This is why hand-tuned 2002 game code so often counts down: `cmpwi rX, 0` needs
no register for the limit. For `sum` your body is simpler — there's no multiply
— but the loop skeleton (pre-test `b`, decrement with `addi r3,r3,-1`, and
`cmpwi r3,0`) is the same shape.

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
