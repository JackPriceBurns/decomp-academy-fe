---
id: d3bc962e-7e2a-47d8-b9f7-578a5118dfa4
slug: floats-swapped-operands
title: "There Is No c.gt.s"
difficulty: 2
concepts:
  - floats
  - compares
  - fingerprints
symbol: func_800ef258
hints:
  - "Read the `c.lt.s` operands in order and swap them back. Which argument is on the left in the C?"
  - "No constant this time; both compare operands are arguments."
---

# Greater-than is less-than with swapped operands

The FPU's set of compares is deliberately small: `c.lt.s`, `c.le.s` and
`c.eq.s`. There is **no greater-than compare of any kind**. When the C says
`>`, the compiler swaps the operands, so `x > y` becomes "`y < x`". This
lesson calls that swap the *mirror rule*. This is `past(x)`, which tests
`x > 8.0f`:

```asm
 0:  lui    at, 0x4100     # 8.0f, three doublings up the ladder
 4:  mtc1   at, ft0
 8:  or     v0, zero, zero
 c:  c.lt.s ft0, fa0       # flag = (8.0f < x)  ← the constant is on the LEFT
10:  nop
14:  bc1f   0x20
18:  nop
1c:  addiu  v0, zero, 1
20:  jr     ra
24:  nop
```

Look closely at the compare: `c.lt.s ft0, fa0`. The *constant* is the first
operand. The compiler is asking "is `8.0f` less than `x`?", which is the test
`x > 8.0f` with the two sides swapped. Everything else has the same structure
as in the last lesson.

This makes operand order a real **fingerprint**:

- `c.lt.s fa0, ft0`: argument first, so the C says `x < K`.
- `c.lt.s ft0, fa0`: constant first, so the C says `x > K`.

Both lines use the same instruction for opposite source code. Suppose you are
matching a function, the compare instruction is right, and the diff still
shows a difference. Check whether you wrote `<` where the original had a
mirrored `>`. The two produce *different operand orders*, and the
diff shows that straight away.

(`x > K` and `K < x` compute the same result. It still matters which one the
original programmer wrote, because the compiler encodes how the C was
written: for `>`, it always puts the C's right-hand side first. So the listing
records which way round the programmer wrote the comparison.)

The target uses `>`, and neither side is a constant. Undo the mirror in the
operand order to recover the C.

## Your task

Write `func_800ef258` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800ef258(f32 a, f32 b) {
    return a > b;
}
```
