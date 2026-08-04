---
id: d46878c2-aa3e-5c94-a384-4160b9c10272
slug: advanced-state-machine
title: "Capstone: A Volatile-Guarded Enum State Machine"
difficulty: 5
concepts:
  - switch
  - jump-table
  - enum
  - volatile
  - state-machine
symbol: func_8011a1e0
hints:
  - The volatile g_abort read is one `lwz` feeding a `cmpwi`/`beq-` early return
    of -1.
  - "Eight dense enum cases dispatch through the jump table: `cmplwi 7`, `bgt-`,
    `lwzx`/`mtctr`/`bctr`."
---

# Putting the idioms together

Real engine code rarely hands you one idiom at a time. A state-machine step
might check a `volatile` abort flag and then dispatch on an `enum` state through
a `switch`, which is what the assembly below does.

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

Walk it top to bottom and the three lessons fall out in order. The function
opens by loading `g_abort` once and branching on it with `beq-` — the volatile
guard taking its early return. Past `.run`, the state is still in a register as a
plain 4-byte int, so the `enum` costs nothing but the names. The eight dense
cases are too many for a compare chain, which is why the
`cmplwi`/`lwzx`/`mtctr`/`bctr` sequence shows up as a jump table. Recover it by
recognising those three shapes and writing each in the C that produces it.

## Your task

Write `func_8011a1e0` to reproduce the assembly above. The `GameState` enum and
`g_abort` are provided in context.

<!-- solution -->
```c
int func_8011a1e0(GameState s) {
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
