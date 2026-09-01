---
id: 099ae1f6-832e-48e7-87e2-2a25baccd643
slug: gba-abi-address-of-local
title: The Address of a Local
difficulty: 4
concepts:
  - abi
  - frames
  - pointers
symbol: func_0830a184
hints:
  - Eight bytes of frame and nothing stored into it before the call, so both slots are outputs — the call fills them and the two `ldr`s afterwards read them back.
  - "One `s32` in, an `s32` out. The slot at `[sp, #4]` is the second pointer argument, and the subtraction reads it first."
---

# Handing out a pointer to your own frame

Once a local has a slot, `&local` is just that slot's address, and computing it
is one instruction. The first local sits at the bottom of the frame, so its
address is `mov r0, sp`; anything above it is `add rN, sp, #offset`. No other
addressing mode is involved, and the address is materialised at the point of use
rather than parked in a variable of its own.

The consequence that matters for matching is what happens *after* you hand the
address over. gcc has no idea what the callee did with it, so the register copy
it was holding is dead — the slot in memory becomes the only authoritative copy,
and the value has to be re-read:

```asm
0        push      {lr}
2        sub       sp, #4
4        lsl       r0, #1
6        str       r0, [sp, #0]
8        mov       r0, sp
10       bl        refine-4
14       ldr       r1, [sp, #0]
16       add       r0, r1
18       add       sp, #4
20       pop       {r1}
22       bx        r1
```

Four bytes of frame for one `s32`. The value is computed in `r0`, stored into the
slot, the slot's address replaces it in `r0`, and the call runs. Then look at
address 14: the same value is loaded back out of the same slot rather than kept
in a saved register, because `refine` was given a pointer to it and may have
changed it. A local that is only *read* after a call gets copied to `r4`; a local
whose address escaped gets re-loaded. The difference between those two shapes
tells you whether a pointer was passed.

This also flips the usual signal about frames. `sub sp, #4` with a store into the
slot before the call is an input being passed by pointer. `sub sp, #8` with no
stores before the call is two *outputs* — the callee is expected to fill them, so
there is nothing to write first, only reads afterwards.

## Your task

`extern void split(s32 *lo, s32 *hi, s32 v);` is declared for you. Write
`func_0830a184` to reproduce the target assembly.

<!-- context -->
```c
extern void split(s32 *lo, s32 *hi, s32 v);
```

<!-- solution -->
```c
s32 func_0830a184(s32 v) {
    s32 lo;
    s32 hi;
    split(&lo, &hi, v);
    return hi - lo;
}
```
