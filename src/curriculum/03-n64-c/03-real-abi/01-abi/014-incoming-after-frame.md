---
id: 563a7e31-d2fd-48a5-9feb-0c539c7d4737
slug: abi-incoming-after-frame
title: Stack Arguments, Seen Through Your Own Frame
difficulty: 4
concepts:
  - abi
  - stack-args
  - frames
  - homing
  - calls
symbol: func_8018e9f8
hints:
  - "`40(sp)` is `16(sp)` plus the 24-byte frame: the fifth incoming argument.
    It gets added to a reloaded first argument to build the call's `a0`."
  - "The middle three parameters pass through in their own registers untouched — only the first outgoing argument is computed."
---

# 16(sp) doesn't stay 16(sp)

One subtlety left in the stack-argument story. A fifth incoming argument sits
at `16(sp)` *on entry*. But the moment your function opens a frame, `sp` drops,
and every incoming offset grows by the frame size. Open a 24-byte frame and
your fifth argument now reads at `16 + 24 = 40(sp)`. Same word of memory, new
name. The home slots move the same way: `a0`'s slot becomes `24(sp)`, `a1`'s
`28(sp)`, and so on — you saw exactly that in the keep-across-a-call lesson.

Here's `handOver(a, b, c, d, e)`, a five-argument function that calls
`give(b, e)`:

```asm
addiu  sp, sp, -24
sw     a2, 32(sp)      # home c   (8  + 24)
or     a2, a1, zero    # b rescued aside
sw     ra, 20(sp)
sw     a0, 24(sp)      # home a   (0  + 24)
sw     a1, 28(sp)      # home b   (4  + 24)
sw     a3, 36(sp)      # home d   (12 + 24)
or     a0, a2, zero    # first outgoing argument: b
jal    give
lw     a1, 40(sp)      # second outgoing: e — the fifth incoming, 16 + 24
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Decode the noise calmly:

- `a`, `c`, `d` are never used → homed. `b` gets homed *and* shuffled through
  `a2` on its way to `a0` — the register allocator's route, not anything the C
  spells out. Treat the shuffle as scenery; the *offsets* are what carry
  meaning.
- The one load from `40(sp)`, in the `jal`'s delay slot, is the giveaway line:
  an incoming stack argument being passed on. Subtract the frame size and
  you're back at `16` — argument five.

The target calls a four-argument function. One outgoing argument is computed
(watch the delay slot); three pass straight through. Do the offset arithmetic
and every line falls into place.

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
