---
id: 723710c8-c65d-56bd-a8f8-0b2a5abfbd7f
slug: int64-divide
title: Division Calls an Intrinsic
difficulty: 2
concepts:
  - 64-bit
  - division
  - intrinsics
symbol: div_64
hints:
  - PowerPC has no 64-bit divide instruction, so the compiler emits a call to a runtime helper.
  - "Look for `bl __div2u` wrapped in a stack-saving prologue/epilogue (mflr/stw … lwz/mtlr)."
  - The helper name (`__div2u` vs `__mod2u`) tells you which single operator the source used.
---

# When there's no instruction for it

Now and then a 64-bit function suddenly sprouts a stack frame and a `bl` to some
`__`-prefixed symbol. That's division. PowerPC has no 64-bit divide instruction,
so the compiler can't inline it the way it inlines a multiply; it calls a runtime
helper, and the call forces a prologue and epilogue to save the link register:

```asm
stwu   r1, -16(r1)    # prologue: open a stack frame
mflr   r0
stw    r0, 20(r1)     # save the return address
bl     __div2u        # the 64-bit unsigned divide helper
lwz    r0, 20(r1)     # epilogue: restore...
mtlr   r0
addi   r1, r1, 16
blr
```

The `bl __div2u` in the middle is the whole point. `__div2u` is the unsigned
64-bit divide; `__div2i` is the signed one, and `__mod2u` and `__mod2i` cover
modulo. Spot a `bl` to any of those `__…2u` or `__…2i` names and you know a 64-bit
divide or modulo is in play. A multiply can vanish behind a downcast, but this
never does, because the call happens whatever the width of the result.

## Your task

Write `div_64` to match the target.

<!-- solution -->
```c
u64 div_64(u64 a, u64 b) {
    return a / b;
}
```
