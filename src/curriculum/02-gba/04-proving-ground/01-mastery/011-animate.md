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
  - "`lsl #24` / `lsr #24` between an `add` and a `cmp` truncates a `u8` field
    before it is compared. There are two of them, so there are two counters.
    Each one is incremented and then tested against a limit."
  - "`mov r1, #0` near the top is the value that both `strb` resets store. The
    compiler moved it above the branch that needs it. Also, the frame index is
    loaded back out of the struct after it is stored, instead of being reused
    from a register."
  - "One `Anim *` goes in and nothing comes out. `timer` advances on every
    call. The frame advance, the wrap and the table read are all inside the
    `if` that the timer triggers."
symbol: func_08427084
---

# One frame at a time

A sprite's animation state is four counters and a tile number. It is kept small
on purpose, because a game with two hundred entities cannot use a whole word for
each field. So the timer, the rate, the frame index and the frame count are all
`u8`, packed at the front of the struct. The tile number that is sent to OAM
comes after them.

Byte fields are cheap in memory and expensive in registers. A `u8` loaded with
`ldrb` arrives clean. As soon as you add to it, the result can be 256, and the
value that must be compared is the *truncated* one. So agbcc narrows the value
again before every comparison. It has two ways to do this:

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
register. Shifting both values left by the same amount keeps their unsigned
order, and this costs one instruction less than shifting each value back down.
So when you see a `lsl #24` with no matching `lsr`, read it as a narrowing
instead of a multiply. When only one side needs narrowing, you get the familiar
`lsl #24` / `lsr #24` pair instead.

The other part of your target is a table read. Frame tiles are stored in an
array in ROM, and reading one looks like this:

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

The pool word holds the array's address, shown by name. A shift scales the
index by the element size, and the two are added to make the final address. The
`mov r2, #0` before the `ldrsh` is the usual zero index that Thumb requires for
that load.

Your target puts one of those counters inside the other, and ends with a table
read. Both of its comparisons use the second form. One side is narrowed with
`lsl #24` / `lsr #24`, and the other comes clean from an `ldrb`, because only
one side of each comparison has been through an `add`. Its table read scales and
adds in the same way. Its elements do not need sign extension, so the load is a
plain `ldrh` at an immediate offset, and the zero-index register never appears.
Expect the compiler to reload a field it has just written, instead of keeping it
in a register. That extra `ldrb` is part of the match.

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
