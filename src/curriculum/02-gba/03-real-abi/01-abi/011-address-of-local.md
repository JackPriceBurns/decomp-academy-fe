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
  - The frame is eight bytes and nothing is stored into it before the call, so both slots are outputs. The call fills them, and the two `ldr`s afterwards read them back.
  - "The function takes one `s32` and returns an `s32`. The slot at `[sp, #4]` is the second pointer argument, and the subtraction reads it first."
---

# Passing a pointer into your own frame

Once a local has a stack slot, `&local` is the address of that slot, and
computing it takes one instruction. The first local sits at the bottom of the
frame, so its address is `mov r0, sp`. Any local above it uses
`add rN, sp, #offset`. No other addressing mode is used. gcc computes the
address at the point where it is needed, and does not keep it in a variable of
its own.

For matching, the important part is what happens *after* you pass the address
to another function. gcc cannot know what the callee did with it, so it can no
longer trust the copy of the value it was holding in a register. The slot in
memory becomes the only reliable copy, and the value must be read again:

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

The frame is four bytes, for one `s32`. The value is computed in `r0` and
stored into the slot. Then the slot's address replaces it in `r0`, and the call
runs. Now look at address 14. The same value is loaded back from the same slot
instead of being kept in a saved register, because `refine` was given a pointer
to it and may have changed it. A local that is only *read* after a call is
copied to `r4`. A local whose address was given to another function is loaded
again from memory. The difference between these two shapes tells you whether a
pointer was passed.

This also changes how you read a frame. A `sub sp, #4` with a store into the
slot before the call means an input is being passed by pointer. A `sub sp, #8`
with no stores before the call means two *outputs*. The callee is expected to
fill them, so the caller writes nothing first and only reads afterwards.

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
