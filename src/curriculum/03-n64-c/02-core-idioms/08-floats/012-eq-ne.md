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
  - "Compare this listing with the worked example. Exactly one letter is different. Which instruction is that letter in?"
  - "The compare still tests equality. The branch decides what equality *means* for the result."
---

# One flag, two branches

Equality has its own compare, **`c.eq.s`**, but *inequality does not*. There
is no `c.ne.s` anywhere in the instruction set. This is `same(a, b)`, which
returns whether two floats are equal:

```asm
 0:  c.eq.s fa0, fa1        # flag = (a == b)
 4:  or     v0, zero, zero
 8:  bc1f   0x14            # NOT equal? skip, keeping the 0
 c:  nop
10:  addiu  v0, zero, 1     # equal: 1
14:  jr     ra
18:  nop
```

To see how `!=` compiles, look at the branch instead of the compare. The
FPU's flag can be tested *either way*: `bc1f` branches when it is false, and
`bc1t` branches when it is true. To return "not equal", IDO keeps the same
`c.eq.s` and **changes which branch guards the 1**. It skips the 1 when the
flag is *true*, which means when the values are equal.

So `==` and `!=` differ by a single letter in the whole listing, `bc1f`
versus `bc1t`, and everything else is byte-identical. This mismatch is hard
to spot. The compare is "right", the structure is "right", and the diff
highlights one branch. When you see that highlight, you know what it means:
your condition is the wrong way round.

Here is the general rule for every FPU branch you read: **the compare chooses
the question, and the branch chooses which answer skips the 1**. All six C
comparisons come from three compares, two branch directions and the mirror
rule.

The target returns whether its arguments differ.

## Your task

Write `func_803dbc90` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803dbc90(f32 a, f32 b) {
    return a != b;
}
```
