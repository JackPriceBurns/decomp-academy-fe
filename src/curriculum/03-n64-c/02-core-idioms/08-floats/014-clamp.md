---
id: 12708c7f-83fc-4a38-ad13-6ec6e4956301
slug: floats-clamp
title: "Clamp: Two Guards, One Constant Carrier"
difficulty: 4
concepts:
  - floats
  - compares
  - clamp
  - constants
symbol: func_8009c230
hints:
  - "Decode both `lui`s with the ladder — `0xbf80` has the sign bit set. The two bounds are not the worked example's bounds."
  - "Same two-`if` structure as `clamp01`. Note the second `lui` runs early but its `mtc1` waits inside the likely slot."
---

# Boxing a value in

A clamp is two caps back to back — ceiling, then floor — and the
compiler chains two of last lesson's skeletons, keeping one FPU
register (`fv1`) as a revolving constant carrier. Here's `clamp01`,
which pins `x` into [0.0f, 1.0f]:

```asm
 0:  lui    at, 0x3f80     # 1.0f…
 4:  mtc1   at, fv1        # …into the carrier
 8:  nop
 c:  c.lt.s fv1, fa0       # 1.0f < x, i.e. x > 1.0f ?
10:  nop
14:  bc1fl  0x28           # not over the ceiling? move on…
18:  mtc1   zero, fv1      #   (likely slot) carrier = 0.0f for guard #2
1c:  jr     ra
20:  mov.s  fv0, fv1       # over: return the 1.0f still in the carrier
24:  mtc1   zero, fv1      # (dup tail) carrier = 0.0f
28:  nop
2c:  c.lt.s fa0, fv1       # x < 0.0f ?
30:  nop
34:  bc1fl  0x48           # not under the floor? …
38:  mov.s  fv0, fa0       #   (likely slot) return x unchanged
3c:  jr     ra
40:  mov.s  fv0, fv1       # under: return the 0.0f in the carrier
44:  mov.s  fv0, fa0       # dup tail again
48:  jr     ra
4c:  nop
```

Long, but it's one shape twice. Read it as two stanzas, each
"compare / `bc1fl` / two `mov.s` exits", glued by the carrier:

- **`fv1` holds whichever constant is needed *next*.** It starts as
  the ceiling; the first stanza's likely slot *reloads it with the
  floor* on the way past. Constants time-share one register, and the
  reload hides in a delay slot — classic IDO thrift.
- **Both compares mirror as needed**: `x > 1.0f` is the constant
  first (`c.lt.s fv1, fa0`), `x < 0.0f` is the argument first. One
  clamp shows you both orders working.
- The C is two plain `if`s with early returns, in ceiling-then-floor
  order. Write it any fancier — nested ternaries, else-chains — and
  the stanzas come out re-plumbed.

The target clamps to a *symmetric* range: same structure, but both
bounds are built with `lui`, and the second one is negative — decode
`0xbf80` before assuming anything. Note where its `mtc1` hides.

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
