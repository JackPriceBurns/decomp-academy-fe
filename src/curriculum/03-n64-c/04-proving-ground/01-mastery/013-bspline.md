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
  - "Four coefficient expressions are stored by `swc1`s to `0..12(sp)`. Decode each one from the `lui` immediates you can read in the target and from the `s[i]` loads that feed it. Keep the source order."
  - "The `beqz a2` guards the optional out-parameter. Both tails are Horner chains in `t`. The rate's leading constant appears as an add of a value to itself, and each tail ends by scaling with the pool constant."
---

# The curve the camera follows

Cameras and flight paths move along cubic B-splines, and this function
evaluates one. Four control points go in, one smoothed value comes out, and an
optional out-parameter reports the rate of change. It is the target with the
most float code in the course, about forty FPU operations. It splits into
clear parts if you know three techniques.

**First: a leaf function can still have a frame.** The function stores four
computed coefficients into `0(sp)` to `12(sp)`, which is a local array. So it
starts with `addiu sp, sp, -16` but never saves `ra`. There is no call. The
frame is only storage space for the array.

**Second: there are two ways to build a float constant.** Round numbers with
empty low halves, such as `5.0f` (`0x40a00000`) and `-12.0f` (`0xc1400000`),
are built with `lui`/`mtc1` and need no memory load. Constants with other bit
patterns must be loaded from memory. Here `nudge` scales by 0.1f, whose pattern
`0x3dcccccd` has many low bits set:

```asm
lui   at, %hi(.rodata)
lwc1  ft0, %lo(.rodata)(at)   # 0.1f fetched from the literal pool
mul.s fv0, fa0, ft0
nop
jr    ra
nop
```

The target uses both kinds. Expect one odd detail: the *same* pool constant is
fetched twice, by two separate loads from two `.rodata` offsets, because the
compiler stored one copy of the literal for each use. In C you write the same
constant twice, and IDO handles the rest.

**Third: Horner's method.** Polynomials are evaluated as nested multiply-adds.
Here is `evalQuad`, which computes `(c0·t + c1)·t + c2` and then halves it:

```asm
 0:  mtc1  a1, fa0          # t: an f32 arriving in an INTEGER register,
 4:  nop                    #     because a pointer took the first arg slot
 8:  lwc1  ft0, 0(a0)       # c[0]
 c:  lwc1  ft2, 4(a0)       # c[1]
10:  lwc1  ft5, 8(a0)       # c[2]
14:  mul.s ft1, ft0, fa0    # c0*t
18:  lui   at, 0x3f00       # 0.5f: clean pattern, no memory
1c:  add.s ft3, ft1, ft2    # c0*t + c1
20:  mtc1  at, ft1
24:  mul.s ft4, ft3, fa0    # (...)*t
28:  add.s ft0, ft5, ft4    # + c2: written c2-first, and the add.s shows it
2c:  mul.s fv0, ft0, ft1    # scale last
30:  nop
34:  jr    ra
38:  nop
```

The alternating pattern of `mul.s` by `t`, then `add.s`, shows the nesting
depth. Count the multiplies by `t` in a chain, and you know the degree of the
polynomial. As always, the operand order of each `add.s` tells you which side
the author wrote first.

Read the target in two halves. The first half has four expressions over
`s[0..3]`, each stored to the stack. Recover them one constant at a time. The
second half has a `beqz a2` that guards the out-parameter's Horner chain,
followed by the unconditional chain for the return value. In the
out-parameter's chain, the cubic's leading term is tripled and its middle term
is doubled. The doubling appears as an `add.s` of a register to itself. Both
chains end by scaling with the pooled fraction. You cannot read that constant
from the instructions, because its bit pattern is stored in `.rodata`. You do
not need to. Every uniform B-spline basis has the same normalization, one over
the factorial of the curve's degree, and this curve is a cubic.

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
