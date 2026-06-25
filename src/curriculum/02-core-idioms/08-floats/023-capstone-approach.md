---
id: floats-capstone-approach
title: "★ Capstone: A Float Step With a Clamp"
difficulty: 3
concepts:
  - floating-point
  - fmadds
  - fcmpo
  - clamp
  - capstone
  - highlight
symbol: slider_approach
hints:
  - The arithmetic before the compare is a lerp — an `fsubs` (difference) feeding
    an `fmadds` (`base + diff*amount`), with one `fmuls` building the amount.
  - The `fcmpo` + conditional branch + `fmr` is a one-sided clamp on the
    result; a single `stfs` writes it back.
  - Keep everything in one running local so it stays in a float register from the
    arithmetic through the clamp to the store.
---

# Bringing the chapter together

This capstone fuses almost everything from the chapter into one realistic update
function: pooled-constant–free struct loads, a chained multiply, the lerp idiom
(`fsubs` → `fmadds`), a compare-and-branch clamp (`fcmpo` + `fmr`), and a final
store. The shape — *read fields, interpolate toward a target, clamp, write back*
— is exactly the kind of per-frame update that fills game actor code.

Consider `body_step(b, dt)`, which advances a position by a drag-scaled velocity
and floors the result at zero:

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

Everything threads through `f1`: the products build up, the `fadds` adds the
base, the `fcmpo`/`bge-`/`fmr` apply the floor, and `stfs` writes the single
final value back to the struct. The branch uses the *inverted* `if` condition
(`bge-` skips the `if (result < 0)` body), and the lone `stfs` confirms only one
store at the end.

Now decode the target assembly for `slider_approach`. The arithmetic before the
compare is the **lerp idiom** from earlier — spot the `fsubs` computing a
difference and the `fmadds` doing `base + diff * amount`, with an `fmuls`
building that amount. Then read the `fcmpo` operands and branch condition to find
which field bounds the result, and the `stfs` offset for where it's stored.

The argument points to this struct:

```c
typedef struct { f32 value; f32 target; f32 rate; } Slider;
```

## Your task

<!-- context -->
```c
typedef struct { f32 value; f32 target; f32 rate; } Slider;
```

With the `Slider` struct above, write `slider_approach` taking a `Slider*` and an
`f32 dt` to reproduce the assembly above. Compute the interpolated step into one
local, clamp it against the relevant field, and store it back.

<!-- starter -->
```c
void slider_approach(Slider* s, f32 dt) {
    // step value toward target by (rate * dt); clamp so it doesn't overshoot;
    // store back into value
}
```

<!-- solution -->
```c
void slider_approach(Slider* s, f32 dt) {
    f32 v = s->value + (s->target - s->value) * (s->rate * dt);
    if (v > s->target) {
        v = s->target;
    }
    s->value = v;
}
```
