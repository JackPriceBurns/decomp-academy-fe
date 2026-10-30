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
  - "After the call, `t6` holds the reloaded argument and `v0` holds the call's result. Read the operand order of the `subu` to see which value is subtracted from which."
  - "You don't write the store and reload yourself. Write the one-line C and the compiler produces them."
---

# Nothing in a0 survives a jal

Any function you call is free to overwrite the argument and temporary
registers: `a0` through `a3`, every `t`-register, and `v0` and `v1`. So if
*your* function needs a value after the call, it can't keep it in any of those
registers. IDO keeps it in a place you already know: **the home slots**.

This is `addAfter(x)`, which returns `work(x) + x`. Here `x` is the argument to
the call, and it is *also* needed afterward:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)     # x stored in its home slot (0, plus the new frame)
jal    work
lw     a0, 24(sp)     # reloaded as the argument, in the delay slot
lw     t6, 24(sp)     # x loaded again after the call
lw     ra, 20(sp)
addu   v0, v0, t6     # result + x
jr     ra
addiu  sp, sp, 24     # frame closed in the return's delay slot
```

Three things to notice:

- **The offset is 24 instead of 0.** The home slots are in the *caller's*
  frame. Once this function opens its own 24-byte frame, `sp` has moved down,
  so the old `0(sp)` is now `24(sp)`. It is the same slot at a new address.
- **The reload in the delay slot looks pointless**, because `a0` still held
  `x`. It is another effect of the debugging support, and it matters for
  matching: this store and reload around a `jal` is the sign of *an argument
  that is used again after a call*.
- **The epilogue has a different shape.** Because there is real work to
  schedule, the `addiu sp, sp, 24` that closes the frame moves into the delay
  slot of `jr ra` instead of coming before it. Both epilogue shapes are correct
  MIPS. The compiler chooses one for each function, so always read what is
  actually there.

The target has the same structure, with one difference in the final
arithmetic. The only thing to work out is the operand order of one
instruction.

## Your task

`extern s32 trim(s32 n);` is declared for you. Write `func_802abcb8` to
reproduce the target assembly.

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
