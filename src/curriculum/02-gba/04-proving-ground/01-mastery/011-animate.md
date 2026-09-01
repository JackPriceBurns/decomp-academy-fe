---
id: 7a3fed11-26d0-4814-a82c-fe3097d4bb0f
slug: gba-mastery-animate
title: Advancing an Animation
difficulty: 4
concepts:
  - narrow-types
  - structs
  - globals
hints:
  - "`lsl #24` / `lsr #24` sitting between an `add` and a `cmp` is a `u8` field
    being truncated before it is compared. There are two of them, so there are
    two counters, each incremented and then tested against a limit."
  - "`mov r1, #0` near the top is the value that both `strb` resets store,
    hoisted above the branch that needs it. And the frame index is loaded back
    out of the struct after being stored, rather than reused from a register."
  - "One `Anim *` goes in and nothing comes out. `timer` advances on every call;
    the frame advance, the wrap and the table read all live inside the `if` that
    the timer trips."
symbol: func_08427084
---

# One frame at a time

A sprite's animation state is four counters and a tile number, and it is kept
small on purpose - a game with two hundred entities cannot afford a word per
field. So the timer, the rate, the frame index and the frame count are all `u8`,
packed into the front of the struct, and the tile number that gets pushed into
OAM follows them.

Byte fields are cheap in memory and expensive in registers. A `u8` loaded with
`ldrb` arrives clean, but the moment you add to it the result can be 256, and
the value that must be compared is the *truncated* one. agbcc therefore
re-narrows before every comparison, and it has two ways of doing it:

```asm
0        lsl       r1, #24
2        ldrb      r2, [r0, #0]
4        add       r2, #1
6        strb      r2, [r0, #0]
8        mov       r0, #0
10       lsl       r2, #24
12       cmp       r2, r1
14       blo       18 ~>
16       mov       r0, #1
18     ~>bx        lr
```

Here it shifts *both* sides up by 24 and compares them at the top of the
register. Unsigned ordering survives a common left shift, so that is one
instruction cheaper than bringing each value back down - and it means a bare
`lsl #24` with no matching `lsr` is a narrowing, not a multiply. When only one
side needs it, you get the familiar `lsl #24` / `lsr #24` pair instead.

The other half of your target is a table read. Frame tiles live in an array in
ROM, and reaching one looks like this:

```asm
0        ldr       r2, [pc, #12] (->16)
2        mov       r1, #255
4        and       r1, r0
6        lsl       r1, #1
8        add       r1, r2
10       mov       r2, #0
12       ldrsh     r0, [r1, r2]
14       bx        lr
16       .word     gSineTable
```

The pool word carries the array's address by name, the index is scaled by the
element size with a shift, and the two are added to make the final address. The
`mov r2, #0` before the `ldrsh` is the usual zero index Thumb demands, not a
value.

Your target nests one of those counters inside the other and finishes with a
table read. Both of its comparisons take the second form - one side narrowed
with `lsl #24` / `lsr #24`, the other arriving clean out of an `ldrb` - because
only one side of each has been through an `add`. Its table read scales and adds
the same way, but its elements need no sign, so the load is a plain `ldrh` at
an immediate offset and the zero-index register never appears. Expect the
compiler to reload a field it has just written rather than keep it live - that
extra `ldrb` is part of the match.

## Your task

Write `func_08427084` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    u8 frame;
    u8 count;
    u8 timer;
    u8 rate;
    u16 tile;
} Anim;
extern u16 gFrameTiles[];
```

<!-- solution -->
```c
void func_08427084(Anim *a)
{
    a->timer++;
    if (a->timer >= a->rate) {
        a->timer = 0;
        a->frame++;
        if (a->frame >= a->count) {
            a->frame = 0;
        }
        a->tile = gFrameTiles[a->frame];
    }
}
```
