---
id: 72aac2f8-f636-4fd8-8c68-3df6024e62df
slug: gba-globals-narrow
title: Narrow Globals
difficulty: 4
concepts:
  - globals
  - narrow-types
  - sign-extension
symbol: func_0833b380
hints:
  - There are two pool words and two different load patterns. One of the
    globals is signed and 16 bits wide. The other is signed and 8 bits wide.
  - "It takes no arguments and returns an `s32`. The `ldrsh` value is on the left of the `sub`, and the sign-extended byte is on the right."
---

# Four narrow types and how each one loads

A global narrower than a word is loaded with an instruction that matches its
size. If it is signed, it is then extended to 32 bits. Thumb-1 makes that
extension awkward, and each of the four cases looks different, so they are
worth memorising.

The unsigned types are the simpler half. A `u8` global is read with a single
`ldrb`, and a `u16` global with a single `ldrh`. The load already fills the
upper bits with zeros, so no extra instruction follows it:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrb      r0, [r0, #0]
4        lsl       r0, #2
6        bx        lr
8        .word     gCombo
```

The `lsl #2` there is the multiply from the source. It has nothing to do with
extending the value.

Signed halfwords are harder, because the instruction set has a gap. Thumb-1 has
`ldrsh`, but only in the register-offset form. There is no
`ldrsh rN, [rM, #imm]`. So a signed 16-bit read has to use up a register to
hold an index of zero:

```asm
0        ldr       r0, [pc, #8] (->12)
2        mov       r1, #0
4        ldrsh     r0, [r0, r1]
6        add       r0, #1
8        bx        lr
10       .hword    0
12       .word     gAim
```

That `mov r1, #0` can look like part of the function's logic. It only provides
the zero offset for the load.

Signed bytes are different again. `ldrsb` exists in the same register-offset
form, but the compiler does not use it. It reads an `s8` global with an
unsigned `ldrb`, then sign-extends it by hand with `lsl rN, #24` followed by
`asr rN, #24`. That is three instructions, where the halfword case needed two.
With practice you will recognise that shift pair as a signed byte straight
away.

Your target reads two narrow globals of different widths and combines them.
Every extension in the listing belongs to one of the two loads.

## Your task

Write `func_0833b380` to reproduce the target assembly.

<!-- context -->
```c
extern s16 gOffsetY;
extern s8 gDrift;
```

<!-- solution -->
```c
s32 func_0833b380(void) {
    return gOffsetY - gDrift;
}
```
