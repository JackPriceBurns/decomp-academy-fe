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
    arguments. One argument is a constant. The other is a small multiply, done
    with a shift and an add.
  - The function takes one `s32` and returns an `s32`. The whole body is a
    single call, and the result of that call is returned unchanged.
---

# push {lr}, and a return without pop {pc}

`bl` does two things. It jumps, and it writes the address of the next
instruction into `lr`. The second part is destructive. Your function already
had a return address in `lr`, because that is how it was called, and the call
overwrites it.

So any function that contains a `bl` must save `lr` somewhere first. The
cheapest place is the stack: `push {lr}` at the top, and a restore at the
bottom. The restore does not load the address straight back into `pc`. On the
ARM7TDMI, `pop {pc}` loads the program counter without switching instruction
sets, which breaks a Thumb function that returns to an ARM caller. With
`-mthumb-interwork`, gcc never emits it. The return always takes two steps: pop
the address into a spare low register, then `bx` that register.

The spare register gcc picks gives you useful information. It takes the lowest
register that is not holding a result. Compare a function that returns nothing
with one that returns a value:

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

The first function returns `void`, so `r0` is no longer needed once the call
comes back, and the return address goes there. The second returns 32 bits in
`r0`, so `r0` is in use and the address goes into `r1` instead. A 64-bit result
fills both `r0` and `r1`, which moves the return address up to `r2`. So the
last two instructions of any non-leaf function tell you the width of its return
type before you write any C.

Both listings also show `-4` on the branch target. This is how the workspace
displays the relocation's addend. It does not change what the instruction does:
`bl emitPixel-4` is a plain call to `emitPixel`.

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
