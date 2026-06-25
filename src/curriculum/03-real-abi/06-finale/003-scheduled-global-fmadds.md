---
id: finale-real-scheduled-global-fmadds
title: "Globals, Literals, and the Scheduler"
difficulty: 4
concepts:
  - finale
  - globals
  - sda21
  - float-literal
  - fp-contract
  - scheduling
symbol: mixGains
hints:
  - Each channel multiplies its arg by a float *global* and adds a float *literal*
    — the global is an `@sda21` symbol, the literal is an `@N` slot from the
    rodata pool.
  - "`fp_contract` fuses each `x * g + bias` into a single `fmadds`; write the
    multiply-then-add naturally and let the compiler contract it."
  - The scheduler hoists the `lfs` loads to the front and interleaves the
    independent channels — count the `lfs` to see how many globals and literals
    are involved.
---

# Four chapters of float, scheduled into one block

A per-channel scale-and-bias is everywhere in graphics and audio code, and it
lights up the back half of the tier all at once. Each channel reads a **float
global** (`@sda21`, from the globals chapter), adds a **float literal** pulled
from the **rodata pool** (the `@N` slots, also the globals chapter),
**`fp_contract`** fuses the multiply-then-add into one `fmadds` (the optimization
chapter), and the **scheduler** reorders the independent channels so their
latencies overlap (the optimization chapter again).

The tell is the load mix: every channel contributes one `lfs` of an `@sda21`
*named* global and one `lfs` of an `@N` *anonymous* literal. Consider `mix3`,
three channels each scaled by its own global and biased by its own constant:

```asm
lfs    f6,gScaleP@sda21(r2)   # global scale for channel 0
lfs    f5,@6@sda21(r2)        # literal bias for channel 0 (rodata pool)
lfs    f4,gScaleQ@sda21(r2)   # global scale for channel 1
lfs    f0,@7@sda21(r2)        # literal bias for channel 1
fmadds f1,f1,f6,f5          # channel 0: p*gScaleP + bias, fused
lfs    f5,gScaleR@sda21(r2)   # global scale for channel 2 (loads still interleaving)
fmadds f0,f2,f4,f0          # channel 1 fused
lfs    f2,@5@sda21(r2)        # literal bias for channel 2
fmadds f2,f3,f5,f2          # channel 2 fused
fadds  f0,f1,f0
fadds  f1,f2,f0
blr
```

Every `... * g + bias` collapsed into one `fmadds` — that is `fp_contract`. The
loads are hoisted and the channels interleaved rather than run as three tidy
blocks — that is scheduling. The `@sda21` symbols are your float globals; the
`@N` slots are the constants you wrote, parked in the rodata literal pool.

Your `mixGains` has the same per-channel shape with **fewer channels** and
**different bias constants**. Count the `lfs` to recover how many channels there
are, pair each named global with its anonymous literal, and write each channel as
the plain multiply-then-add — the compiler fuses and schedules it for you.

## Your task

The float globals `gGainA` and `gGainB` are declared for you. Write `mixGains`,
taking two `f32` args, to reproduce the assembly above. Recover the bias literals
from the `@N` rodata slots and write each channel in its natural form.

<!-- starter -->
```c
f32 mixGains(f32 x, f32 y) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 mixGains(f32 x, f32 y) {
    f32 a = x * gGainA + 0.5f;
    f32 b = y * gGainB + 0.25f;
    return a + b;
}
```

<!-- context -->
```c
extern f32 gGainA;
extern f32 gGainB;
```
