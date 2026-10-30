---
id: 5c4d8ae9-b2ab-4b27-b0d5-175518198a37
slug: abi-caller-stack-args
title: Passing More Than Four
difficulty: 3
concepts:
  - abi
  - calls
  - stack-args
  - frames
symbol: func_80313628
hints:
  - "Two constants are built in t-registers and stored to `16(sp)` and `20(sp)`. Those are the fifth and sixth argument slots, in that order."
  - "a0 through a3 are never touched, so the first four parameters pass straight through in declaration order."
---

# The caller's side of the stack argument

You have already *received* a fifth argument from `16(sp)`. Now look at it from
the other side. When your function **calls** something with five arguments,
your function must put the fifth one there. It stores it inside its own frame,
before the `jal`.

That affects the frame size. The minimal 24-byte frame contains only the four
reserved slots (0 through 12) and `ra`. An outgoing fifth argument needs a real
slot at `16(sp)`, so the frame grows. This is `launch5(a, b, c, d)`, which
calls `pack5(a, b, c, d, 9)`:

```asm
addiu  sp, sp, -32     # bigger frame: outgoing args now reach 16(sp)
sw     ra, 28(sp)      # so ra is saved higher up
addiu  t6, zero, 9     # the fifth argument's value
jal    pack5
sw     t6, 16(sp)      # stored into the fifth slot, in the delay slot
lw     ra, 28(sp)
addiu  sp, sp, 32
jr     ra
nop
```

How to read it:

- `a` through `d` arrive in `a0` through `a3`, and `pack5` wants them in the
  same registers. The compiler leaves them alone, so they cost nothing and
  don't appear in the listing.
- The fifth argument is built in a scratch register and **stored to
  `16(sp)`**. This time that store is the instruction in the `jal` delay slot.
  The argument is set up with a store instead of a register write, but it uses
  the same delay slot.
- The frame is 32 bytes instead of 24, and `ra` moved up to `28(sp)`. The frame
  size follows the *biggest* argument list this function ever passes. A sixth
  argument would go to `20(sp)`, just above the fifth.

The target passes **six** arguments. Find the two stored words, note which slot
each constant goes into, and remember that slot order is argument order.

## Your task

`extern s32 pack6(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f);` is declared for
you. Write `func_80313628` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80313628(s32 a, s32 b, s32 c, s32 d) {
    return pack6(a, b, c, d, 2, 7);
}
```

<!-- context -->
```c
extern s32 pack6(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f);
```
