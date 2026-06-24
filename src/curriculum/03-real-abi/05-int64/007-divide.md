---
id: int64-divide
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
  - Just write `a / b` on two `u64` parameters.
---

# When there's no instruction for it

There is no hardware instruction to divide 64-bit integers on the GameCube/Wii,
so the compiler can't do it inline. Instead it emits a **call to a runtime helper
function** (a compiler *intrinsic*). Because the function now makes a call, it
also grows a real prologue and epilogue to save the link register:

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

The helper for unsigned 64-bit division is **`__div2u`**. Its signed sibling is
`__div2i`, and modulo uses `__mod2u` / `__mod2i`. Seeing a `bl` to one of these
`__…2u`/`__…2i` symbols is an immediate, unambiguous flag that a 64-bit divide or
modulo is happening — and unlike multiply, a downcast doesn't hide it, because the
call is made regardless of how wide the result is.

## Your task

Write `div_64` to match the target.

<!-- starter -->
```c
u64 div_64(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u64 div_64(u64 a, u64 b) {
    return a / b;
}
```
