import { LessonSource } from "@/lib/lessons/types";

export const mastery: LessonSource[] = [
  {
    id: "mastery-spellstone-setstate",
    chapter: "mastery",
    order: 1,
    title: "A Real Setter: State, a Float Nudge, and a Boolean Return",
    difficulty: 3,
    concepts: ["structs", "control-flow", "float", "boolean-idiom"],
    brief: `
# Your first real function

Everything so far has been a single idea in isolation. Capstones combine them.
This one is lifted almost verbatim from Star Fox Adventures'
\`spellstone_setState\` — a setter that does *three* things in eleven lines of C:
reads an old value, writes a new one, conditionally nudges a position, and
returns a boolean.

\`\`\`c
typedef struct { u8 state; u8 pad[3]; f32 timer; } SpellStoneState;
typedef struct {
    SpellStoneState* state;
    f32 posX; f32 posY; f32 posZ;
} SpellStoneObject;
extern f32 lbl_riseAmount;
\`\`\`

The object holds a *pointer* to its state struct (offset 0), so the very first
thing the function does is chase it: \`lwz r5, 0(r3)\`. The \`state\` field is a
\`u8\`, hence \`lbz\`/\`stb\`. Setting \`state == 2\` adds a rise amount to \`posY\`:

\`\`\`asm
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
subfic  r3, r6, 1          # \\
addi    r0, r6, -1         #  | the "oldState != 1" boolean
or      r0, r3, r0         #  |
srwi    r3, r0, 31         # /
blr
\`\`\`

The payoff is that last quartet. \`return oldState != 1;\` does **not** compile to
a compare-and-branch — MWCC computes \`!= \` *branchlessly* with
\`subfic\`/\`addi\`/\`or\`/\`srwi\`. That four-instruction "is-nonzero" pattern is a
signature you'll see often; it reads as a boolean \`x != k\` return, not as four
separate arithmetic steps. This exact quartet appears because \`oldState\` was
loaded from a \`u8\` *field* with \`lbz\`, which zero-extends it — so the branchless
\`!=\` works on a clean value with no masking. (It's the field's width that drives
this, not the declared type of the local.)

## Your task

With the structs above, write \`spellstone_setState\`: stash the old \`state\`, store
the new one, add \`lbl_riseAmount\` to \`posY\` only when \`state == 2\`, and return
whether the old state was **not** 1.
`,
    symbol: "spellstone_setState",
    context: `typedef struct { u8 state; u8 pad[3]; f32 timer; } SpellStoneState;
typedef struct {
    SpellStoneState* state;
    f32 posX; f32 posY; f32 posZ;
} SpellStoneObject;
extern f32 lbl_riseAmount;`,
    starter: `int spellstone_setState(SpellStoneObject* obj, int state) {
    // read old state, write new, conditionally rise, return oldState != 1
    return 0;
}
`,
    solution: `int spellstone_setState(SpellStoneObject* obj, int state) {
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
`,
    hints: [
      "Chase the state pointer first: `extra = obj->state;` — that's the leading `lwz r5, 0(r3)`.",
      "`state` is a `u8` field, so read it with `lbz` into `oldState` *before* overwriting it.",
      "`return oldState != 1;` is the branchless `subfic`/`addi`/`or`/`srwi` quartet — let the compiler write it.",
    ],
  },
  {
    id: "mastery-fueltank-apply",
    chapter: "mastery",
    order: 2,
    title: "Copying a Position With a Bias",
    difficulty: 3,
    concepts: ["structs", "float", "narrow-types", "pointers"],
    brief: `
# Two structs, one position copy

Modeled on the tail of SFA's \`crfueltank_hitDetect\`: when a fuel tank is hit,
the game copies the *hitter's* position onto the tank, lifting \`Y\` by a constant
so the effect spawns slightly above the impact. It's a clean exercise in moving
\`f32\` fields between two different structs while a couple of \`u8\` status bytes
get set.

\`\`\`c
typedef struct { f32 posX; f32 posY; f32 posZ; } HitObj;
typedef struct {
    f32 posX; f32 posY; f32 posZ;
    s16 flags; u8 fadeTimer; u8 triggered;
} CrFuelTankObject;
extern f32 lbl_yBias;
\`\`\`

\`fadeTimer\` and \`triggered\` are \`u8\`s right after the \`s16 flags\`, landing at
offsets 14 and 15. The float copies are straight \`lfs\`/\`stfs\` pairs except \`Y\`,
which adds the bias:

\`\`\`asm
li      r5, 250
li      r0, 1
stb     r5, 14(r3)         # obj->fadeTimer = 0xfa
stb     r0, 15(r3)         # obj->triggered = 1
lfs     f0, 0(r4)          # hitObj->posX
stfs    f0, 0(r3)          # obj->posX = ...
lfs     f1, lbl_yBias
lfs     f0, 4(r4)          # hitObj->posY
fadds   f0, f1, f0
stfs    f0, 4(r3)          # obj->posY = lbl_yBias + hitObj->posY
lfs     f0, 8(r4)
stfs    f0, 8(r3)
blr
\`\`\`

Note that a plain field-to-field float copy is just \`lfs\` then \`stfs\` — no
float register math at all. Only the biased \`Y\` brings in an \`fadds\`. Watch the
operand order MWCC picks: \`lbl_yBias + hitObj->posY\` puts the constant in \`f1\`
first, exactly as written.

Statement order matters: the two \`stb\` byte stores come *first* because that's
how the original ordered them. Write the position copies first and MWCC reorders
the byte stores to the tail (and reschedules around them) — a functional but
non-matching layout. Match the source statement order to the instruction order.

## Your task

With the structs above, write \`crfueltank_apply\`: set \`fadeTimer\` to \`0xfa\` and
\`triggered\` to \`1\`, then copy all three position components from \`hitObj\`,
adding \`lbl_yBias\` to \`Y\`.
`,
    symbol: "crfueltank_apply",
    context: `typedef struct { f32 posX; f32 posY; f32 posZ; } HitObj;
typedef struct {
    f32 posX; f32 posY; f32 posZ;
    s16 flags; u8 fadeTimer; u8 triggered;
} CrFuelTankObject;
extern f32 lbl_yBias;`,
    starter: `void crfueltank_apply(CrFuelTankObject* obj, HitObj* hitObj) {
    // set the status bytes, then copy the position (Y gets a bias)
}
`,
    solution: `void crfueltank_apply(CrFuelTankObject* obj, HitObj* hitObj) {
    obj->fadeTimer = 0xfa;
    obj->triggered = 1;
    obj->posX = hitObj->posX;
    obj->posY = lbl_yBias + hitObj->posY;
    obj->posZ = hitObj->posZ;
}
`,
    hints: [
      "`fadeTimer`/`triggered` are `u8`s after the `s16 flags`, so they land at offsets 14 and 15 (`stb`).",
      "X and Z are bare `lfs`/`stfs` copies — no float math.",
      "Write `lbl_yBias + hitObj->posY` (constant first) to match the `fadds f0, f1, f0` operand order.",
    ],
  },
  {
    id: "mastery-fueltank-tick",
    chapter: "mastery",
    order: 3,
    title: "A Flag Toggle Behind a Helper Call",
    difficulty: 3,
    concepts: ["bitmask", "control-flow", "calls", "narrow-types"],
    brief: `
# Clearing and setting a flag bit

Straight from SFA's \`crfueltank_update\`: a timer helper decides which branch
runs, and each branch flips the same \`0x4000\` flag bit in opposite directions.
Because the function now *calls* something, you get your first real
prologue/epilogue with a saved register.

\`\`\`c
typedef struct { f32 timer; s16 flags; u8 fadeTimer; u8 pad; } CrFuelTankObject;
extern int timerCountDown(f32* t);
extern void ObjHits_EnableObject(CrFuelTankObject* o);
\`\`\`

The two flag writes are the heart of it. A **single-bit clear** written as
\`flags & ~0x4000\` leads MWCC to emit an \`rlwinm\` mask rather than an \`andi\`; the
**set** is a plain \`| 0x4000\` → \`ori\`. The \`(s16)\` cast keeps the
field at halfword width (\`lha\`/\`sth\`):

\`\`\`asm
stwu    r1, -16(r1)        # prologue — we make a call
mflr    r0
...
bl      timerCountDown
cmpwi   r3, 0
beq-    .else
bl      ObjHits_EnableObject
lha     r3, 4(r31)
li      r0, 255
rlwinm  r3, r3, 0, 18, 16  # flags &= ~0x4000   (clear one bit)
sth     r3, 4(r31)
stb     r0, 6(r31)         # fadeTimer = 0xff
b       .end
.else:
lha     r0, 4(r31)
ori     r0, r0, 16384      # flags |= 0x4000     (set one bit)
sth     r0, 4(r31)
.end:
\`\`\`

Reading \`rlwinm r3, r3, 0, 18, 16\` back: the fields are
\`rlwinm rA, rS, SH, MB, ME\` — rotate by \`SH\`=0 (no rotate), then keep the bits
from \`MB\`=18 through \`ME\`=16 *wrapping* (because MB > ME), which is every bit
except the one at MSB-position 17, i.e. \`0x4000\`. So this is exactly
\`flags &= ~0x4000\`. The contrast \`rlwinm\` (clear) vs \`ori\` (set) is the lesson:
same flag, two different mask idioms, and a different C expression like
\`&= 0xbfff\` would emit \`andi\` and miss the match.

## Your task

With the struct above, write \`crfueltank_tick\`. If \`timerCountDown(&obj->timer)\`
is nonzero, enable hits, **clear** the \`0x4000\` flag, and set \`fadeTimer\` to
\`0xff\`. Otherwise, **set** the \`0x4000\` flag. Keep the \`(s16)\` casts.
`,
    symbol: "crfueltank_tick",
    context: `typedef struct { f32 timer; s16 flags; u8 fadeTimer; u8 pad; } CrFuelTankObject;
extern int timerCountDown(f32* t);
extern void ObjHits_EnableObject(CrFuelTankObject* o);`,
    starter: `void crfueltank_tick(CrFuelTankObject* obj) {
    // branch on the timer; clear vs set the 0x4000 flag
}
`,
    solution: `void crfueltank_tick(CrFuelTankObject* obj) {
    if (timerCountDown(&obj->timer) != 0) {
        ObjHits_EnableObject(obj);
        obj->flags = (s16)(obj->flags & ~0x4000);
        obj->fadeTimer = 0xff;
    } else {
        obj->flags = (s16)(obj->flags | 0x4000);
    }
}
`,
    hints: [
      "Clear the bit with `flags & ~0x4000` (→ `rlwinm`), never `& 0xbfff` (→ `andi`).",
      "Set the bit with `flags | 0x4000` (→ `ori`).",
      "Wrap both in `(s16)(...)` so the field stays halfword-wide and reads/writes with `lha`/`sth`.",
    ],
  },
  {
    id: "mastery-clamp-health",
    chapter: "mastery",
    order: 4,
    title: "Clamping a Float Into Range",
    difficulty: 4,
    concepts: ["float", "control-flow", "fcmpo", "fmr"],
    brief: `
# The two-sided clamp

A staple of every game update loop: add a delta, then pin the result between a
floor and a ceiling. SFA does this all over its health, timer, and fade code.
The shape is two independent \`if\`s, each comparing a float and conditionally
overwriting it.

\`\`\`c
typedef struct { f32 health; f32 maxHealth; } Actor;
extern f32 lbl_zero;
\`\`\`

A floating compare that feeds a branch becomes \`fcmpo\` plus a conditional jump,
and "replace the value" is the register-move \`fmr\`. No memory round-trips
between the clamps — the candidate stays live in \`f1\`:

\`\`\`asm
lfs     f0, 0(r3)          # a->health
lfs     f2, lbl_zero
fadds   f1, f0, f1         # h = health + amount
fcmpo   cr0, f1, f2        # h < 0 ?
bge-    .lo_ok
fmr     f1, f2             #   h = 0
.lo_ok:
lfs     f0, 4(r3)          # a->maxHealth
fcmpo   cr0, f1, f0        # h > max ?
ble-    .hi_ok
fmr     f1, f0             #   h = max
.hi_ok:
stfs    f1, 0(r3)          # a->health = h
blr
\`\`\`

Two things to internalize. First, \`h < lbl_zero\` compiles to \`fcmpo\` + \`bge-\`
(the *opposite* condition skips the assignment) — that inversion is normal.
Second, \`fmr\` is just "this float now equals that one"; a lone \`fmr\` guarded by
a float compare is almost always a clamp arm.

One trap: the floor here is the *external* \`lbl_zero\`, not the literal \`0.0f\`.
The original loads the floor from a named label (\`lfs f2, lbl_zero\`); writing
\`0.0f\` instead makes MWCC synthesize the zero from its own constant pool — a
different load (and a different register assignment) that looks cleaner but will
not match. Always use \`lbl_zero\` where the data tells you the constant lived in
a named symbol.

## Your task

With the struct above, write \`actor_clampHealth\`: compute
\`a->health + amount\`, clamp it below by \`lbl_zero\` and above by
\`a->maxHealth\`, then store it back into \`a->health\`.
`,
    symbol: "actor_clampHealth",
    context: `typedef struct { f32 health; f32 maxHealth; } Actor;
extern f32 lbl_zero;`,
    starter: `void actor_clampHealth(Actor* a, f32 amount) {
    // h = health + amount; clamp to [lbl_zero, maxHealth]; store back
}
`,
    solution: `void actor_clampHealth(Actor* a, f32 amount) {
    f32 h = a->health + amount;
    if (h < lbl_zero) {
        h = lbl_zero;
    }
    if (h > a->maxHealth) {
        h = a->maxHealth;
    }
    a->health = h;
}
`,
    hints: [
      "Keep the running value in one local `h` so it stays in `f1` across both clamps.",
      "Each `if` is an `fcmpo` plus a branch on the inverted condition, then an `fmr`.",
      "Store back only once at the end with `stfs f1, 0(r3)`.",
    ],
  },
  {
    id: "mastery-cloudrace-oncomplete",
    chapter: "mastery",
    order: 5,
    title: "A Loop Over an Event Array",
    difficulty: 4,
    concepts: ["loops", "arrays", "calls", "bitmask"],
    brief: `
# Scanning anim events

This is SFA's \`crcloudrace_completionCallback\` in miniature: set a state flag,
then walk an array of event ids, firing a burst of game-bit calls whenever a
matching event shows up. It's the canonical "loop with an indexed load and a
conditional call body" capstone.

\`\`\`c
typedef struct { int eventCount; int* eventIds; } AnimUpdate;
typedef struct { u32 flags; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern void loadMapAndParent(int map);
\`\`\`

The flag OR is a plain \`ori\`. The loop keeps a byte-offset cursor in one
register and the counter in another; the element fetch is the indexed load
\`lwzx\`. MWCC emits the classic "jump to the test first" loop layout:

\`\`\`asm
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
\`\`\`

The takeaways: \`lwzx rD, rA, rB\` is the array-element load whose index register
\`r31\` holds the *byte* offset \`i*4\`, not \`i\` itself. From the plain C
\`upd->eventIds[i]\`, MWCC manufactures a second induction variable — a byte
cursor it bumps with \`addi r31, r31, 4\` — alongside the real counter
\`addi r30, r30, 1\`, precisely to avoid a \`mulli\` every iteration. That's why you
see *two* increments at \`.next\` for a loop with one visible variable. The loop
condition is then checked at the **bottom** with the body reached by an initial
\`b .test\`. That entry jump is how MWCC compiles a \`for\` whose count might be
zero.

## Your task

With the structs above, write \`crcloudrace_onComplete\`: OR \`0x40\` into
\`state->flags\`, then for each \`i\` in \`[0, eventCount)\`, if \`eventIds[i] == 0x12\`,
call \`GameBit_Set(0x73, 1)\`, \`GameBit_Set(0x74, 0)\`, and
\`loadMapAndParent(0x1d)\`. Return \`0\`.
`,
    symbol: "crcloudrace_onComplete",
    context: `typedef struct { int eventCount; int* eventIds; } AnimUpdate;
typedef struct { u32 flags; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern void loadMapAndParent(int map);`,
    starter: `int crcloudrace_onComplete(RaceObject* obj, AnimUpdate* upd) {
    // flags |= 0x40; loop the event ids; fire calls on a match
    return 0;
}
`,
    solution: `int crcloudrace_onComplete(RaceObject* obj, AnimUpdate* upd) {
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
`,
    hints: [
      "`state->flags |= 0x40;` is a load / `ori 64` / store.",
      "`upd->eventIds[i]` is an indexed load `lwzx` driven by a `i*4` cursor.",
      "Write it as a normal `for` — MWCC enters via `b .test` and checks the count at the bottom.",
    ],
  },
  {
    id: "mastery-asteroid-orbit",
    chapter: "mastery",
    order: 6,
    title: "Orbital Math: fmadds, fdivs, and Saved Float Registers",
    difficulty: 4,
    concepts: ["float", "fmadds", "calls", "paired-single"],
    brief: `
# A per-frame float workout

This is the most float-heavy capstone yet, distilled from SFA's
\`worldasteroids_update\`. An asteroid spins on three axes and orbits an anchor
object; computing its position calls into trig approximations and an int-to-float
helper, then fuses everything with multiply-adds.

\`\`\`c
typedef struct {
    s16 rotStepX; s16 rotStepY; s16 rotStepZ;
    u16 orbitAngle; s32 orbitRadius;
} AsteroidState;
typedef struct {
    AsteroidState* state;
    f32 posX; f32 posY; f32 posZ;
    s16 rotX; s16 rotY; s16 rotZ;
} AsteroidObject;
extern AsteroidObject* ObjList_FindObjectById(int id);
extern f32 fsin16Approx(u16 a);
extern f32 fcos16Approx(u16 a);
extern f32 s32AsFloat(s32 v);
extern f32 lbl_orbitStep;
extern u16 lbl_tilt;
\`\`\`

Three forces converge here. **(1)** Because the function holds float values
across calls, MWCC saves \`f30\`/\`f31\` using **paired-single** \`psq_st\`/\`psq_l\`
in the prologue/epilogue — a GameCube-only idiom. **(2)** \`a + b*c\` collapses
into a single fused \`fmadds\`. **(3)** Advancing the angle divides a float and
converts to int with \`fdivs\` then \`fctiwz\`:

\`\`\`asm
psq_st  f31, 56(r1), 0, 0  # save callee float regs (paired-single)
...
fdivs   f0, f0, f1         # lbl_orbitStep / radius
fctiwz  f0, f0             # -> integer
...
fmuls   f1, f1, f31
lfs     f0, 4(r31)         # anchor->posX
fmadds  f0, f30, f1, f0    # posX = radius*sin*cos + anchor->posX
stfs    f0, 4(r29)
...
\`\`\`

Two helper-call hygiene notes worth keeping in mind: declare the trig helpers as
\`f32 fn(...)\`, **not** \`double\` — a \`double\` return would inject a stray
\`frsp\`. And keep the call order exactly as written: each \`fsin/fcos/s32AsFloat\`
result is consumed before the next call, so the compiler reloads radius between
the X and Z computations rather than caching it.

## Your task

With the structs above, write \`asteroid_orbit\`. Find the anchor by id \`0x64\`;
add each \`rotStep*\` into the matching \`rot*\`; advance \`orbitAngle\` by
\`(u16)(lbl_orbitStep / s32AsFloat(orbitRadius))\`; then set
\`posX = radius*sin(angle)*cos(tilt) + anchor->posX\` and
\`posZ = radius*cos(angle) + anchor->posZ\`, where \`radius = s32AsFloat(orbitRadius)\`.
Crucially, **recompute \`radius = s32AsFloat(orbitRadius)\` immediately before each of
\`posX\` and \`posZ\`**: register pressure across the intervening trig calls means the
compiler reloads it (you'll see a second \`bl s32AsFloat\` rather than a cached value),
and caching it in one local will mismatch. Mirror the call order shown.
`,
    symbol: "asteroid_orbit",
    context: `typedef struct {
    s16 rotStepX; s16 rotStepY; s16 rotStepZ;
    u16 orbitAngle; s32 orbitRadius;
} AsteroidState;
typedef struct {
    AsteroidState* state;
    f32 posX; f32 posY; f32 posZ;
    s16 rotX; s16 rotY; s16 rotZ;
} AsteroidObject;
extern AsteroidObject* ObjList_FindObjectById(int id);
extern f32 fsin16Approx(u16 a);
extern f32 fcos16Approx(u16 a);
extern f32 s32AsFloat(s32 v);
extern f32 lbl_orbitStep;
extern u16 lbl_tilt;`,
    starter: `void asteroid_orbit(AsteroidObject* obj) {
    // spin on three axes, then orbit the anchor with trig + fmadds
}
`,
    solution: `void asteroid_orbit(AsteroidObject* obj) {
    AsteroidState* state;
    AsteroidObject* anchor;
    f32 radius, s, c;
    state = obj->state;
    anchor = ObjList_FindObjectById(0x64);
    obj->rotX += state->rotStepX;
    obj->rotY += state->rotStepY;
    obj->rotZ += state->rotStepZ;
    state->orbitAngle += (u16)(lbl_orbitStep / s32AsFloat(state->orbitRadius));
    c = fcos16Approx(lbl_tilt);
    s = fsin16Approx(state->orbitAngle);
    radius = s32AsFloat(state->orbitRadius);
    obj->posX = radius * s * c + anchor->posX;
    c = fcos16Approx(state->orbitAngle);
    radius = s32AsFloat(state->orbitRadius);
    obj->posZ = radius * c + anchor->posZ;
}
`,
    hints: [
      "Declare the trig/convert helpers as `f32 fn(...)` so no spurious `frsp` appears.",
      "`a + b * c` written in that order fuses into one `fmadds`.",
      "Recompute `radius = s32AsFloat(...)` before each position component, matching the call sequence.",
      "The `psq_st`/`psq_l` pairs in the prologue/epilogue are MWCC saving the callee `f30`/`f31` as one 64-bit paired-single write instead of two `stfs` — it's automatic, so don't try to reproduce it in your C.",
    ],
  },
  {
    id: "mastery-race-advance",
    chapter: "mastery",
    order: 7,
    title: "A Phase State Machine",
    difficulty: 4,
    concepts: ["switch", "control-flow", "calls", "float"],
    brief: `
# switch becomes a comparison tree

SFA's race objects are driven by a \`phase\` integer and a big \`switch\`. With a
handful of small, contiguous cases MWCC does **not** build a jump table — it
emits a *binary search* of \`cmpwi\`/branch, which is one of the most disorienting
shapes to read back into a clean \`switch\`. The jump table only appears once the
case count grows (roughly five or more dense, contiguous labels); below that
threshold you get the comparison tree, so don't expect a table on every switch.

\`\`\`c
typedef struct { int phase; f32 timer; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern int GameBit_Get(int bit);
extern int timerCountDown(f32* t);
extern void s16toFloat(f32* t, int frames);
\`\`\`

Watch how the dispatch pivots on \`2\`, then narrows:

\`\`\`asm
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
\`\`\`

The body of each case is ordinary: \`GameBit_Get\`/\`Set\` calls, a \`stw\` to update
\`phase\`, and in case 2 a \`timerCountDown\` guard. A useful habit here: rather than
reverse-engineering the comparison tree by hand, write the
plain \`switch\` with the cases in numeric order and a \`default\`, and MWCC
regenerates this exact pivot structure for you.

## Your task

With the structs above, write \`race_advance\` switching on \`s->phase\`:
- **0:** if \`GameBit_Get(0x10)\`, \`GameBit_Set(0x11, 1)\` and go to phase 1.
- **1:** \`GameBit_Set(0x12, 0)\`, go to phase 2, \`s16toFloat(&s->timer, 0x708)\`.
- **2:** if \`timerCountDown(&s->timer)\`, go to phase 3.
- **3:** and **default:** go to phase 0.
`,
    symbol: "race_advance",
    context: `typedef struct { int phase; f32 timer; } RaceState;
typedef struct { RaceState* state; } RaceObject;
extern void GameBit_Set(int bit, int val);
extern int GameBit_Get(int bit);
extern int timerCountDown(f32* t);
extern void s16toFloat(f32* t, int frames);`,
    starter: `void race_advance(RaceObject* obj) {
    // switch on s->phase across cases 0..3 with a default
}
`,
    solution: `void race_advance(RaceObject* obj) {
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
`,
    hints: [
      "Write a plain `switch (s->phase)` with cases 0..3 in order plus a `default`.",
      "Don't hand-roll the `cmpwi` pivot tree — the compiler builds it from the ordered cases.",
      "Each `s->phase = N;` is a `li`/`stw`; the case-2 guard is `timerCountDown` feeding a `cmpwi`/`beq`.",
    ],
  },
  {
    id: "mastery-spellstone-step",
    chapter: "mastery",
    order: 8,
    title: "A Per-Frame Update: Rotation, a Flag, and a Branch",
    difficulty: 5,
    concepts: ["structs", "control-flow", "bitmask", "calls"],
    brief: `
# The shape of an update function

A trimmed \`spellstone_update\`: every frame the object maybe-spins, checks a game
bit, and routes through an if/else of helper calls. This is the first capstone
where you juggle a *saved base pointer* (\`r30\`) across multiple calls while the
state pointer lives in \`r31\`.

\`\`\`c
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
\`\`\`

The \`state\` field is a \`u8\`, so its compares are **unsigned** \`cmplwi\` — exactly
the SFA rule that compare width tracks the operand type. Spinning is a \`+= 0x100\`
on the \`s16\` rotation field; the flag is set with \`ori 0x4000\`:

\`\`\`asm
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
\`\`\`

(The \`rotY = 0\` and \`rotZ = 0\` stores are elided from the excerpt above for
brevity — only the \`rotX += 0x100\` line is shown — but your solution still needs
all three.)

The instructive detail: typing \`state\` as \`u8\` is what makes those compares
\`cmplwi\` instead of \`cmpwi\`. Get the field type wrong and the branch opcode
mismatches even though the logic is identical.

## Your task

With the structs above, write \`spellstone_step\`. If \`state->state == 2\`, set
\`rotY = 0\`, \`rotX += 0x100\`, \`rotZ = 0\`. Then if \`GameBit_Get(def->completeEvent)\`
is nonzero, OR \`0x4000\` into \`flags\` and call \`Obj_RemoveFromUpdateList(obj)\`;
otherwise call \`ObjHits_DisableObject\` when \`state->state == 0\`, else
\`ObjHits_EnableObject\`. Keep \`(s16)\` on the flag write.
`,
    symbol: "spellstone_step",
    context: `typedef struct { u8 state; } SpellState;
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
extern void ObjHits_DisableObject(GameObject* o);`,
    starter: `void spellstone_step(GameObject* obj) {
    // maybe spin; then branch on the complete event
}
`,
    solution: `void spellstone_step(GameObject* obj) {
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
`,
    hints: [
      "Type `state` as `u8` so its compares come out as unsigned `cmplwi`, not `cmpwi`.",
      "`rotX += 0x100` on the `s16` field is `lha` / `addi 256` / `sth`.",
      "`flags |= 0x4000` with the `(s16)` cast keeps it halfword-wide (`ori`).",
    ],
  },
  {
    id: "mastery-tank-hitdetect",
    chapter: "mastery",
    order: 9,
    title: "Guarded Hit Detection: NULL Chains and a Type Check",
    difficulty: 5,
    concepts: ["control-flow", "structs", "float", "calls"],
    brief: `
# Early-out guards stacked deep

This is SFA's \`crfueltank_hitDetect\`, faithfully shaped: three nested guards
(two NULL checks and a magic type-id check) all funnel to the **same exit**, and
only the innermost block does the work — disable hits, set status bytes, fire a
game bit behind a \`!= -1\` guard, and copy a biased position.

\`\`\`c
typedef struct { f32 posX; f32 posY; f32 posZ; s16 objType; } HitObj;
typedef struct { HitObj* hitObj; } Collider;
typedef struct { int hitEvent; } TankDef;
typedef struct {
    Collider* collider; TankDef* def;
    f32 posX; f32 posY; f32 posZ;
    u8 fadeTimer; u8 triggered;
} TankObject;
extern void ObjHits_DisableObject(TankObject* o);
extern void GameBit_Set(int e, int v);
extern f32 lbl_yBias;
\`\`\`

The key recognition skill is that a chain of \`&&\`-guards becomes a *cascade of
\`beq-\`/\`bne-\` to one shared label*, not nested basic blocks:

\`\`\`asm
lwz     r4, 0(r3)          # collider
lwz     r30, 4(r3)         # def
cmplwi  r4, 0
beq-    .out               # collider == NULL
lwz     r31, 0(r4)         # collider->hitObj
cmplwi  r31, 0
beq-    .out               # hitObj == NULL
lha     r0, 12(r31)
cmpwi   r0, 908            # hitObj->objType == 0x38c ?
bne-    .out
...                        # the work block
lwz     r3, 0(r30)
cmpwi   r3, -1             # def->hitEvent != -1 ?
beq-    .skipbit
li      r4, 1
bl      GameBit_Set
.skipbit:
lfs     f0, 0(r31)         # copy position, Y gets lbl_yBias
...
.out:
\`\`\`

The magic number is a tell: a lone \`cmpwi r0, 908\` against a halfword field is a
type/id check — the kind of constant you'd later name with an enum. And the
\`!= -1\` sentinel guard producing \`cmpwi r3, -1\` / \`beq-\` is the everyday way SFA
skips an optional event.

It doesn't matter whether you write all three guards as one flat
\`collider != NULL && collider->hitObj != NULL && hitObj->objType == 0x38c\` or
split the type check into its own nested \`if\` (as the solution does to name the
\`hitObj\` local): both lower to the *same* cascade of \`beq-\`/\`bne-\` to the shared
exit, so pick whichever reads clearest.

## Your task

With the structs above, write \`tank_hitDetect\`. Read \`collider\` and \`def\`. Only
when \`collider != NULL\` **and** \`collider->hitObj != NULL\` **and**
\`hitObj->objType == 0x38c\`: call \`ObjHits_DisableObject(obj)\`, set \`fadeTimer\` to
\`0xfa\` and \`triggered\` to \`1\`, call \`GameBit_Set(def->hitEvent, 1)\` only if
\`hitEvent != -1\`, then copy \`hitObj\`'s position onto \`obj\` with \`lbl_yBias\` added
to \`Y\`.
`,
    symbol: "tank_hitDetect",
    context: `typedef struct { f32 posX; f32 posY; f32 posZ; s16 objType; } HitObj;
typedef struct { HitObj* hitObj; } Collider;
typedef struct { int hitEvent; } TankDef;
typedef struct {
    Collider* collider; TankDef* def;
    f32 posX; f32 posY; f32 posZ;
    u8 fadeTimer; u8 triggered;
} TankObject;
extern void ObjHits_DisableObject(TankObject* o);
extern void GameBit_Set(int e, int v);
extern f32 lbl_yBias;`,
    starter: `void tank_hitDetect(TankObject* obj) {
    // guard on collider/hitObj/type, then do the work
}
`,
    solution: `void tank_hitDetect(TankObject* obj) {
    Collider* collider = obj->collider;
    TankDef* def = obj->def;
    if (collider != NULL && collider->hitObj != NULL) {
        HitObj* hitObj = collider->hitObj;
        if (hitObj->objType == 0x38c) {
            ObjHits_DisableObject(obj);
            obj->fadeTimer = 0xfa;
            obj->triggered = 1;
            if (def->hitEvent != -1) {
                GameBit_Set(def->hitEvent, 1);
            }
            obj->posX = hitObj->posX;
            obj->posY = lbl_yBias + hitObj->posY;
            obj->posZ = hitObj->posZ;
        }
    }
}
`,
    hints: [
      "The `&&` guard chain compiles to several `cmplwi`/`beq-` all jumping to the shared exit.",
      "`objType == 0x38c` reads the `s16` with `lha` then `cmpwi r0, 908`.",
      "Guard the game bit with `if (def->hitEvent != -1)` → `cmpwi r3, -1` / `beq-`.",
    ],
  },
  {
    id: "mastery-mine-reset",
    chapter: "mastery",
    order: 10,
    title: "The Capstone: A Full Reset-to-Idle",
    difficulty: 5,
    concepts: ["calls", "structs", "float", "fmadds", "control-flow"],
    brief: `
# Everything at once

The finale is SFA's \`proximitymine_resetToIdle\`, reshaped to compile
standalone — and it earns its place: **nine** helper calls, struct writes
through a saved state pointer, a fused float expression feeding a 9-argument
call, and a closing NULL-guarded free. If you can match this, you can match real
game code.

\`\`\`c
typedef struct {
    f32 renderTimer; f32 resetTimer; int mode;
    f32 triggerDistance; void* effectHandle;
} MineState;
typedef struct {
    MineState* state;
    f32 velocityX; f32 velocityY; f32 velocityZ;
} MineObject;
extern void* Obj_GetPlayerObject(void);
extern void Sfx_StopFromObject(u32 obj, int id);
extern void Sfx_PlayFromObject(u32 obj, int id);
extern void storeZeroToFloatParam(f32* p);
extern void s16toFloat(f32* p, s16 v);
extern void ObjHits_EnableObject(u32 obj);
extern void ObjHits_MarkObjectPositionDirty(int obj);
extern void fn_lightUpdate(MineObject* obj, f32 v);
extern void spawnExplosion(MineObject* obj, f32 scale,
                           int a, int b, int c, int d, int e, int f, int g);
extern void modelLightStruct_freeSlot(void** handle);
extern f32 lbl_zero, lbl_light, lbl_base, lbl_bias, lbl_distScale;
\`\`\`

The signature stretch is the explosion call. \`dist * lbl_distScale + lbl_base\`
fuses into one \`fmadds\`, and the seven trailing \`int\` constants each get their
own \`li\` into \`r4..r10\` — a wall of immediates that is the fingerprint of a
many-argument call:

\`\`\`asm
lfs     f2, 12(r31)        # state->triggerDistance
lfs     f0, lbl_bias
lfs     f1, lbl_distScale
fsubs   f2, f2, f0         # dist = triggerDistance - lbl_bias
lfs     f0, lbl_base
li      r6, 0
li      r7, 1
...
fmadds  f1, f2, f1, f0     # dist*scale + base  -> the float arg
li      r10, 0
bl      spawnExplosion
\`\`\`

Three things make or break the match. **(1)** Storing the *same* zero to two
velocity fields reuses one loaded \`f0\` — write \`zero = lbl_zero;\` to a local and
assign it twice. **(2)** Passing \`&state->effectHandle\` to the free routine
takes the field's *address* (\`addi r3, r31, 16\`), guarded by a NULL test of the
value. **(3)** Keep the call order exactly: the result of \`fn_lightUpdate\`
matters for scheduling, and the explosion's scale is computed inline right
before the call.

## Your task

With the structs above, write \`mine_resetToIdle\` reproducing the sequence:
call \`Obj_GetPlayerObject()\`; stop sfx \`0x2e9\` and \`0x2e8\`, play \`0xf1\`; zero
\`velocityX\`/\`velocityZ\` from \`lbl_zero\` (\`velocityY\` is deliberately **not**
zeroed in the original — only X and Z); \`storeZeroToFloatParam(&state->renderTimer)\`
then \`s16toFloat(&state->renderTimer, 10)\`; set \`mode = 0\`; enable hits and mark
position dirty; zero \`resetTimer\`; \`fn_lightUpdate(obj, lbl_light)\`; spawn the
explosion with scale \`(triggerDistance - lbl_bias) * lbl_distScale + lbl_base\`
and args \`1,1,0,1,0,1,0\`; enable hits again; and if \`effectHandle != NULL\`, free
it via \`&state->effectHandle\`.
`,
    symbol: "mine_resetToIdle",
    context: `typedef struct {
    f32 renderTimer; f32 resetTimer; int mode;
    f32 triggerDistance; void* effectHandle;
} MineState;
typedef struct {
    MineState* state;
    f32 velocityX; f32 velocityY; f32 velocityZ;
} MineObject;
extern void* Obj_GetPlayerObject(void);
extern void Sfx_StopFromObject(u32 obj, int id);
extern void Sfx_PlayFromObject(u32 obj, int id);
extern void storeZeroToFloatParam(f32* p);
extern void s16toFloat(f32* p, s16 v);
extern void ObjHits_EnableObject(u32 obj);
extern void ObjHits_MarkObjectPositionDirty(int obj);
extern void fn_lightUpdate(MineObject* obj, f32 v);
extern void spawnExplosion(MineObject* obj, f32 scale,
                           int a, int b, int c, int d, int e, int f, int g);
extern void modelLightStruct_freeSlot(void** handle);
extern f32 lbl_zero, lbl_light, lbl_base, lbl_bias, lbl_distScale;`,
    starter: `void mine_resetToIdle(MineObject* obj) {
    // the full reset: sfx, velocity, timers, mode, hits, explosion, free
}
`,
    solution: `void mine_resetToIdle(MineObject* obj) {
    MineState* state;
    f32 zero;
    state = obj->state;
    Obj_GetPlayerObject();
    Sfx_StopFromObject((u32)obj, 0x2e9);
    Sfx_StopFromObject((u32)obj, 0x2e8);
    Sfx_PlayFromObject((u32)obj, 0xf1);
    zero = lbl_zero;
    obj->velocityX = zero;
    obj->velocityZ = zero;
    storeZeroToFloatParam(&state->renderTimer);
    s16toFloat(&state->renderTimer, 10);
    state->mode = 0;
    ObjHits_EnableObject((u32)obj);
    ObjHits_MarkObjectPositionDirty((int)obj);
    storeZeroToFloatParam(&state->resetTimer);
    fn_lightUpdate(obj, lbl_light);
    {
        f32 dist = state->triggerDistance - lbl_bias;
        spawnExplosion(obj, dist * lbl_distScale + lbl_base, 1, 1, 0, 1, 0, 1, 0);
    }
    ObjHits_EnableObject((u32)obj);
    if (state->effectHandle != NULL) {
        modelLightStruct_freeSlot(&state->effectHandle);
    }
}
`,
    hints: [
      "Load `lbl_zero` into a local `zero` and assign it to both velocity fields so one `lfs` is reused.",
      "Compute `dist = triggerDistance - lbl_bias`, then `dist * lbl_distScale + lbl_base` fuses into `fmadds`.",
      "`ObjHits_EnableObject` is called *twice* on purpose — once before the explosion and once after; keep both, don't collapse them.",
      "The free takes the field address `&state->effectHandle` and is guarded by `if (state->effectHandle != NULL)`.",
    ],
  },
  {
    id: "mastery-tumbler-integratespin",
    chapter: "mastery",
    order: 11,
    title: "peephole off: When You Must Write the (s16) Cast Yourself",
    difficulty: 5,
    concepts: ["peephole", "narrow-types", "float", "fmadds", "int-to-float"],
    brief: `
# The cleanup pass is gone — narrow it yourself

This is the rotation-integration tail of SFA's \`tumbleweed_updateRollingMotion\`,
the function that earned a match by flipping \`#pragma peephole on\` to **off** and
rewriting three rotation-field stores as direct \`(s16)\` casts. It's the clearest
demonstration of how \`peephole off\` changes the *C you must write*, not just the
asm you read.

\`\`\`c
typedef struct { s16 spinX; s16 spinY; s16 spinZ; } GameObject;
typedef struct { s16 rateX; s16 rateY; s16 rateZ; } RollState;
\`\`\`

Each axis integrates an \`s16\` angular rate into an \`s16\` angle:
\`spin += rate * timeDelta\`. Both fields are \`s16\`, so each one is read with
\`lha\`, promoted to float, fused, and truncated back. MWCC's int-to-float has no
native instruction here — it builds a double from a magic constant
(\`lis r5, 17200\` / \`xoris rX, rX, 32768\` / \`lfd\` / \`fsubs\`), then the
\`rate*timeDelta + spin\` collapses into one \`fmadds\`:

\`\`\`asm
lha     r6, 0(r4)          # state->rateX
lha     r0, 0(r3)          # obj->spinX
xoris   r6, r6, 32768      # int -> double (magic-constant idiom)
xoris   r0, r0, 32768
lfd     f3, @@6(0)
fsubs   f2, f0, f3         # rate as float
fsubs   f0, f0, f3         # spin as float
fmadds  f0, f2, f1, f0     # rate*timeDelta + spin   (one fused op)
fctiwz  f0, f0             # -> integer
stfd    f0, 24(r1)
lwz     r0, 28(r1)
sth     r0, 0(r3)          # store back as s16 — NO extsh before it
\`\`\`

The decisive detail is what is **missing**: there is no \`extsh r0, r0\` between
the \`lwz\` and the \`sth\`. That mask only disappears for one of two reasons —
either the Peepholer deletes it, or you never emit it in the first place. Under
\`peephole off\` the Peepholer is disabled, so the *only* way to get a clean \`sth\`
is to write the narrowing yourself.

Route the result through an \`int\` local first —
\`int v = (int)(...); obj->spinX = v;\` — and MWCC dutifully emits \`extsh r0, r0\`
before every \`sth\`. With \`peephole on\` those \`extsh\`s vanish (the Peepholer
removes the redundant sign-extend); with \`peephole off\` they **survive** and the
function won't match. Casting the store expression directly,
\`obj->spinX = (s16)(...)\`, narrows it in the IR so no \`extsh\` is ever generated —
and that is exactly the edit the real match made.

## Your task

With the structs above, write \`tumbler_integrateSpin\` under \`#pragma peephole off\`.
For each of X, Y, Z, integrate the rate into the angle to match the assembly above.
Cast directly on the store value — do **not** route through an \`int\` local, or the
\`extsh\` masks will reappear and break the match.
`,
    symbol: "tumbler_integrateSpin",
    context: `typedef struct { s16 spinX; s16 spinY; s16 spinZ; } GameObject;
typedef struct { s16 rateX; s16 rateY; s16 rateZ; } RollState;`,
    starter: `#pragma peephole off
void tumbler_integrateSpin(GameObject* obj, RollState* state, f32 timeDelta) {
    // spin += rate * timeDelta, per axis, narrowed back to s16
}
`,
    solution: `#pragma peephole off
void tumbler_integrateSpin(GameObject* obj, RollState* state, f32 timeDelta) {
    obj->spinX = (s16)((f32)(int)state->rateX * timeDelta + (f32)(int)obj->spinX);
    obj->spinY = (s16)((f32)(int)state->rateY * timeDelta + (f32)(int)obj->spinY);
    obj->spinZ = (s16)((f32)(int)state->rateZ * timeDelta + (f32)(int)obj->spinZ);
}
`,
    hints: [
      "Put `#pragma peephole off` at the top of the function's translation unit — the lever is that the cleanup pass is gone.",
      "Cast the whole store expression with `(s16)(...)`. Don't compute into an `int` local first — that emits an `extsh` the disabled Peepholer can no longer delete.",
      "`(f32)(int)rate * timeDelta + (f32)(int)spin` fuses into a single `fmadds`; the int-to-float `xoris ...,32768` / `lfd` / `fsubs` magic-constant sequence is automatic.",
    ],
  },
  {
    id: "mastery-voxmap-choosedir",
    chapter: "mastery",
    order: 11.3,
    title: "Two Running Sums, Woven by Hand: Steering the ,p Scheduler",
    difficulty: 5,
    concepts: ["scheduling", "instruction-order", "accumulation", "interleaving"],
    brief: `
# When the scheduler needs you to interleave

The optimization chapter taught you that \`-O4,p\` scheduling will happily batch
two independent computations — write \`(a+b)*(c+d)\` and the four loads issue
together. That works when there's one short dependency chain. This lesson is the
case where the scheduler alone is **not** enough, lifted from Star Fox
Adventures' \`voxmapsFn_80010ff4\` (the voxel route-picker).

That function compares two neighbouring voxel columns by summing four occupancy
bytes each — \`sumCur\` over one column, \`sumNext\` over the next — and picks the
denser direction. The two sums are completely data-independent, so in principle
the scheduler can run them in lockstep. The trap: **how you spell the
accumulation decides the emission order, and emission order seeds the schedule.**

Written as two flat expressions —

\`\`\`c
sumCur  = occ[0][0] + occ[0][1] + occ[0][2] + occ[0][3];
sumNext = occ[1][0] + occ[1][1] + occ[1][2] + occ[1][3];
\`\`\`

— the front end materializes all of \`sumCur\`'s chain, then all of \`sumNext\`'s.
The \`,p\` scheduler reorders from *that* seed and produces a load layout that
reads \`2(r3), 1(r3), 6(r3), 5(r3), 3(r3) …\` with a spare third register — and it
does **not** byte-match the target.

The real commit fixed it by weaving the two running sums together, one term at a
time:

\`\`\`c
sumCur  = occ[0][0];
sumNext = occ[1][0];
sumCur  += occ[0][1];
sumNext += occ[1][1];
sumCur  += occ[0][2];
sumNext += occ[1][2];
sumCur  += occ[0][3];
sumNext += occ[1][3];
\`\`\`

Now the two accumulators advance in lockstep and the schedule comes out clean —
loads in offset order, the two sum registers built up alternately:

\`\`\`asm
lbz   r6, 0(r3)          # sumCur  <- occ[0][0]
lbz   r0, 1(r3)          # (occ[0][1])
lbz   r7, 4(r3)          # sumNext <- occ[1][0]
lbz   r4, 5(r3)          # (occ[1][1])
add   r6, r6, r0         # sumCur  += occ[0][1]
lbz   r0, 2(r3)
add   r7, r7, r4         # sumNext += occ[1][1]
lbz   r5, 6(r3)
add   r6, r6, r0         # sumCur  += occ[0][2]
lbz   r4, 3(r3)
lbz   r0, 7(r3)
add   r7, r7, r5         # sumNext += occ[1][2]
add   r6, r6, r4         # sumCur  += occ[0][3]
add   r7, r7, r0         # sumNext += occ[1][3]
xor   r0, r7, r6         # branchless sumCur >= sumNext ? 0 : 1
srawi r3, r0, 1
and   r0, r0, r7
subf  r0, r0, r3
srwi  r3, r0, 31
blr
\`\`\`

\`r6\` (sumCur) and \`r7\` (sumNext) climb in strict alternation, and the loads come
in column-then-column order \`0,1,4,5,2,6,3,7\`. That lockstep is the signature of
a *hand-interleaved* two-accumulator sum. There is no pragma — scheduling is on,
as always at \`-O4,p\`; the lever is the **C shape** that feeds it.

> Why doesn't the scheduler produce this from the flat form? Its priority order
> is built on the dependency DAG seeded by emission order, and the flat form
> emits one whole chain before the other. The scheduler interleaves *within* the
> seed it's given; it won't re-found the chains. You hand it the weave by writing
> the weave.

## Your task

Sum the four bytes of \`scan->occ[0]\` into \`sumCur\` and the four bytes of
\`scan->occ[1]\` into \`sumNext\`, then return \`0\` if \`sumCur >= sumNext\`, else \`1\`.
To match the lockstep schedule above you must **interleave the two accumulations
term by term** — not write two flat \`a+b+c+d\` sums.
`,
    symbol: "voxmap_chooseDir",
    context: `typedef struct { u8 occ[2][4]; } VoxScan;`,
    starter: `int voxmap_chooseDir(VoxScan* scan) {
    int sumCur, sumNext;
    // Interleave the two 4-term sums, then return sumCur >= sumNext ? 0 : 1
    return 1;
}
`,
    solution: `int voxmap_chooseDir(VoxScan* scan) {
    int sumCur, sumNext;
    sumCur = scan->occ[0][0];
    sumNext = scan->occ[1][0];
    sumCur += scan->occ[0][1];
    sumNext += scan->occ[1][1];
    sumCur += scan->occ[0][2];
    sumNext += scan->occ[1][2];
    sumCur += scan->occ[0][3];
    sumNext += scan->occ[1][3];
    if (sumCur >= sumNext) {
        return 0;
    }
    return 1;
}
`,
    hints: [
      "Declare both accumulators, then seed each with its first byte: `sumCur = scan->occ[0][0]; sumNext = scan->occ[1][0];`.",
      "Add the remaining three terms in lockstep — one `sumCur += ...;` immediately followed by the matching `sumNext += ...;`. Do NOT collapse either sum into a single `a+b+c+d` expression; that changes the emission order and the scheduler picks a different load layout.",
      "The `return sumCur >= sumNext ? 0 : 1;` part is the branchless `xor`/`srawi`/`and`/`subf`/`srwi` tail — let the compiler write it.",
    ],
  },
  {
    id: "mastery-targetblock-scorehit",
    chapter: "mastery",
    order: 11.5,
    title: "Param Inversion: Who Gets the Saved Register",
    difficulty: 5,
    concepts: ["register-coloring", "saved-registers", "live-range", "calls", "narrow-types"],
    brief: `
# Hoist the value, kill the pointer

This is the lever behind SFA's \`dfptargetblock_hitDetect\` match (and its siblings
\`MagicPlant_update\`, \`DFP_Torch_render\`): all three earned a match by changing
**which value MWCC parks in a saved register** — not by renaming anything, but by
changing a *live range*.

Here is the rule from the decompiled allocator. A value gets a **saved** register
(\`r31\`, \`r30\`, …) only when it is live across *every* volatile — classically,
**live across a call**. A value consumed and then dead before the first call
never needs one. So in a function full of \`bl\`s, "who gets \`r31\`?" is decided
entirely by **whose live range spans the calls**.

\`\`\`c
typedef struct { s16 kind; s16 power; } HitInfo;
typedef struct { HitInfo* hit; int score; } TargetBlockObject;
extern int Block_ResolveHit(TargetBlockObject* o);
extern void Block_AwardScore(int kind, int amount);
extern void Block_LogHit(int kind);
\`\`\`

You need \`obj->hit->kind\` (an \`s16\`) at two call sites that come *after* a resolve
call. Read it **once, up front, into a typed local** and the chase \`obj->hit\`
happens immediately — then the parameter \`obj\` is dead, while \`kind\` is the thing
that lives across the calls and lands in \`r31\`:

\`\`\`asm
lwz   r4, 0(r3)          # obj->hit
lha   r31, 0(r4)         # kind = obj->hit->kind   -> SAVED reg r31
bl    @Block_ResolveHit  # obj is already dead here
cmpwi r3, 0
beq-  .+4
mr    r3, r31            # reuse kind from r31
li    r4, 10
bl    @Block_AwardScore
mr    r3, r31            # reuse kind again
bl    @Block_LogHit
\`\`\`

Now watch the inversion. If instead you write the raw deref \`obj->hit->kind\` at
**each** use site, the value is recomputed every time — so it is *not* what's live
across the calls. \`obj\` is, so the param gets stashed (\`mr r31, r3\`) and the value
is re-fetched twice:

\`\`\`asm
mr    r31, r3            # obj parked in SAVED reg r31 instead
bl    @Block_ResolveHit
lwz   r3, 0(r31)         # re-chase obj->hit
lha   r3, 0(r3)          # re-load kind
bl    @Block_AwardScore
lwz   r3, 0(r31)         # ...and again
lha   r3, 0(r3)
bl    @Block_LogHit
\`\`\`

Same logic, same opcodes — but the *occupant of \`r31\` flipped* from the derived
value to the parameter, plus two extra \`lwz\`/\`lha\` reloads appeared. That is the
whole "param-inversion" family of matches: a value **consumed early into a typed
local** colors the local into the saved reg (the source param dies); the **same
value left as raw derefs used throughout** keeps the *pointer* hot and parks *it*
instead. Get this backwards and the function is "right shape, wrong register"
forever.

## Your task

With the structs above, write \`targetblock_scoreHit\`. Read \`obj->hit->kind\` into
a local **first**. Then: if \`Block_ResolveHit(obj)\` is nonzero, call
\`Block_AwardScore(kind, 10)\`; afterwards always call \`Block_LogHit(kind)\`.
Hoisting \`kind\` up front is the match — do **not** re-deref \`obj->hit->kind\` at
the call sites, or \`obj\` (not \`kind\`) lands in \`r31\` and the reloads return.
`,
    symbol: "targetblock_scoreHit",
    context: `typedef struct { s16 kind; s16 power; } HitInfo;
typedef struct { HitInfo* hit; int score; } TargetBlockObject;
extern int Block_ResolveHit(TargetBlockObject* o);
extern void Block_AwardScore(int kind, int amount);
extern void Block_LogHit(int kind);`,
    starter: `void targetblock_scoreHit(TargetBlockObject* obj) {
    // read obj->hit->kind into a local FIRST, then resolve / award / log
}
`,
    solution: `void targetblock_scoreHit(TargetBlockObject* obj) {
    int kind;

    kind = obj->hit->kind;
    if (Block_ResolveHit(obj) != 0) {
        Block_AwardScore(kind, 10);
    }
    Block_LogHit(kind);
}
`,
    hints: [
      "Read `kind = obj->hit->kind;` on the very first line — that chases `obj->hit` (`lwz`) and loads the `s16` (`lha r31, ...`) before any call.",
      "A value lands in a saved register (`r31`) only because it is live across a call. Hoisting `kind` makes *it* the long-lived web, so the param `obj` dies early and never needs a saved reg.",
      "Do not write `obj->hit->kind` again at the call sites — that recomputes it, keeps `obj` live across the calls, parks `obj` in `r31` instead, and re-adds the `lwz`/`lha` reloads.",
    ],
  },
  {
    id: "mastery-blend-accumulate",
    chapter: "mastery",
    order: 11.7,
    title: "Declaration Order Is Register Order: Coloring Saved Regs by Hand",
    difficulty: 5,
    concepts: ["register-allocation", "saved-registers", "declaration-order", "loops", "calls"],
    brief: `
# The order you *declare* locals is the order they get colored

This is the lever behind SFA's \`modelWalkAnimFn_800248b8\` match — the commit whose
entire diff was **four local declarations, reversed**
(\`blendChan, animChan, i, m\` → \`m, i, animChan, blendChan\`), nudging the score
from 88.30 to 88.37 without touching a single line of logic. No casts, no pragmas,
no restructuring: just decl order. It is the purest demonstration that register
allocation in MWCC is *positional*, not semantic.

\`\`\`c
extern int sample(int* p);
extern void emit(int slot, int v);
\`\`\`

Here is the rule, straight from the decompiled allocator. A value is put in a
**callee-saved** register (r31, r30, r29 …) only when it must stay live across a
function call — that is the only time the allocator's "volatiles only" mask runs
dry and it falls back to the saved pool. And it hands those saved registers out
in a fixed sequence — **r31 first, then r30, then r29** — in the order the values
are *created*. Whoever is created first gets r31; the next gets r30; and so on.

The subtle part: "creation order" is usually decided by the front-end, **not** by
where you write your \`int x;\`. But there's an exception, and it's the one this
function lives in. When several values are **first defined at the same program
point** — a comma-init \`for (i=0, a=0, b=0, c=0; …)\`, or a run of
\`a=0; b=0; c=0;\` — their definition order *ties*, and MWCC breaks the tie by
**declaration order**. That is the seam \`modelWalkAnimFn\` reordered.

Three accumulators, each summed across a \`sample()\` call inside the loop and read
back after it, so all three are forced into saved registers. Declared \`c, b, a\`,
the allocator colors them **a→r28, b→r29, c→r30**:

\`\`\`asm
li    r28, 0             # accumulators created in DECL order c, b, a
li    r29, 0             #   -> a, b, c land in r28, r29, r30
li    r30, 0
mr    r3, r31
bl    @sample
add   r28, r28, r3       # a += sample(base + i)
addi  r3, r31, 4
bl    @sample
add   r29, r29, r3       # b += sample(base + i + 1)
addi  r3, r31, 8
bl    @sample
add   r30, r30, r3       # c += sample(base + i + 2)
...
mr    r4, r28            # emit(100, a)   <- a lives in r28
bl    @emit
mr    r4, r29            # emit(101, b)
bl    @emit
mr    r4, r30            # emit(102, c)
bl    @emit
\`\`\`

Declare them in the *natural* reading order \`a, b, c\` instead and nothing about
the program changes — but the homes **rotate** to \`a→r30, b→r29, c→r28\`. Every
\`add\` in the loop body and all three tail \`mr r4, …\` flip, and the function no
longer byte-matches. The register numbers are a direct readout of the order in
which you spelled the declarations.

## Your task

With the externs above, write \`blend_accumulate(int* base, int count)\`. Loop \`i\`
from 0 to \`count\`, keeping three running sums \`a\`, \`b\`, \`c\`
(\`a += sample(base+i)\`, \`b += sample(base+i+1)\`, \`c += sample(base+i+2)\`), and
\`emit(i, a+b+c)\` each pass. After the loop, \`emit(100, a)\`, \`emit(101, b)\`,
\`emit(102, c)\`. The catch is the **declaration order**: to land the accumulators
in r28/r29/r30 the way the target does, declare them **\`c, b, a\`** (then \`i\`) —
the reverse of how you use them. Declaring \`a, b, c\` compiles and runs identically
but colors the saved registers backwards and will not match.
`,
    symbol: "blend_accumulate",
    context: `extern int sample(int* p);
extern void emit(int slot, int v);`,
    starter: `void blend_accumulate(int* base, int count) {
    int a;
    int b;
    int c;
    int i;
    for (i = 0, a = 0, b = 0, c = 0; i < count; i++) {
        a += sample(base + i);
        b += sample(base + i + 1);
        c += sample(base + i + 2);
        emit(i, a + b + c);
    }
    emit(100, a);
    emit(101, b);
    emit(102, c);
}
`,
    solution: `void blend_accumulate(int* base, int count) {
    int c;
    int b;
    int a;
    int i;
    for (i = 0, a = 0, b = 0, c = 0; i < count; i++) {
        a += sample(base + i);
        b += sample(base + i + 1);
        c += sample(base + i + 2);
        emit(i, a + b + c);
    }
    emit(100, a);
    emit(101, b);
    emit(102, c);
}
`,
    hints: [
      "All three sums are read *after* the loop and updated *across* a `sample()` call, so each one is forced into a callee-saved register (r28–r30). That's the precondition for the lever — a value only gets a saved reg if it's live across a call.",
      "Saved registers are handed out r31, r30, r29… in *creation* order, and when several locals are first set at the same point (the `for (i=0, a=0, b=0, c=0; …)` comma-init) the tie-break is **declaration order**. So decl order literally chooses the registers.",
      "The starter declares `a, b, c` and colors them r30/r29/r28 — backwards from the target. Reverse the three accumulator declarations to `c, b, a` (keep `i` last) and the homes become a→r28, b→r29, c→r30, matching every `add` and tail `mr`.",
    ],
  },
];
