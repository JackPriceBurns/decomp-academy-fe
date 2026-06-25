---
id: globals-float-array-literal-scalar
title: "★ A Float Array Element, Scaled Into a Global"
difficulty: 5
concepts:
  - globals
  - array
  - addr16
  - sda21
  - literal-pool
  - lfsx
  - float
  - chaining
symbol: mixSample
hints:
  - The whole float toolkit at once - @ha/@l array base, an lfsx for the element,
    an lfs of a pooled literal, an fmuls, and an stfs to a float scalar global.
  - "`lfsx` is the float twin of `lwzx`: it loads an f32 element from base +
    scaled index. The element size for an f32 array is still 4, so the index
    scaling is the same `slwi ..., 2`."
---

# Every float move in one expression

This pulls the chapter's float techniques into a single body. To compute
`g = arr[i] * k` for a float array, a float scalar global, and a float literal,
the compiler:

- builds the array base with the `@ha`/`@l` pair (arrays aren't small-data),
- scales the index with `slwi ..., 2` (an `f32` is four bytes),
- loads the element with **`lfsx`** — the floating twin of `lwzx`,
- loads the literal from the constant pool with `lfs` of an `@N` symbol,
- multiplies with `fmuls`,
- and stores the result into the destination float global with `stfs` through
  `r2`.

So the disassembly carries *three* relocations of two flavors: one
`R_PPC_ADDR16_HA`/`LO` pair for the array, one `R_PPC_EMB_SDA21` for the `@N`
literal, and one `R_PPC_EMB_SDA21` for the destination scalar. Reading them apart
is the whole skill.

Consider `grabPeak(n)`, which scales element `n` of the float array `gWave` by a
literal and stores it into the float global `gPeak`:

```asm
lis   r4, gWave@ha       # high half of &gWave
slwi  r0, r3, 2          # n * 4   (sizeof(f32) == 4)
addi  r3, r4, gWave@l    # r3 = &gWave
lfs   f1, @5@sda21(r2)    # load the pooled literal 0.25f
lfsx  f0, r3, r0         # f0 = gWave[n]   (indexed float load)
fmuls f0, f1, f0         # gWave[n] * 0.25f
stfs  f0, gPeak@sda21(r2) # gPeak = result
blr
```

Every instruction here is one you have met — `lis`/`slwi`/`addi` to address the
array, `lfsx` to read the element, `lfs @N` for the literal, `fmuls`, and `stfs`
to the scalar. The target assembly does the same on a different array, with a
different literal, into a different float global. Read each relocation to recover
which symbol is which, and the literal's value off the constant.

## Your task

The globals are declared for you: `gSamples` (`f32[]`) and `gOut` (`f32`). Write
`mixSample`, taking an `int i`, to reproduce the assembly above.

<!-- starter -->
```c
void mixSample(int i) {
    // scale element i of the float array by a literal, store into the float global
}
```

<!-- solution -->
```c
void mixSample(int i) {
    gOut = gSamples[i] * 2.0f;
}
```

<!-- context -->
```c
extern f32 gSamples[];
extern f32 gOut;
```
