---
id: c9322751-47ea-452a-b6dd-fe9cb4145541
slug: mastery-vec3-reflect
title: "Capstone: The Reflection Vector"
difficulty: 4
concepts:
  - real-code
  - floats
  - control-flow
  - statement-order
symbol: func_8024c89c
hints:
  - "The early path is three copies from `v2` into `result`, then a return. The long path starts by copying `v1` in, but its stores are mixed with a `mul.s` that scales `dot`, and the later multiplies *reload from result*."
  - "Match the tail statement by statement against the loads: copies of v1, dot doubled and negated, three in-place multiplies that read `result` back, then three adds of `v2`. The dot expression is grouped like the one in lesson 004."
---

# Matching means keeping the strange parts

This function computes a reflected direction, such as a ricochet, a deflected
hit or a bounced light ray. It starts with the dot product, using the same
parentheses you matched in lesson 004. It exits early when the vectors point
the same way. Otherwise it builds `-2·dot·v1 + v2`.

The math is simple. However, the original programmer wrote the long path in an
unusual order. It copies fields in, scales them *in place* by reading them back
out of the result, and then adds. This mixes stores and loads to the same
struct. Clean modern C would use temporaries. **The target does not, and you
cannot either.** Each read back from `result` appears in the assembly as a real
`lwc1` from `a2`'s memory, and a tidier version of the C will not produce those
loads. This is the capstone skill: following the source's statement order
exactly.

First, two smaller patterns, shown in `vec2Damp`, which scales a vector down
when a square is not positive:

```asm
 0:  lwc1  fv1, 0(a0)         # v->x
 4:  lwc1  fa0, 4(a0)         # v->y
 8:  mtc1  zero, ft2          # 0.0f, taken from the zero register
 c:  mul.s ft0, fv1, fv1
10:  lui   at, 0x3e80         # 0.25f: a bit pattern with an EMPTY low half…
14:  mul.s ft1, fa0, fa0
18:  add.s fv0, ft0, ft1
1c:  c.lt.s ft2, fv0          # 0 < e ?
20:  nop
24:  bc1fl 0x40               # not greater → damp path
28:  mtc1  at, fv0            #   (slot) …so lui+mtc1 builds it, no memory
2c:  swc1  fv1, 0(a1)         # e > 0: copy path
30:  lwc1  ft3, 4(a0)
34:  jr    ra
38:  swc1  ft3, 4(a1)
3c:  mtc1  at, fv0            # duplicated tail: count it, don't puzzle over it
40:  nop
44:  mul.s ft4, fv1, fv0      # x * 0.25f
48:  swc1  ft4, 0(a1)
4c:  lwc1  ft5, 4(a0)
50:  mul.s ft0, ft5, fv0
54:  swc1  ft0, 4(a1)
58:  jr    ra
5c:  nop
```

- **Float constants with clean bit patterns need no memory load.** `0.25f` is
  `0x3e800000`. Its low half is zero, so a single `lui` plus `mtc1` builds it.
  The target's constant is built the same way. Read the `lui` immediate,
  remember that a leading `c` in the hex means the sign bit is set, and work
  out which round number it is.
- **`c.lt.s` + `bc1fl` is a *greater-than* early exit** when the zero is on the
  left. Trace which path is "taken", because the slot instruction runs only on
  that path.

Now the target. Split it into parts: the dot product, the compare, a copy path
of three stores that returns early, and the long tail. In the tail, write down
each `swc1` and `lwc1` in order, with its offset and its base register
(`a0`/`a1`/`a2`). You can write the C directly from that table, including one
scalar update that sits between two of the copies. Follow the order you see in
the assembly, even if you would normally write it differently.

## Your task

Write `func_8024c89c` to reproduce the target assembly.

<!-- solution -->
```c
void func_8024c89c(Vec3f *v1, Vec3f *v2, Vec3f *result) {
    f32 dot = v2->z * v1->z + (v1->x * v2->x + v1->y * v2->y);

    if (dot > 0.0f) {
        result->x = v2->x;
        result->y = v2->y;
        result->z = v2->z;

        return;
    }

    result->x = v1->x;

    dot = dot * -2.0f;

    result->y = v1->y;
    result->z = v1->z;

    result->x = result->x * dot;
    result->y = result->y * dot;
    result->z = result->z * dot;

    result->x = v2->x + result->x;
    result->y = v2->y + result->y;
    result->z = v2->z + result->z;
}
```

<!-- context -->
```c
typedef struct {
    f32 x;
    f32 y;
    f32 z;
} Vec3f;
```
