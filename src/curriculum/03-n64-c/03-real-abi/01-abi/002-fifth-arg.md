---
id: 21a7f924-ab36-46c4-ab29-fd3899915c6a
slug: abi-fifth-arg
title: The Fifth Argument Lives on the Stack
difficulty: 2
concepts:
  - abi
  - arguments
  - stack-args
symbol: func_80069fe4
hints:
  - "The `lw` from `16(sp)` is the fifth argument. Note where its register joins the chain — it's used early."
  - "Track the running value line by line and note each mnemonic; the result is one argument plus another, minus the remaining three."
---

# Registers run out at four

Four argument registers, and not one more. When a function takes a fifth
argument, the caller has nowhere left to put it — so it goes on the **stack**.
By o32 rules the fifth argument sits at `16(sp)` the moment the function starts,
and the callee has to load it itself.

Here's `tallyFive(a, b, c, d, e)`, which returns the sum of all five:

```asm
lw    t9, 16(sp)    # e, the fifth argument, fetched from the caller's stack
addu  t6, a0, a1    # a + b
addu  t7, t6, a2    # + c
addu  t8, t7, a3    # + d
addu  v0, t8, t9    # + e
jr    ra
nop
```

Two things to notice:

- **The load comes first**, even though `e` is used last. Loads take a couple of
  cycles to land, so IDO schedules the `lw` early and does register math while
  the value arrives. Expect stack-argument loads at the top of a function.
- **Why 16?** The first 16 bytes above `sp` — offsets 0 through 12 — are four
  reserved slots that shadow `a0`–`a3`. A later lesson is entirely about those
  slots; for now, just know the fifth argument starts *after* them, at 16. A
  sixth would follow at `20(sp)`, and so on, one word each.

The target below leans on the stack too, but combines its arguments less
politely. Watch where the stack argument enters the chain.

## Your task

Write `func_80069fe4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80069fe4(s32 a, s32 b, s32 c, s32 d, s32 e) {
    return (a + e) - (b + c + d);
}
```
