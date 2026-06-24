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
`spellstone_setState` — a setter that does *three* things in eleven lines of C:
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

The object holds a *pointer* to its state struct (offset 0), so the very first
thing the function does is chase it: `lwz r5, 0(r3)`. The `state` field is a
`u8`, hence `lbz`/`stb`. Setting `state == 2` adds a rise amount to `posY`:

```asm
lwz     r5, 0(r3)          # extra = obj->state
cmpwi   r4, 2              # state == 2 ?
lbz     r6, 0(r5)          # oldState = extra->state
stb     r4, 0(r5)          # extra->state = state
bne-    .skip
lfs     f1, 8(r3)          # obj->posY
lfs     f0, lbl_riseAmount
fadds   f0, f1, f0
stfs    f0, 8(r3)
.skip:
subfic  r3, r6, 1          # \
addi    r0, r6, -1         #  | the "oldState != 1" boolean
or      r0, r3, r0         #  |
srwi    r3, r0, 31         # /
blr
```

The payoff is that last quartet. `return oldState != 1;` does **not** compile to
a compare-and-branch — MWCC computes `!= ` *branchlessly* with
`subfic`/`addi`/`or`/`srwi`. That four-instruction "is-nonzero" pattern is a
signature you'll see often; it reads as a boolean `x != k` return, not as four
separate arithmetic steps. This exact quartet appears because `oldState` was
loaded from a `u8` *field* with `lbz`, which zero-extends it — so the branchless
`!=` works on a clean value with no masking. (It's the field's width that drives
this, not the declared type of the local.)

## Your task

With the structs above, write `spellstone_setState`: stash the old `state`, store
the new one, add `lbl_riseAmount` to `posY` only when `state == 2`, and return
whether the old state was **not** 1.

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
