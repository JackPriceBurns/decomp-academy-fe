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
  - Two pool words, two different load shapes - one of the globals is signed
    and 16 bits wide, the other is signed and 8 bits wide.
  - "Nothing in, an `s32` out. The `ldrsh` value is on the left of the `sub` and the sign-extended byte is on the right."
---

# Four narrow globals, four different shapes

A global narrower than a word is loaded with an instruction that matches its
size, and then, if it is signed, extended to 32 bits. Thumb-1 makes that second
half awkward in a way worth memorising, because the four cases look nothing like
each other.

Unsigned is the easy half. A `u8` global is a bare `ldrb` and a `u16` global is
a bare `ldrh` — the load zero-extends for free, so nothing follows it:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrb      r0, [r0, #0]
4        lsl       r0, #2
6        bx        lr
8        .word     gCombo
```

The `lsl #2` there is the multiply in the source, not an extension.

Signed halfwords are where the instruction set runs out. Thumb-1 has `ldrsh`,
but only in the register-offset form — there is no `ldrsh rN, [rM, #imm]`. So a
signed 16-bit read has to burn a register on a zero index:

```asm
0        ldr       r0, [pc, #8] (->12)
2        mov       r1, #0
4        ldrsh     r0, [r0, r1]
6        add       r0, #1
8        bx        lr
10       .hword    0
12       .word     gAim
```

That `mov r1, #0` is easy to mistake for part of the surrounding logic. It is
purely the zero offset for the load.

Signed bytes are the odd one out. `ldrsb` exists in the same register-offset
form, and the compiler declines to use it: an `s8` global is read with an
unsigned `ldrb` and then sign-extended by hand with `lsl rN, #24` followed by
`asr rN, #24`. Three instructions where the halfword case took two, and a shift
pair you will learn to read as "this was a signed byte" on sight.

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
