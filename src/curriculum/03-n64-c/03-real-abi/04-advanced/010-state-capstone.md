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
  - "Map the chain first: three state values and a default. Then, inside the first state's body, there is a second branch that tests the *argument*."
  - "One case doubles the argument (note the shift), one returns a bare constant, and one may or may not store to the global. Track every `sw`."
---

# Switches, globals and branches together

This is the classic game-loop function. It reads a global state, branches on
it, may advance the state, and returns a value. It uses the idioms this tier
has taught, all in one function. Here is `stepPhase()`, which switches the
global `gPhase` between 0 and 1. It returns 10 or 20, depending on the phase
it left:

```asm
 0:  lui    v1, %hi(gPhase)
 4:  addiu  v1, v1, %lo(gPhase)   # address completed: used by load AND stores
 8:  lw     v0, 0(v1)             # the state, loaded once
 c:  addiu  at, zero, 1
10:  addiu  t6, zero, 1
14:  beqzl  v0, 0x30              # state 0? …
18:  sw     t6, 0(v1)             #   likely slot: gPhase = 1, only if taken
1c:  beql   v0, at, 0x3c          # state 1? …
20:  sw     zero, 0(v1)           #   likely slot: gPhase = 0
24:  b      0x48                  # unknown state: return 0
28:  or     v0, zero, zero
2c:  sw     t6, 0(v1)             # ── orphaned copies of the slot stores ──
30:  jr     ra                    # state 0's exit
34:  addiu  v0, zero, 10
38:  sw     zero, 0(v1)
3c:  jr     ra                    # state 1's exit
40:  addiu  v0, zero, 20
44:  or     v0, zero, zero
48:  jr     ra
4c:  nop
```

Read it in this order: **first find the load of the global, then map the
branch chain.** There are two compares and a fall-through default, which is
small enough that no jump table appears. Then notice *where the state changes
happen*. Each `sw` sits in a likely slot, so the store happens only on the
path for its state. The duplicated instructions at `0x2c`, `0x38`, and
`0x44` are the same orphaned tails you saw with `bc1fl`. The compiler emits
them, nothing can reach them, and they are part of the match.

When you translate back to C, each branch target is a `case`, each slot store
is a `gPhase = …;` statement inside that case, and each `jr ra` pair is that
case's `return`. The compiler builds the address in `v1` once and uses it for
one load and two stores. You do not write anything for that.

The target state machine has three states and a default. One of its cases
branches *again* before it decides whether to advance the state. Map every
path: what is stored and what is returned. Then write the `switch`.

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
