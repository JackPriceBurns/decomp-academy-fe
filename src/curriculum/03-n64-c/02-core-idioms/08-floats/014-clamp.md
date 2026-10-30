---
id: 12708c7f-83fc-4a38-ad13-6ec6e4956301
slug: floats-clamp
title: "Clamp: Two Guards, One Constant Register"
difficulty: 4
concepts:
  - floats
  - compares
  - clamp
  - constants
symbol: func_8009c230
hints:
  - "Decode both `lui`s with the ladder. `0xbf80` has the sign bit set. The two bounds are not the worked example's bounds."
  - "Same two-`if` structure as `clamp01`. Note that the second `lui` runs early, but its `mtc1` waits inside the likely slot."
---

# Keeping a value inside a range

A clamp is two caps in a row: first the ceiling, then the floor. The compiler
chains two copies of the structure from the last lesson. It keeps one FPU
register, `fv1`, for whichever constant is needed at the time. This lesson
calls it the *constant register*. This is `clamp01`, which keeps `x` inside
[0.0f, 1.0f]:

```asm
 0:  lui    at, 0x3f80     # 1.0f…
 4:  mtc1   at, fv1        # …into the constant register
 8:  nop
 c:  c.lt.s fv1, fa0       # 1.0f < x, i.e. x > 1.0f ?
10:  nop
14:  bc1fl  0x28           # not over the ceiling? move on…
18:  mtc1   zero, fv1      #   (likely slot) fv1 = 0.0f for guard #2
1c:  jr     ra
20:  mov.s  fv0, fv1       # over: return the 1.0f still in fv1
24:  mtc1   zero, fv1      # (dup tail) fv1 = 0.0f
28:  nop
2c:  c.lt.s fa0, fv1       # x < 0.0f ?
30:  nop
34:  bc1fl  0x48           # not under the floor? …
38:  mov.s  fv0, fa0       #   (likely slot) return x unchanged
3c:  jr     ra
40:  mov.s  fv0, fv1       # under: return the 0.0f in fv1
44:  mov.s  fv0, fa0       # dup tail again
48:  jr     ra
4c:  nop
```

It is long, but it is one shape repeated. Read it as two blocks. Each block is
"compare, `bc1fl`, two `mov.s` exits", and the constant register links them:

- **`fv1` holds whichever constant is needed *next*.** It starts as the
  ceiling. The first block's likely slot *loads the floor into it* as the code
  passes through. The two constants share one register, and the reload is
  placed in a delay slot. This kind of saving is typical of IDO.
- **Each compare is mirrored as needed.** `x > 1.0f` puts the constant first
  (`c.lt.s fv1, fa0`), and `x < 0.0f` puts the argument first. One clamp
  shows both orders.
- The C is two plain `if`s with early returns, ceiling first, then floor. If
  you write it in a different way, for example with nested ternaries or else
  chains, the blocks come out arranged differently.

The target clamps to a *symmetric* range. It has the same structure, but both
bounds are built with `lui`, and the second one is negative. Decode `0xbf80`
before you assume anything. Note where its `mtc1` is placed.

## Your task

Write `func_8009c230` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8009c230(f32 x) {
    if (x > 1.0f) {
        return 1.0f;
    }
    if (x < -1.0f) {
        return -1.0f;
    }
    return x;
}
```
