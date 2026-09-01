---
id: c76ecb54-08e0-408d-9842-75b734daf4b0
slug: gba-abi-push-lr
title: Saving the Return Address
difficulty: 3
concepts:
  - abi
  - calls
  - epilogue
symbol: func_082e1e70
hints:
  - The four instructions between the push and the `bl` build both outgoing
    arguments; one is a constant, the other is a small multiply done with a
    shift and an add.
  - One `s32` in, an `s32` out. The whole body is a single call whose result is
    returned untouched.
---

# push {lr}, and the return that is never pop {pc}

`bl` does two things: it jumps, and it writes the address of the following
instruction into `lr`. That second half is destructive. If your function already
had a return address in `lr` — and it did, because that is how it was called —
the call obliterates it.

So any function containing a `bl` has to stash `lr` somewhere first, and the
cheapest somewhere is the stack: `push {lr}` at the top, restore at the bottom.
What it does *not* do is restore straight into `pc`. On the ARM7TDMI a
`pop {pc}` loads the program counter without switching instruction sets, which
breaks a Thumb function returning to an ARM caller. With `-mthumb-interwork` gcc
refuses to emit it at all, so the return is always two steps: pop the address
into a spare low register, then `bx` that register.

*Which* spare register is free information. gcc takes the lowest one that is not
carrying a result. Compare a function that returns nothing with one that returns
a value:

```asm
0        push      {lr}
2        lsl       r0, #4
4        sub       r0, r1
6        bl        emitPixel-4
10       pop       {r0}
12       bx        r0
```

```asm
0        push      {lr}
2        sub       r0, r1
4        bl        shade-4
8        lsl       r0, #1
10       pop       {r1}
12       bx        r1
```

The first returns `void`, so `r0` is dead the moment the call comes back and the
return address goes there. The second returns 32 bits in `r0`, so `r0` is
occupied and the address goes into `r1` instead. A 64-bit result fills `r0` and
`r1` together and pushes the return address up to `r2`. Read the last two
instructions of any non-leaf and you know the width of its return type before
you have written a line of C.

Both listings also show the `-4` on the branch target. That is the workspace
rendering the relocation's addend, not an instruction that does anything
different; `bl emitPixel-4` is a plain call to `emitPixel`.

## Your task

`extern s32 clampTo(s32 v, s32 hi);` is declared for you. Write
`func_082e1e70` to reproduce the target assembly.

<!-- context -->
```c
extern s32 clampTo(s32 v, s32 hi);
```

<!-- solution -->
```c
s32 func_082e1e70(s32 x) {
    return clampTo(x * 3, 100);
}
```
