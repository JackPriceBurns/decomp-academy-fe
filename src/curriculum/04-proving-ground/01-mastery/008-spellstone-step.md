---
id: mastery-spellstone-step
title: "A Per-Frame Update: Rotation, a Flag, and a Branch"
difficulty: 5
concepts:
  - structs
  - control-flow
  - bitmask
  - calls
symbol: spellstone_step
hints:
  - Type `state` as `u8` so its compares come out as unsigned `cmplwi`, not
    `cmpwi`.
  - "`rotX += 0x100` on the `s16` field is `lha` / `addi 256` / `sth`."
  - "`flags |= 0x4000` with the `(s16)` cast keeps it halfword-wide (`ori`)."
---

# The shape of an update function

A trimmed `spellstone_update`: every frame the object maybe-spins, checks a game
bit, and routes through an if/else of helper calls. This is the first capstone
where you juggle a *saved base pointer* (`r30`) across multiple calls while the
state pointer lives in `r31`.

```c
typedef struct { u8 state; } SpellState;
typedef struct { int completeEvent; int activeEvent; } SpellDef;
typedef struct GameObject {
    SpellState* state; SpellDef* def;
    f32 worldPosX; f32 worldPosY; f32 worldPosZ;
    s16 rotX; s16 rotY; s16 rotZ; s16 flags;
    void* followTarget;
    f32 posX; f32 posY; f32 posZ;
} GameObject;
extern int GameBit_Get(int e);
extern void GameBit_Set(int e, int v);
extern void Obj_RemoveFromUpdateList(GameObject* o);
extern void ObjHits_EnableObject(GameObject* o);
extern void ObjHits_DisableObject(GameObject* o);
```

The `state` field is a `u8`, so its compares are **unsigned** `cmplwi` — exactly
the SFA rule that compare width tracks the operand type. Spinning is a `+= 0x100`
on the `s16` rotation field; the flag is set with `ori 0x4000`:

```asm
lbz     r0, 0(r31)
cmplwi  r0, 2              # state == 2 ?  (unsigned, because u8)
bne-    .nospin
...
lha     r3, 20(r30)
addi    r0, r3, 256        # rotX += 0x100
sth     r0, 20(r30)
.nospin:
lwz     r3, 0(r5)
bl      GameBit_Get
cmpwi   r3, 0
beq-    .else
ori     r0, r0, 16384      # flags |= 0x4000
bl      Obj_RemoveFromUpdateList
b       .end
.else:
lbz     r0, 0(r31)
cmplwi  r0, 0
bne-    .enable
bl      ObjHits_DisableObject
...
```

(The `rotY = 0` and `rotZ = 0` stores are elided from the excerpt above for
brevity — only the `rotX += 0x100` line is shown — but your solution still needs
all three.)

The instructive detail: typing `state` as `u8` is what makes those compares
`cmplwi` instead of `cmpwi`. Get the field type wrong and the branch opcode
mismatches even though the logic is identical.

## Your task

With the structs above, write `spellstone_step` to match the assembly above.
Pay attention to which rotation fields change and by how much, the direction of
the `GameBit_Get` branch and which event it reads, and the `(s16)` on the flag
write.

<!-- starter -->
```c
void spellstone_step(GameObject* obj) {
    // maybe spin; then branch on the complete event
}
```

<!-- solution -->
```c
void spellstone_step(GameObject* obj) {
    SpellState* state = obj->state;
    SpellDef* def = obj->def;
    if (state->state == 2) {
        obj->rotY = 0;
        obj->rotX += 0x100;
        obj->rotZ = 0;
    }
    if (GameBit_Get(def->completeEvent) != 0) {
        obj->flags = (s16)(obj->flags | 0x4000);
        Obj_RemoveFromUpdateList(obj);
    } else {
        if (state->state == 0) {
            ObjHits_DisableObject(obj);
        } else {
            ObjHits_EnableObject(obj);
        }
    }
}
```

<!-- context -->
```c
typedef struct { u8 state; } SpellState;
typedef struct { int completeEvent; int activeEvent; } SpellDef;
typedef struct GameObject {
    SpellState* state; SpellDef* def;
    f32 worldPosX; f32 worldPosY; f32 worldPosZ;
    s16 rotX; s16 rotY; s16 rotZ; s16 flags;
    void* followTarget;
    f32 posX; f32 posY; f32 posZ;
} GameObject;
extern int GameBit_Get(int e);
extern void GameBit_Set(int e, int v);
extern void Obj_RemoveFromUpdateList(GameObject* o);
extern void ObjHits_EnableObject(GameObject* o);
extern void ObjHits_DisableObject(GameObject* o);
```
