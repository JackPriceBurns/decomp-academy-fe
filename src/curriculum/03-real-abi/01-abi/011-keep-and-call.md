---
id: abi-keep-and-call
title: "Chaining: Keep a Value, Marshal the Rest"
difficulty: 3
concepts:
  - saved-registers
  - calls
  - arguments
  - chaining
symbol: accum
hints:
  - One parameter is needed *after* the call, so it lands in `r31` before the
    `bl`; the others are shuffled down into the argument registers.
  - The instruction after the epilogue's `lwz` combines the saved value with the
    call's result — read which register pairs with `r31`.
---

# Two ABI rules in one body

The earlier lessons gave you the moves one at a time: a value that must survive
a call goes into `r31` (callee-saved), and a call's arguments are *marshalled*
into `r3`, `r4`, … before the `bl`. A real wrapper does both at once — it keeps
one value alive across the call while feeding the rest into the callee.

Consider `hold_sub(w, x, y, z)`, which calls `op3(x, y, z)` and then subtracts
the result from `w`:

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
stw    r31,12(r1)
mr     r31,r3       # w must outlive the call -> park it in r31
mr     r3,r4        # marshal x into the 1st arg slot
mr     r4,r5        # marshal y into the 2nd
mr     r5,r6        # marshal z into the 3rd
bl     op3          # op3(x, y, z); r3..r12 may be destroyed
lwz    r0,20(r1)
subf   r3,r3,r31    # r31 - result  =  w - op3(...)
mtlr   r0
addi   r1,r1,16
blr
```

Read it in two layers. The `mr r31, r3` is the *survival* move — `w` arrives in
`r3` but `r3` is about to be reused as the first outgoing argument, so `w` is
saved into the callee-saved `r31` first. The three `mr` instructions then slide
`x`, `y`, `z` down from `r4`–`r6` into `r3`–`r5`. After the call, `subf` combines
the preserved value with the returned one.

The target assembly for `accum` has the same skeleton with **fewer** marshalled
arguments and a different final operator. Find which parameter is stashed in
`r31`, which ones are shuffled into the argument registers for the call, and how
the post-call instruction folds the survivor into the result.

## Your task

Write `accum`, which calls `proc` and combines a surviving parameter with the
result, to reproduce the target assembly. `proc` is declared for you.

<!-- starter -->
```c
int accum(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int accum(int a, int b, int c) {
    return a + proc(b, c);
}
```

<!-- context -->
```c
extern int proc(int p, int q);
```
