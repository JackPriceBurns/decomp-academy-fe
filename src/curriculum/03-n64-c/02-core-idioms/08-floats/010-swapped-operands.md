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
  - "Read the `c.lt.s` operands in order and un-swap them — which argument is on the left in the C?"
  - "No constant this time; both compare operands are arguments."
---

# Greater-than is less-than, mirrored

The FPU's compare family is deliberately small: there's `c.lt.s`,
`c.le.s`, `c.eq.s` — and **no greater-than of any kind**. When the C
says `>`, the compiler just swaps the operands: `x > y` becomes
"`y < x`". Here's `past(x)`, which tests `x > 8.0f`:

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

Look hard at the compare: `c.lt.s ft0, fa0`. The *constant* is the
first operand — the compiler is asking "is `8.0f` less than `x`?",
which is `x > 8.0f` read in a mirror. Everything else is last
lesson's skeleton unchanged.

This makes operand order a genuine **fingerprint**:

- `c.lt.s fa0, ft0` — argument first → the C says `x < K`.
- `c.lt.s ft0, fa0` — constant first → the C says `x > K`.

Same instruction, opposite source code. When you're matching a
function and the compare instruction is right but the diff still
complains, check whether you wrote `<` where the original had a
mirrored `>` — the two produce *different operand orders*, and the
diff sees it instantly.

(Why does it matter which the original wrote? `x > K` and `K < x`
compute identically — but the compiler encodes the *spelling*, always
putting the C's right-hand side first for `>`. The listing remembers
which way the programmer faced.)

The target compares its two arguments with `>` — no constant
involved. Un-mirror the operand order and the C falls out.

## Your task

Write `func_800ef258` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800ef258(f32 a, f32 b) {
    return a > b;
}
```
