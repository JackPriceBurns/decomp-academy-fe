---
id: f9bd2473-1fe9-4d58-a68c-fc017531f16b
slug: finale-global-through-call
title: A Global Rides Through a Call
difficulty: 3
concepts:
  - globals
  - calls
  - frames
  - hi-lo
symbol: func_8026f490
hints:
  - "The `jal`'s delay slot loads the call's own first argument — from the address the relocs name."
  - "After the call, one store — and nothing else touches `v0` before the epilogue. The function returns exactly what it just stored."
---

# Where the tiers stop being separate

From here to the end of the tier, no lesson teaches a new instruction.
These functions look like the ones in a real game: several idioms at once,
and the skill is *decomposition* — naming each fingerprint and letting the
C fall out. Start with the most common combination in existence: read a
global, call something, write a global. Here's `heal(amount)`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
or     a1, a0, zero          # the parameter steps aside — a0 has a job to do
lui    t6, %hi(gHealth)
lw     t6, %lo(gHealth)(t6)  # read the global
jal    clampHealth
addu   a0, t6, a1            # (slot) the argument, BUILT in the delay slot
lui    at, %hi(gHealth)
sw     v0, %lo(gHealth)(at)  # the call's result goes back into the global
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Decompose it: minimal non-leaf frame (`-24`, `ra` at 20). A `%hi`/`%lo`
pair reading `gHealth`. The parameter shuffled to `a1` early so that `a0`
is free to become the call argument — assembled, with a flourish, in the
`jal`'s own delay slot. Then a second `%hi`/`%lo` pair to store `v0`. In
C: one statement — *global gets callee(global + parameter)*.

Two things worth filing:

- **The global's address is built twice.** Once for the load, once for the
  store — with a call in between, the compiler doesn't keep the address in
  a register across it. Two `lui`s for one variable is normal here.
- **Register roles turn over fast.** `a0` is the parameter, then the call
  argument; `v0` is the call result, then the stored value, then (if the
  function returns it) the return value — with zero extra instructions.

The target has the same skeleton with its own twist: watch which value
lands in `a1`, what the delay-slot load fetches, and how the storing side
builds its address. Then ask what the function returns — and notice how
little the compiler had to do about it.

## Your task

`extern s32 gScore;` and `extern s32 applyBonus(s32 score, s32 mult);` are
declared for you. Write `func_8026f490` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8026f490(s32 mult) {
    gScore = applyBonus(gScore, mult);
    return gScore;
}
```

<!-- context -->
```c
extern s32 gScore;
extern s32 applyBonus(s32 score, s32 mult);
```
