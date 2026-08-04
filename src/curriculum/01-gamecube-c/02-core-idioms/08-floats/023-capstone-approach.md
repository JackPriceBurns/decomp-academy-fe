---
id: 14a7f789-e327-58d5-9da3-ef60512c3564
slug: floats-capstone-approach
title: "★ Capstone: A Float Step With a Clamp"
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - fcmpo
  - clamp
  - capstone
  - highlight
symbol: func_80129fdc
hints:
  - The arithmetic before the compare is a lerp — an `fsubs` (difference) feeding
    an `fmadds` (`base + diff*amount`), with one `fmuls` building the amount.
  - The `fcmpo` + conditional branch + `fmr` is a one-sided clamp on the
    result; a single `stfs` writes it back.
  - Keep everything in one running local so it stays in a float register from the
    arithmetic through the clamp to the store.
---

# A float step with a clamp

Here's the capstone, leaning on nearly the whole chapter at once. Struct fields
loaded without touching the constant pool. A chained multiply. The lerp idiom:
`fsubs` into `fmadds`. A one-branch clamp from `fcmpo` and `fmr`. A store to close
it off. Read the fields, interpolate toward a target, clamp, write back — that's
the per-frame update pattern game actor code is built from.

Take `body_step(b, dt)`. It nudges a position forward by drag-scaled velocity and
refuses to let it drop below zero:

```asm
lfs   f0, 8(r3)      # b->drag
lfs   f2, 4(r3)      # b->vel
fmuls f1, f0, f1     # drag * dt
lfs   f3, 0(r3)      # b->pos
lfs   f0, ...        # load 0.0f
fmuls f1, f2, f1     # vel * (drag * dt)
fadds f1, f3, f1     # pos + that
fcmpo cr0, f1, f0    # result < 0 ?
bge-  .ok            #   skip clamp when >= 0
fmr   f1, f0         #   result = 0
.ok:
stfs  f1, 0(r3)      # b->pos = result
blr
```

Nothing ever leaves `f1`. The products pile up there, `fadds` brings in the base,
and `fcmpo`/`bge-`/`fmr` clamps the floor. Then `stfs` writes the final value back.
The branch tests the inverted `if`, so `bge-` skips the `if (result < 0)` body.
Exactly one `stfs`.

On to the target, `func_80129fdc`. The math before the compare is the lerp idiom.
Look for an `fsubs` taking a difference, an `fmadds` shaping
`base + diff * amount`, and an `fmuls` putting that amount together. Past the
compare, the `fcmpo` operands and branch condition name the field that bounds the
result, and the `stfs` offset says where the answer goes.

Its one argument points at this struct:

```c
typedef struct { f32 value; f32 target; f32 rate; } Slider;
```

## Your task

<!-- context -->
```c
typedef struct { f32 value; f32 target; f32 rate; } Slider;
```

With the `Slider` struct above, write `func_80129fdc` to reproduce the assembly
above. Compute the interpolated step into one local, clamp it against the relevant
field, and store it back.

<!-- solution -->
```c
void func_80129fdc(Slider* s, f32 dt) {
    f32 v = s->value + (s->target - s->value) * (s->rate * dt);
    if (v > s->target) {
        v = s->target;
    }
    s->value = v;
}
```
