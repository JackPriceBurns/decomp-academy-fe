---
id: 563a7e31-d2fd-48a5-9feb-0c539c7d4737
slug: abi-incoming-after-frame
title: Stack Arguments After Opening a Frame
difficulty: 4
concepts:
  - abi
  - stack-args
  - frames
  - homing
  - calls
symbol: func_8018e9f8
hints:
  - "`40(sp)` is `16(sp)` plus the 24-byte frame, so it is the fifth incoming argument. It is added to the reloaded first argument to build the call's `a0`."
  - "The middle three parameters pass through in their own registers, untouched. Only the first outgoing argument is computed."
---

# 16(sp) doesn't stay 16(sp)

There is one more detail about stack arguments. A fifth incoming argument is at
`16(sp)` *when the function starts*. As soon as your function opens a frame,
`sp` moves down, and every incoming offset grows by the frame size. With a
24-byte frame, your fifth argument is now at `16 + 24 = 40(sp)`. It is the same
word of memory at a new offset. The home slots move in the same way: `a0`'s
slot becomes `24(sp)`, `a1`'s becomes `28(sp)`, and so on. You saw exactly
this in the lesson on keeping a value across a call.

This is `handOver(a, b, c, d, e)`, a function with five arguments that calls
`give(b, e)`:

```asm
addiu  sp, sp, -24
sw     a2, 32(sp)      # home c   (8  + 24)
or     a2, a1, zero    # b copied aside
sw     ra, 20(sp)
sw     a0, 24(sp)      # home a   (0  + 24)
sw     a1, 28(sp)      # home b   (4  + 24)
sw     a3, 36(sp)      # home d   (12 + 24)
or     a0, a2, zero    # first outgoing argument: b
jal    give
lw     a1, 40(sp)      # second outgoing: e, the fifth incoming (16 + 24)
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

How to read it:

- `a`, `c` and `d` are never used, so they are homed. `b` is homed *and* moved
  through `a2` on its way to `a0`. That path comes from the register
  allocator, and the C does not ask for it. You can ignore the moves through
  `a2`. The *offsets* are the part that tells you something.
- The single load from `40(sp)`, in the delay slot of the `jal`, is the line
  to look for. It is an incoming stack argument being passed on. Subtract the
  frame size and you get `16`, which is argument five.

The target calls a function with four arguments. One outgoing argument is
computed (watch the delay slot), and three are passed straight through. Work
out the offsets and every line will make sense.

## Your task

`extern s32 stamp(s32 a, s32 b, s32 c, s32 d);` is declared for you. Write
`func_8018e9f8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8018e9f8(s32 a, s32 b, s32 c, s32 d, s32 e) {
    return stamp(a + e, b, c, d);
}
```

<!-- context -->
```c
extern s32 stamp(s32 a, s32 b, s32 c, s32 d);
```
