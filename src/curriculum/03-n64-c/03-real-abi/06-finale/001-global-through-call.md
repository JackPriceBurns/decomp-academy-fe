---
id: f9bd2473-1fe9-4d58-a68c-fc017531f16b
slug: finale-global-through-call
title: A Global Updated Through a Call
difficulty: 3
concepts:
  - globals
  - calls
  - frames
  - hi-lo
symbol: func_8026f490
hints:
  - "The `jal`'s delay slot loads the call's own first argument, from the address that the relocs name."
  - "After the call there is one store, and nothing else touches `v0` before the epilogue. The function returns exactly the value it just stored."
---

# Where the separate topics meet

From here to the end of the tier, no lesson teaches a new instruction. The
functions look like the ones in a real game. Each one uses several idioms at
once, and the skill you need is *decomposition*: you name each fingerprint,
and the C follows from those names. Start with the most common combination
there is: read a global, call a function, write a global. Here is
`heal(amount)`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
or     a1, a0, zero          # move the parameter so a0 is free
lui    t6, %hi(gHealth)
lw     t6, %lo(gHealth)(t6)  # read the global
jal    clampHealth
addu   a0, t6, a1            # (slot) the argument, built in the delay slot
lui    at, %hi(gHealth)
sw     v0, %lo(gHealth)(at)  # the call's result goes back into the global
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Break it into parts. There is a minimal non-leaf frame (`-24`, with `ra`
at 20). A `%hi`/`%lo` pair reads `gHealth`. The parameter is moved to `a1`
early, so that `a0` is free to hold the call argument. That argument is
computed in the `jal`'s own delay slot. Then a second `%hi`/`%lo` pair stores
`v0`. In C this is one statement: *global = callee(global + parameter)*.

Two things to remember:

- **The global's address is built twice.** It is built once for the load and
  once for the store. There is a call in between, and the compiler does not
  keep the address in a register across the call. Two `lui`s for one variable
  is normal here.
- **Registers change roles quickly.** `a0` holds the parameter, then the call
  argument. `v0` holds the call result, then the stored value, and then the
  return value if the function returns it. None of these changes needs an
  extra instruction.

The target has the same structure, with some differences. Watch which value
ends up in `a1`, what the load in the delay slot fetches, and how the store
builds its address. Then ask what the function returns, and notice how little
work the compiler needed to do for that.

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
