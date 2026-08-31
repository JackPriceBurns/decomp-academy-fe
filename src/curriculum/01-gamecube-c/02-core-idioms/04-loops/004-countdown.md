---
id: a054eebf-1774-5033-8c6f-9e5ed5ef544d
slug: loops-countdown
title: Counting Down Is Cheaper
difficulty: 2
concepts:
  - countdown
  - induction-variable
  - immediates
symbol: func_800153b8
hints:
  - Loop `for (; n > 0; n--)` and accumulate `s += n` — reuse `n` itself as the
    counter.
  - Counting down lets the test be `cmpwi r3, 0` instead of a register compare.
  - The decrement is `subi r3, r3, 1`; the test is `bgt+`.
---

# Compare against zero, not a bound

Why should the direction of a loop matter to the compiler? Count *up* toward
`n` and the test has to weigh the induction variable against `n` — a
register-to-register `cmpw`. Count *down* toward zero instead and it can weigh
against a flat constant 0 through the immediate form `cmpwi rA, 0`. No register
sits around holding the bound. That trims the loop slightly, and it lets a
single variable be both the counter and the value.

Take `countdown_ex(m)`, which walks `m` down to 1 while piling up double of
each value. What makes it tick is `r3`, the parameter `m`, pulling double duty
as the accumulator index *and* the loop counter, so there's no separate `i` to
carry:

```asm
li   r4, 0          # s = 0
b    test
body:
slwi r0, r3, 1      # m * 2
subi r3, r3, 1      # m--
add  r4, r4, r0     # s += m * 2
test:
cmpwi r3, 0         # m > 0 ?  (compare against immediate 0)
bgt+ body
mr   r3, r4
blr
```

That's why heaps of hand-tuned 2002 game code counts down: `cmpwi rX, 0` spends
no register on a limit. Your `func_800153b8` runs a plainer body, no multiply
anywhere. The surrounding loop keeps the bones you already know: a pre-test
`b`, a decrement through `subi r3,r3,1`, and a `cmpwi r3,0`.

> Seeing a count-down in the asm does **not** prove the developer wrote one.
> Optimizers will quietly rewrite a count-up loop into count-down form for this
> very reason. Don't assume the source counted down just because the asm does.
> Follow what the asm puts in front of you, and use count-down in your own C
> only where it's what reproduces the target.

> And `#pragma optimization_level 1` is back again, keeping the loop from
> unrolling.

## Your task

Write `func_800153b8` to reproduce the target assembly.

<!-- starter -->
```c
#pragma optimization_level 1
// define func_800153b8 to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int func_800153b8(int n) {
    int s = 0;
    for (; n > 0; n--) s += n;
    return s;
}
```
