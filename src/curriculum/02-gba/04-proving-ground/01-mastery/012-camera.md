---
id: 85cf515f-d7e3-4f79-b0d3-51a58aec4c65
slug: gba-mastery-camera
title: Following the Player
difficulty: 5
concepts:
  - division
  - structs
  - branches
hints:
  - "`cmp #0` / `bge` / `add #7` / `asr #3` is a signed divide by eight. An
    `asr #3` with nothing in front of it is a plain shift. Both appear here and
    they are not interchangeable."
  - The clamp reads the bound out of the struct only after the low clamp has
    already run, and a `ble` that jumps over a `mov` is
    `if (v > limit) v = limit;` with its condition inverted.
  - "A `Camera *` and two `s32` target coordinates go in and nothing comes out.
    The horizontal axis is eased, clamped to 0 and to `maxX`, then stored; the
    vertical axis is eased and stored with no clamp at all."
symbol: func_0842b7f8
---

# The camera catches up

A camera that snaps to the player is unwatchable, so games ease: every frame,
move some fraction of the remaining distance. The fraction is always a power of
two, because the alternative is a call to `__divsi3`, and then the result is
clamped so the view never runs off the edge of the level.

The distance to close is a subtraction, and it is negative every time the player
moves left or up. That matters more than it looks, because C's `/` and `>>` do
different things to a negative number. `/` truncates toward zero; `>>` rounds
toward negative infinity. On a machine with no divider, the compiler implements
the first by biasing the value before shifting:

```asm
0        add       r0, r1
2        cmp       r0, #0
4        bge       8 ~>
6        add       r0, #31
8      ~>asr       r0, #5
10       bx        lr
```

The same expression written with a shift skips all of that:

```asm
0        add       r0, r1
2        asr       r0, #5
4        bx        lr
```

And on unsigned values the question does not arise, so even a `/` compiles to a
single instruction:

```asm
0        add       r0, r1
2        lsr       r0, #5
4        bx        lr
```

Three spellings, three lengths, and the middle one differs from the first by
one whenever the value is negative and not an exact multiple of 32. On a camera
that shows up as behaviour: while the remaining distance is negative and
smaller than the divisor, the shift still moves the view one unit a frame, and
the divide truncates that step to zero and parks the view short of its target.

Your target eases twice, and only one of the two pays for the bias. Check every
`asr` for a `cmp`/`add` pair leading into it before you decide what the source
said, because the two axes were not written the same way and you have to
reproduce both.

## Your task

Write `func_0842b7f8` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    s32 x;
    s32 y;
    s32 maxX;
    s32 maxY;
} Camera;
```

<!-- solution -->
```c
void func_0842b7f8(Camera *c, s32 tx, s32 ty)
{
    s32 x;

    x = c->x + (tx - c->x) / 8;
    if (x < 0) {
        x = 0;
    }
    if (x > c->maxX) {
        x = c->maxX;
    }
    c->x = x;
    c->y += (ty - c->y) >> 3;
}
```
