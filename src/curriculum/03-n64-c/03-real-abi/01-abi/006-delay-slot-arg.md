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
  - "Two instructions set up the arguments — an `or` before the `jal` and an `addiu` in its delay slot. Note which destination register each one writes."
  - "x has to leave a0 before the constant can move in. Read the `or` as that rescue, and you'll see which parameter position x ends up in."
---

# jal's delay slot is prime real estate

`jal` is a jump, so the instruction after it **always executes** — before the
callee runs its first line. IDO knows this and uses the slot for the last piece
of argument setup. Here's `sendPair(n)`, which calls `post(n, 8)`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    post            # post(n, 8) — n is already sitting in a0
addiu  a1, zero, 8     # second argument, set up in the delay slot
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

`n` arrived in `a0` and the callee wants its first argument in `a0` — zero work.
The only setup needed is the constant `8` into `a1`, and IDO tucks exactly that
into the delay slot. By the time `post` starts executing, both arguments are in
place. Reading tip: **when you see a `jal`, read its delay slot as part of the
call**, then look *upward* for the rest of the argument setup.

The upward part matters when arguments have to shuffle. If a value currently in
`a0` belongs in a *different* argument position, IDO must copy it out **before**
overwriting `a0` — you'll see an `or ax, a0, zero` above the `jal`, then the new
`a0` value set up last, in the slot. Order is everything: the rescue first, the
overwrite in the delay slot.

The target does exactly one such shuffle. Work out where the incoming argument
ends up and what takes its old seat.

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
