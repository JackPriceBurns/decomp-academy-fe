---
id: advanced-state-machine
title: "Capstone: A Volatile-Guarded Enum State Machine"
difficulty: 5
concepts:
  - switch
  - jump-table
  - enum
  - volatile
  - state-machine
symbol: step_state
hints:
  - The volatile g_abort read is one `lwz` feeding a `cmpwi`/`beq-` early return
    of -1.
  - "Eight dense enum cases dispatch through the jump table: `cmplwi 7`, `bgt-`,
    `lwzx`/`mtctr`/`bctr`."
---

# Putting the idioms together

Real engine code rarely shows one idiom at a time. A frame's state-machine step
might check a `volatile` abort flag, then dispatch on an `enum` state through a
`switch`. Each piece you've learned is visible in the asm — stacked:

```asm
lwz    r0, g_abort@sda21(r2) # volatile read of the abort flag...
cmpwi  r0, 0
beq-   .run                  # ...not aborting -> proceed
li     r3, -1                # aborting -> bail with sentinel
blr
.run:
cmplwi r3, 7                 # enum-state switch on s (still in r3, first arg): bounds check (8 dense cases)
bgt-   .default
lis    r4, table@ha          # ...jump-table dispatch
slwi   r0, r3, 2
addi   r3, r4, table@lo
lwzx   r0, r3, r0
mtctr  r0
bctr                         # jump straight to the case for this state
```

Three lessons in one fingerprint: the **`volatile` guard** (a single `lwz` of
the flag feeding a `beq-` early-return), the **enum** (the state arrives as a
plain 4-byte int — naming, no codegen cost), and the **jump table** (eight dense
states cross the threshold into `cmplwi`/`lwzx`/`mtctr`/`bctr`). Recovering
this means recognizing all three at once and writing each in its natural C form.

## Your task

Write `step_state(GameState s)`. First, if the provided `volatile int g_abort`
is non-zero, `return -1`. Otherwise `switch` on `s` over the eight `GameState`
values (`ST_BOOT`..`ST_QUIT`) returning `1..8` in order, with `0` by default.
The enum and `g_abort` are provided in context.

<!-- starter -->
```c
int step_state(GameState s) {
    return 0;
}
```

<!-- solution -->
```c
int step_state(GameState s) {
    if (g_abort) return -1;
    switch (s) {
        case ST_BOOT:  return 1;
        case ST_INIT:  return 2;
        case ST_MENU:  return 3;
        case ST_LOAD:  return 4;
        case ST_PLAY:  return 5;
        case ST_PAUSE: return 6;
        case ST_OVER:  return 7;
        case ST_QUIT:  return 8;
        default:       return 0;
    }
}
```

<!-- context -->
```c
typedef enum {
    ST_BOOT, ST_INIT, ST_MENU, ST_LOAD, ST_PLAY, ST_PAUSE, ST_OVER, ST_QUIT
} GameState;
extern volatile int g_abort;
```
