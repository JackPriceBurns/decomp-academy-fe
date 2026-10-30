---
id: ac2ab04a-a059-4e24-bb34-597dcd1a0db6
slug: abi-delay-slot-arg
title: The Argument in the Delay Slot
difficulty: 2
concepts:
  - abi
  - calls
  - delay-slots
  - arguments
symbol: func_8030aac0
hints:
  - "Two instructions set up the arguments: an `or` before the `jal` and an `addiu` in its delay slot. Note which destination register each one writes."
  - "x has to be copied out of a0 before the constant can be written there. The `or` is that copy, and its destination shows which parameter position x ends up in."
---

# jal's delay slot holds argument setup

`jal` is a jump, so the instruction after it **always executes**, before the
callee runs its first instruction. IDO knows this and uses the slot for the
last part of the argument setup. This is `sendPair(n)`, which calls
`post(n, 8)`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    post            # post(n, 8): n is already in a0
addiu  a1, zero, 8     # second argument, set up in the delay slot
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

`n` arrived in `a0`, and the callee wants its first argument in `a0`, so no
work is needed for it. The only setup left is putting the constant `8` into
`a1`, and IDO places exactly that in the delay slot. By the time `post`
starts, both arguments are in place. A reading tip: **when you see a `jal`,
read its delay slot as part of the call**, then look *upward* for the rest of
the argument setup.

Looking upward matters when arguments have to move between registers. If a
value currently in `a0` belongs in a *different* argument position, IDO must
copy it out **before** it overwrites `a0`. You will see an `or ax, a0, zero`
above the `jal`, and then the new `a0` value set up last, in the delay slot.
The order matters: the copy comes first, and the overwrite goes in the delay
slot.

The target does exactly one such move. Work out where the value that arrives
in `a0` ends up, and what replaces it in `a0`.

## Your task

`extern s32 submit(s32 code, s32 value);` is declared for you. Write
`func_8030aac0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8030aac0(s32 x) {
    return submit(5, x);
}
```

<!-- context -->
```c
extern s32 submit(s32 code, s32 value);
```
