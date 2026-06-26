---
id: mastery-race-advance
title: A Phase State Machine
difficulty: 4
concepts:
  - switch
  - control-flow
  - calls
  - float
symbol: race_advance
hints:
  - Write a plain `switch (s->phase)` with cases 0..3 in order plus a `default`.
  - Don't hand-roll the `cmpwi` pivot tree — the compiler builds it from the
    ordered cases.
  - Each `s->phase = N;` is a `li`/`stw`; the case-2 guard is `timerCountDown`
    feeding a `cmpwi`/`beq`.
---

# switch becomes a comparison tree

SFA's race objects are driven by a `phase` integer and a big `switch`. With a
handful of small, contiguous cases MWCC does **not** build a jump table — it
emits a *binary search* of `cmpwi`/branch, which is one of the most disorienting
shapes to read back into a clean `switch`. The jump table only appears once the
case count grows (roughly five or more dense, contiguous labels); below that
threshold you get the comparison tree, so don't expect a table on every switch.

```c
typedef struct { int phase; f32 timer; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern int GameBit_Get(int bit);
extern int timerCountDown(f32* t);
extern void s16toFloat(f32* t, int frames);
```

Watch how the dispatch pivots on `2`, then narrows:

```asm
lwz     r0, 0(r31)         # s->phase
cmpwi   r0, 2
beq-    .case2
bge-    .hi                # phase >= 3
cmpwi   r0, 0
beq-    .case0
bge-    .case1             # phase == 1
b       .default
.hi:
cmpwi   r0, 4
bge-    .default
b       .case3             # phase == 3
```

The body of each case is ordinary: `GameBit_Get`/`Set` calls, a `stw` to update
`phase`, and in case 2 a `timerCountDown` guard. A useful habit here: rather than
reverse-engineering the comparison tree by hand, write the
plain `switch` with the cases in numeric order and a `default`, and MWCC
regenerates this exact pivot structure for you.

## Your task

Write `race_advance` taking a `RaceObject* obj`. Switch on `s->phase` with cases 0 through 3 and a `default`, reading `s` from `obj->state`. Match the comparison tree and all per-case behaviour shown in the assembly above.

<!-- starter -->
```c
void race_advance(RaceObject* obj) {
    // switch on s->phase across cases 0..3 with a default
}
```

<!-- solution -->
```c
void race_advance(RaceObject* obj) {
    RaceState* s = obj->state;
    switch (s->phase) {
    case 0:
        if (GameBit_Get(0x10) != 0) {
            GameBit_Set(0x11, 1);
            s->phase = 1;
        }
        break;
    case 1:
        GameBit_Set(0x12, 0);
        s->phase = 2;
        s16toFloat(&s->timer, 0x708);
        break;
    case 2:
        if (timerCountDown(&s->timer) != 0) {
            s->phase = 3;
        }
        break;
    case 3:
        s->phase = 0;
        break;
    default:
        s->phase = 0;
        break;
    }
}
```

<!-- context -->
```c
typedef struct { int phase; f32 timer; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern int GameBit_Get(int bit);
extern int timerCountDown(f32* t);
extern void s16toFloat(f32* t, int frames);
```
