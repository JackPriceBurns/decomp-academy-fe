---
id: acdc8980-dbd3-4e32-ae39-9f2d5f6ee98b
slug: adv-state-capstone
title: "Capstone: The State Machine"
difficulty: 4
concepts:
  - switch
  - globals
  - control-flow
  - capstone
symbol: func_80337224
hints:
  - "Map the chain first — three state values plus a default. Then, inside the first state's body, there's a second branch testing the *argument*."
  - "One case doubles the argument (note the shift), one returns a bare constant, and one may or may not store to the global. Track every `sw`."
---

# Where switches, globals, and branches meet

The classic game-loop function: read a global state, branch on it, maybe
advance the state, return something. Every idiom this tier taught, in one
room. Here's `stepPhase()`, which toggles the global `gPhase` between 0 and 1,
returning 10 or 20 for the phase it left:

```asm
 0:  lui    v1, %hi(gPhase)
 4:  addiu  v1, v1, %lo(gPhase)   # address completed — used by load AND stores
 8:  lw     v0, 0(v1)             # the state, loaded once
 c:  addiu  at, zero, 1
10:  addiu  t6, zero, 1
14:  beqzl  v0, 0x30              # state 0? …
18:  sw     t6, 0(v1)             #   likely slot: gPhase = 1, only if taken
1c:  beql   v0, at, 0x3c          # state 1? …
20:  sw     zero, 0(v1)           #   likely slot: gPhase = 0
24:  b      0x48                  # unknown state: return 0
28:  or     v0, zero, zero
2c:  sw     t6, 0(v1)             # ── orphaned twins of the slot stores ──
30:  jr     ra                    # state 0's exit
34:  addiu  v0, zero, 10
38:  sw     zero, 0(v1)
3c:  jr     ra                    # state 1's exit
40:  addiu  v0, zero, 20
44:  or     v0, zero, zero
48:  jr     ra
4c:  nop
```

The reading order that works: **find the load of the global, then map the
branch chain** — two compares plus a fall-through default, small enough that
no jump table appears. Then notice *where the state transitions live*: each
`sw` rides a likely slot, so the store happens only on its state's path. The
duplicated instructions at `0x2c`, `0x38`, and `0x44` are the same orphaned
tails you met with `bc1fl` — emitted, unreachable, and part of the match.

Translating back to C, each branch target is a `case`, each slot store is a
`gPhase = …;` statement inside that case, and each `jr ra` pair is that
case's `return`. The single completed address in `v1` serving one load and
two stores is the compiler's work, not something you write.

The target machine has three states and a default. One of its cases branches
*again* — on the argument — before deciding whether to advance the state.
Chart every path: what's stored, what's returned. Then write the `switch`.

## Your task

`extern s32 gMode;` is declared for you. Write `func_80337224` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_80337224(s32 cmd) {
    switch (gMode) {
    case 0:
        if (cmd != 0) {
            gMode = 1;
        }
        return 0;
    case 1:
        gMode = 2;
        return cmd * 2;
    case 2:
        return 5;
    }
    return -1;
}
```

<!-- context -->
```c
extern s32 gMode;
```
