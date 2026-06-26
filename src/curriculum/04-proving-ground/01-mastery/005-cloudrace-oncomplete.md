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

**Pointer-chased flag OR.** `obj->state` is itself a pointer, so OR-ing a flag
into `state->flags` requires chasing the pointer with `lwz` first, then
load/OR/store.

**`lwzx` and the byte-cursor.** MWCC avoids a multiply-per-iteration by keeping
*two* induction variables alongside your one visible `i`: a plain counter and a
byte cursor (= `i * sizeof(int)`). The element fetch is `lwzx rD, rBase, rCursor`
where `rCursor` holds the byte offset. Both variables increment at the loop tail.

**Jump-to-test layout.** MWCC compiles a `for` loop by jumping to the condition
check *first* (`b .test`), then running the body on the way back. This handles a
zero-count gracefully.

Here is an analogous function that scans a trigger array for a different id and
fires different calls when it matches:

```asm
lwz     r3, 0(r3)          # state = obj->state
lwz     r0, 0(r3)
ori     r0, r0, 32         # state->flags |= 0x20
stw     r0, 0(r3)
b       .test
.body:
lwz     r3, 4(r29)         # trig->triggerIds
lwzx    r0, r3, r31        # triggerIds[i]
cmpwi   r0, 5
bne-    .next
li      r3, 16             # SoundFX_Play(0x10, 1)
li      r4, 1
bl      SoundFX_Play
li      r3, 30             # FadeOut(0x1e)
bl      FadeOut
.next:
addi    r31, r31, 4
addi    r30, r30, 1
.test:
lwz     r0, 0(r29)         # trig->triggerCount
cmpw    r30, r0
blt+    .body
li      r3, 0
blr
```

Now apply those rules to the actual target:

```asm
stwu    r1, -32(r1)
mflr    r0
...
mr      r29, r4
lwz     r3, 0(r3)
lwz     r0, 0(r3)
ori     r0, r0, 64
stw     r0, 0(r3)
b       .test
.body:
lwz     r3, 4(r29)
lwzx    r0, r3, r31
cmpwi   r0, 18
bne-    .next
li      r3, 115
li      r4, 1
bl      GameBit_Set
li      r3, 116
li      r4, 0
bl      GameBit_Set
li      r3, 29
bl      loadMapAndParent
.next:
addi    r31, r31, 4
addi    r30, r30, 1
.test:
lwz     r0, 0(r29)
cmpw    r30, r0
blt+    .body
...
li      r3, 0
blr
```

Read the `ori` immediate for the flag value, the `cmpwi` immediate for the event
id to match, and each `li` + `bl` pair to identify the helper calls and their
arguments.

## Your task

With the structs above, write `crcloudrace_onComplete` to reproduce the assembly above.

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
