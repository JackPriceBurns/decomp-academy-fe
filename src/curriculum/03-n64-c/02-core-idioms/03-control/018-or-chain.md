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

`||` compiles to a ladder like `&&`, but with a twist that trips people up
the first time: **the early conditions branch on success, not failure**. As
soon as any condition holds, the whole `||` is true — so each early branch
jumps *straight to the true block*, no inversion. Only the *last* condition
inverts, because falling past it means every test failed. Here's
`if (a == 0 || b == 0) return 0; return 1;`:

```asm
 0:  beqz a0, 0x10        # a == 0? that alone decides it — go
 4:  nop
 8:  bnez a1, 0x18        # last chance: b != 0 means NO condition held
 c:  addiu v0, zero, 1    # (delay slot) the all-failed value, preloaded
10:  jr   ra
14:  or   v0, zero, zero  # the || was true
18:  jr   ra
1c:  nop
```

Compare rung by rung with the `&&` ladder: there, every branch was inverted
and aimed at the shared *failure* label. Here the first branch is the C
condition **verbatim** (`beqz` for `== 0`), aimed at the *success* label —
and only the final `bnez` plays the usual opposites game. When you meet a
ladder, check where its branches point before flipping anything: branches
converging on the "then" block mean `||`, branches escaping past it mean
`&&`.

The target is the classic use of `||`: a **range check**, rejecting a value
that's out of bounds on either side. Expect a sign-test branch that goes
straight to the reject block, with the second comparison — an `slti` against
the far boundary — hoisted into its delay slot, and a final inverted branch
deciding between "return the value" and "return the fallback". Mind the
`slti` flip's off-by-one when you recover the boundary.

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
