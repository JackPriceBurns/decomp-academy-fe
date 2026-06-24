---
id: mastery-cloudrace-oncomplete
title: A Loop Over an Event Array
difficulty: 4
concepts:
  - loops
  - arrays
  - calls
  - bitmask
symbol: crcloudrace_onComplete
hints:
  - "`state->flags |= 0x40;` is a load / `ori 64` / store."
  - "`upd->eventIds[i]` is an indexed load `lwzx` driven by a `i*4` cursor."
  - Write it as a normal `for` — MWCC enters via `b .test` and checks the count
    at the bottom.
---

# Scanning anim events

This is SFA's `crcloudrace_completionCallback` in miniature: set a state flag,
then walk an array of event ids, firing a burst of game-bit calls whenever a
matching event shows up. It's the canonical "loop with an indexed load and a
conditional call body" capstone.

```c
typedef struct { int eventCount; int* eventIds; } AnimUpdate;
typedef struct { u32 flags; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern void loadMapAndParent(int map);
```

The flag OR is a plain `ori`. The loop keeps a byte-offset cursor in one
register and the counter in another; the element fetch is the indexed load
`lwzx`. MWCC emits the classic "jump to the test first" loop layout:

```asm
lwz     r3, 0(r3)          # state = obj->state
lwz     r0, 0(r3)
ori     r0, r0, 64         # state->flags |= 0x40
stw     r0, 0(r3)
b       .test
.body:
lwz     r3, 4(r29)         # upd->eventIds
lwzx    r0, r3, r31        # eventIds[i]   (r31 = i*4)
cmpwi   r0, 18
bne-    .next
li      r3, 115            # GameBit_Set(0x73, 1)
...                        # three helper calls
.next:
addi    r31, r31, 4        # cursor += 4
addi    r30, r30, 1        # i++
.test:
lwz     r0, 0(r29)         # upd->eventCount
cmpw    r30, r0
blt+    .body
```

The takeaways: `lwzx rD, rA, rB` is the array-element load whose index register
`r31` holds the *byte* offset `i*4`, not `i` itself. From the plain C
`upd->eventIds[i]`, MWCC manufactures a second induction variable — a byte
cursor it bumps with `addi r31, r31, 4` — alongside the real counter
`addi r30, r30, 1`, precisely to avoid a `mulli` every iteration. That's why you
see *two* increments at `.next` for a loop with one visible variable. The loop
condition is then checked at the **bottom** with the body reached by an initial
`b .test`. That entry jump is how MWCC compiles a `for` whose count might be
zero.

## Your task

With the structs above, write `crcloudrace_onComplete`: OR `0x40` into
`state->flags`, then for each `i` in `[0, eventCount)`, if `eventIds[i] == 0x12`,
call `GameBit_Set(0x73, 1)`, `GameBit_Set(0x74, 0)`, and
`loadMapAndParent(0x1d)`. Return `0`.

<!-- starter -->
```c
int crcloudrace_onComplete(RaceObject* obj, AnimUpdate* upd) {
    // flags |= 0x40; loop the event ids; fire calls on a match
    return 0;
}
```

<!-- solution -->
```c
int crcloudrace_onComplete(RaceObject* obj, AnimUpdate* upd) {
    RaceState* state = obj->state;
    int i;
    state->flags |= 0x40;
    for (i = 0; i < upd->eventCount; i++) {
        if (upd->eventIds[i] == 0x12) {
            GameBit_Set(0x73, 1);
            GameBit_Set(0x74, 0);
            loadMapAndParent(0x1d);
        }
    }
    return 0;
}
```

<!-- context -->
```c
typedef struct { int eventCount; int* eventIds; } AnimUpdate;
typedef struct { u32 flags; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern void loadMapAndParent(int map);
```
