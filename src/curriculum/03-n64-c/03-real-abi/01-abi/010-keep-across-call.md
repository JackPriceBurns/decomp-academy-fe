---
id: daaf2e3a-f7c1-45c9-b541-b01bd240641c
slug: abi-keep-across-call
title: Keeping a Value Across a Call
difficulty: 3
concepts:
  - abi
  - calls
  - homing
  - frames
symbol: func_802abcb8
hints:
  - "After the call, `t6` holds the reloaded argument and `v0` holds the call's result. Read the `subu`'s operand order to see which is subtracted from which."
  - "The whole store/reload dance comes for free — write the one-line C and let the compiler produce it."
---

# Nothing in a0 survives a jal

Argument and temporary registers belong to whoever runs next. Call a function
and it is free to trample `a0`–`a3`, every `t`-register, and `v0`–`v1` — so if
*your* function needs a value after the call, it can't leave it in any of
those. Where does IDO stash it? You already know the place: **the home slots**.

Here's `addAfter(x)`, which returns `work(x) + x` — `x` is both the argument
*and* needed again afterward:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)     # x parked in its home slot — 0, plus the new frame
jal    work
lw     a0, 24(sp)     # …reloaded as the argument, in the delay slot
lw     t6, 24(sp)     # x fetched again, now that the call is over
lw     ra, 20(sp)
addu   v0, v0, t6     # result + x
jr     ra
addiu  sp, sp, 24     # frame close rides the return's delay slot
```

Three things worth staring at:

- **The offset is 24, not 0.** The home slots sit in the *caller's* frame; once
  this function opens its own 24-byte frame, `sp` has moved down and the old
  `0(sp)` reads as `24(sp)`. Same slot, new address.
- **The reload in the delay slot looks pointless** — `a0` still held `x`! It's
  another debugging-support tic, and it's load-bearing for a match: this
  store-then-reload around a `jal` is the signature of *an argument used again
  after a call*.
- **The epilogue changed shape.** With real work to schedule, the frame-closing
  `addiu sp, sp, 24` migrates into `jr ra`'s delay slot instead of sitting
  before it. Both epilogue shapes are correct MIPS; the compiler picks per
  function, so always read what's actually there.

The target has the same skeleton with one twist in the final arithmetic. The
operand order of one instruction is the entire puzzle.

## Your task

`extern s32 trim(s32 n);` is declared for you. Write `func_802abcb8` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_802abcb8(s32 n) {
    return n - trim(n);
}
```

<!-- context -->
```c
extern s32 trim(s32 n);
```
