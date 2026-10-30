---
id: 0f7b9eb8-3270-447c-aaf5-c23411a541ee
slug: control-or-chain
title: "||: The Ladder Flips"
difficulty: 4
concepts:
  - control-flow
  - branches
  - short-circuit
  - delay-slots
symbol: func_803dee78
hints:
  - "`bltz` branches straight to the true-block (NOT inverted), then the
    `bnez` on the hoisted `slti` is the second condition, inverted. Read the
    slti's constant with the off-by-one in mind."
  - "The shape `x < 0 || x > K` is a range check. The success path returns the argument itself."
---

# One success exit, mixed directions

`||` compiles to a ladder like `&&`, with one important difference: **the
early conditions branch on success instead of failure**. As soon as any
condition holds, the whole `||` is true. So each early branch jumps *straight
to the true block*, with no inversion. Only the *last* condition is inverted,
because getting past it means every test failed. Here is
`if (a == 0 || b == 0) return 0; return 1;`:

```asm
 0:  beqz a0, 0x10        # a == 0? that alone decides it, so go
 4:  nop
 8:  bnez a1, 0x18        # last chance: b != 0 means NO condition held
 c:  addiu v0, zero, 1    # (delay slot) the all-failed value, preloaded
10:  jr   ra
14:  or   v0, zero, zero  # the || was true
18:  jr   ra
1c:  nop
```

Compare this, step by step, with the `&&` ladder. There, every branch was
inverted and aimed at the shared *failure* label. Here the first branch is the
C condition **exactly as written** (`beqz` for `== 0`), aimed at the *success*
label. Only the final `bnez` is flipped in the usual way. When you meet a
ladder, check where its branches point before you flip anything. Branches that
meet at the "then" block mean `||`. Branches that jump past it mean `&&`.

The target is the classic use of `||`: a **range check**, which rejects a
value that is out of bounds on either side. Expect a sign-test branch that
goes straight to the reject block. The second comparison, an `slti` against
the far boundary, is moved up into its delay slot. A final inverted branch
then decides between "return the value" and "return the fallback". Watch for
the `slti` flip's off-by-one when you recover the boundary.

## Your task

Write `func_803dee78` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803dee78(s32 x) {
    if (x < 0 || x > 9) {
        return 0;
    }
    return x;
}
```
