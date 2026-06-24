---
id: mastery-spellstone-setstate
title: "A Real Setter: State, a Float Nudge, and a Boolean Return"
difficulty: 3
concepts:
  - structs
  - control-flow
  - float
  - boolean-idiom
symbol: spellstone_setState
hints:
  - "Chase the state pointer first: `extra = obj->state;` — that's the leading
    `lwz r5, 0(r3)`."
  - "`state` is a `u8` field, so read it with `lbz` into `oldState` *before*
    overwriting it."
  - "`return oldState != 1;` is the branchless `subfic`/`addi`/`or`/`srwi`
    quartet — let the compiler write it."
---

# Your first real function

Everything so far has been a single idea in isolation. Capstones combine them.
This one is lifted almost verbatim from Star Fox Adventures'
`spellstone_setState` — a setter that does several things in one short function:
reads an old value, writes a new one, conditionally nudges a position, and
returns a boolean.

```c
typedef struct { u8 state; u8 pad[3]; f32 timer; } SpellStoneState;
typedef struct {
    SpellStoneState* state;
    f32 posX; f32 posY; f32 posZ;
} SpellStoneObject;
extern f32 lbl_riseAmount;
```

**Pointer chasing.** The first field of `SpellStoneObject` is itself a pointer to
a `SpellStoneState`. Accessing fields through it costs an extra `lwz` to load the
pointer before you can dereference it.

**Byte fields.** `state` inside `SpellStoneState` is a `u8`, so reads produce
`lbz` (zero-extending) and writes produce `stb`. The zero-extension matters for
the return value below.

**Branchless `!= k`.** When a function returns a `u8`-sourced `!= k` comparison
directly, MWCC avoids a branch and instead uses a four-instruction sequence:
`subfic`/`addi`/`or`/`srwi`. As an example, a setter that returns `oldMode != 2`
(where `oldMode` came from `lbz`) compiles to:

```asm
subfic  r3,r6,2
addi    r0,r6,-2
or      r0,r3,r0
srwi    r3,r0,31
```

The tail of `spellstone_setState` uses this same pattern. Read the constants in
the target assembly to determine the comparison value.

**Float offset.** A conditional `+= someExternFloat` on a field loads the field,
loads the extern, calls `fadds`, and stores back — no intermediate local needed.
The target `posY` lies at offset 8 inside `SpellStoneObject`.

```asm
lwz     r5, 0(r3)          # chase state pointer
cmpwi   r4, 2
lbz     r6, 0(r5)          # read u8 before overwriting
stb     r4, 0(r5)          # write new state
bne-    .skip
lfs     f1, 8(r3)
lfs     f0, lbl_riseAmount
fadds   f0, f1, f0
stfs    f0, 8(r3)
.skip:
subfic  r3, r6, 1
addi    r0, r6, -1
or      r0, r3, r0
srwi    r3, r0, 31
blr
```

Read the assembly: note which register each instruction touches, what the `cmpwi`
constant is, which offsets the float load/store use, and what constants feed the
branchless tail.

## Your task

With the structs above, write `spellstone_setState` to reproduce the assembly above.

<!-- starter -->
```c
int spellstone_setState(SpellStoneObject* obj, int state) {
    // read old state, write new, conditionally rise, return oldState != 1
    return 0;
}
```

<!-- solution -->
```c
int spellstone_setState(SpellStoneObject* obj, int state) {
    SpellStoneState* extra;
    u8 oldState;

    extra = obj->state;
    oldState = extra->state;
    extra->state = state;
    if (state == 2) {
        obj->posY += lbl_riseAmount;
    }
    return oldState != 1;
}
```

<!-- context -->
```c
typedef struct { u8 state; u8 pad[3]; f32 timer; } SpellStoneState;
typedef struct {
    SpellStoneState* state;
    f32 posX; f32 posY; f32 posZ;
} SpellStoneObject;
extern f32 lbl_riseAmount;
```
