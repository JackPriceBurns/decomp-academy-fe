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
  - "The early path is three copies from `v2` into `result` and a return. The long path starts by copying `v1` in — but its stores are interleaved with a `mul.s` scaling `dot`, and later multiplies *reload from result*."
  - "Match the tail statement by statement against the loads — copies of v1, dot doubled negative, three in-place multiplies reading `result` back, then three adds of `v2`. The dot expression groups like lesson 004's."
---

# Matching means keeping the weird

This function computes a reflected direction — a ricochet, a deflected hit, a
bounced light ray. It opens with the dot product (the same parenthesization you
matched in lesson 004), takes an early exit when the vectors point the same way,
and otherwise builds `-2·dot·v1 + v2`.

Mathematically simple. But the original programmer wrote the long path in a
strange order: copy fields in, scale them *in place* by reading them back out
of the result, then add — interleaving stores and loads to the same struct.
Clean modern C would use temporaries. **The target doesn't, and you can't
either**: reads-back-from-`result` appear in the assembly as real `lwc1`s
from `a2`'s memory, and no tidy rewrite will produce them. This is the
capstone skill — surrendering to the source's statement order.

Two smaller fingerprints first, shown in `vec2Damp` (scale-down when a square
isn't positive):

```asm
 0:  lwc1  fv1, 0(a0)         # v->x
 4:  lwc1  fa0, 4(a0)         # v->y
 8:  mtc1  zero, ft2          # 0.0f — free, from the zero register
 c:  mul.s ft0, fv1, fv1
10:  lui   at, 0x3e80         # 0.25f — a bit pattern with an EMPTY low half…
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
3c:  mtc1  at, fv0            # duplicated tail — count it, don't puzzle
40:  nop
44:  mul.s ft4, fv1, fv0      # x * 0.25f
48:  swc1  ft4, 0(a1)
4c:  lwc1  ft5, 4(a0)
50:  mul.s ft0, ft5, fv0
54:  swc1  ft0, 4(a1)
58:  jr    ra
5c:  nop
```

- **Float constants with clean bit patterns skip memory.** `0.25f` is
  `0x3e800000` — low half zero, so a single `lui` plus `mtc1` conjures it.
  The target's constant is built the same way; read the `lui` immediate,
  recall that a leading `c` in the hex means the sign bit is set, and work
  out which round number it is.
- **`c.lt.s` + `bc1fl` is a *greater-than* early-out** when the zero sits on
  the left. Trace which path is "taken" — the slot instruction only runs
  that way.

Now the target. Segment it: dot product, compare, a three-store copy path
that returns early, and the long tail. In the tail, write down each `swc1`
and `lwc1` with its offset and owner (`a0`/`a1`/`a2`), in order. The C reads
straight off that table — including one scalar update sandwiched between two
of the copies. Trust the order you see, not the order you'd write.

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
