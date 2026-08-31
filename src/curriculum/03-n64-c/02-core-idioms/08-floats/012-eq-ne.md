---
id: 0f6f2408-9cc4-4ad8-8f07-0481fd629510
slug: floats-eq-ne
title: "c.eq.s, and != in the Branch"
difficulty: 2
concepts:
  - floats
  - compares
  - bc1t
  - fingerprints
symbol: func_803dbc90
hints:
  - "Compare this listing against the worked example — exactly one letter changes. Which instruction owns that letter?"
  - "The compare still tests equality. The branch decides what equality *means* for the result."
---

# One flag, two branches

Equality gets its own compare — **`c.eq.s`** — but *inequality does
not*. There's no `c.ne.s` anywhere in the instruction set. Here's
`same(a, b)`, which returns whether two floats are equal:

```asm
 0:  c.eq.s fa0, fa1        # flag = (a == b)
 4:  or     v0, zero, zero
 8:  bc1f   0x14            # NOT equal? skip, keeping the 0
 c:  nop
10:  addiu  v0, zero, 1     # equal: 1
14:  jr     ra
18:  nop
```

So how does `!=` compile? Watch the branch, not the compare. The
FPU's flag can be read *either way*: `bc1f` acts when it's false,
`bc1t` when it's true. To return "not equal", IDO keeps the very
same `c.eq.s` and simply **flips which branch guards the 1** — skip
the 1 when the flag is *true*, i.e. when they're equal.

That means `==` and `!=` differ by a single letter in the whole
listing — `bc1f` versus `bc1t` — and everything else is
byte-identical. It's one of the easiest mismatches to stare straight
through: the compare is "right", the structure is "right", and the
diff highlights one branch. Now you know exactly what that highlight
means: the polarity of your condition is backwards.

The general rule, worth filing for every FPU branch you'll ever
read: **the compare picks the question, the branch picks which
answer skips**. All six C comparisons come from three compares, two
branch senses, and the operand mirror.

The target returns whether its arguments differ.

## Your task

Write `func_803dbc90` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803dbc90(f32 a, f32 b) {
    return a != b;
}
```
