---
id: e6c44f9c-62f7-49df-b038-948b0580c4b7
slug: mastery-bspline
title: "Capstone: The B-Spline Curve"
difficulty: 4
concepts:
  - real-code
  - floats
  - rodata
  - frames
symbol: func_801b113c
hints:
  - "Four coefficient expressions land in `swc1`s to `0..12(sp)` — decode each from the `lui` immediates you can read off the target and which `s[i]` loads feed it, keeping source order."
  - "The `beqz a2` guards the optional out-parameter. Both tails are Horner chains in `t`; the rate's leading constant appears as an add of a value to itself, and each tail ends scaled by the pool constant."
---

# The curve under the camera

Cameras and flight paths glide along cubic B-splines, and this is the evaluator:
four control points in, one smoothed value out, with an optional out-parameter
reporting the rate of change. It's the most float-dense target in the course —
some forty FPU operations — but it decomposes cleanly if you know its three
tricks.

**Trick one: a leaf can still have a frame.** The function stores four
computed coefficients into `0(sp)`–`12(sp)` — a local array — so it opens
with `addiu sp, sp, -16` yet never saves `ra`. No call, just spill space.

**Trick two: two ways to build a float constant.** Round numbers with empty
low halves — `5.0f` is `0x40a00000`, `-12.0f` is `0xc1400000` — arrive via
`lui`/`mtc1`, no memory. Messy ones can't. Watch `nudge` scale by 0.1f,
whose pattern `0x3dcccccd` has busy low bits:

```asm
lui   at, %hi(.rodata)
lwc1  ft0, %lo(.rodata)(at)   # 0.1f fetched from the literal pool
mul.s fv0, fa0, ft0
nop
jr    ra
nop
```

The target uses both kinds. And a quirk to expect: the *same* pool constant
is fetched twice through two separate loads at two `.rodata` offsets — the
compiler stashed one literal per use. You write the same constant twice in C;
IDO handles the rest.

**Trick three: Horner's method.** Polynomials evaluate as nested
multiply-adds. Here's `evalQuad` doing `(c0·t + c1)·t + c2`, halved:

```asm
 0:  mtc1  a1, fa0          # t — an f32 arriving in an INTEGER register,
 4:  nop                    #     because a pointer took the first arg slot
 8:  lwc1  ft0, 0(a0)       # c[0]
 c:  lwc1  ft2, 4(a0)       # c[1]
10:  lwc1  ft5, 8(a0)       # c[2]
14:  mul.s ft1, ft0, fa0    # c0*t
18:  lui   at, 0x3f00       # 0.5f — clean pattern, no memory
1c:  add.s ft3, ft1, ft2    # c0*t + c1
20:  mtc1  at, ft1
24:  mul.s ft4, ft3, fa0    # (...)*t
28:  add.s ft0, ft5, ft4    # + c2 — written c2-first, and the add.s shows it
2c:  mul.s fv0, ft0, ft1    # scale last
30:  nop
34:  jr    ra
38:  nop
```

The alternating `mul.s`-by-`t`, `add.s` rhythm *is* the nesting depth — count
the multiplies by `t` in a chain and you know the polynomial's degree. And as
always, each `add.s`'s operand order tells you which side the author wrote
first.

Read the target in two halves. First half: four expressions over `s[0..3]`,
each stored to the stack — recover them constant by constant. Second half:
a `beqz a2` guarding the out-parameter's Horner chain (its cubic's leading
term is tripled and its middle doubled — the doubling shows up as an `add.s`
of a register to itself), then the unconditional chain for the return value.
Both end by scaling with the pooled fraction. You can't read that one out of
the instruction stream — its bit pattern lives in `.rodata` — but you don't
have to: every uniform B-spline basis carries the same normalization, one
over the factorial of the curve's degree, and this is a cubic.

## Your task

Write `func_801b113c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_801b113c(f32 *s, f32 t, f32 *rate) {
    f32 v[4];

    v[0] = -s[0] + (3.0f * s[1]) + (-3.0f * s[2]) + s[3];
    v[1] = (3.0f * s[0]) + (-6.0f * s[1]) + (3.0f * s[2]);
    v[2] = (-3.0f * s[0]) + (3.0f * s[2]);
    v[3] = s[0] + (4.0f * s[1]) + s[2];

    if (rate != NULL) {
        *rate = (((((3.0f * v[0]) * t) + (2.0f * v[1])) * t) + v[2]) * (1.0f / 6.0f);
    }

    return ((((((v[0] * t) + v[1]) * t) + v[2]) * t) + v[3]) * (1.0f / 6.0f);
}
```
