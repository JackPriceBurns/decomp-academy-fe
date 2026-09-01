---
id: d1eceb95-02f8-4c5e-9dad-a06acc391020
slug: gba-types-narrow-return
title: Narrowing on the Way Out
difficulty: 3
concepts:
  - narrow-types
  - return-values
  - constants
symbol: func_081d17cc
hints:
  - Work out what the `mov` and `lsl` build together, then divide that number by
    65536 to see the constant the C actually wrote.
  - "One `s16` in, one `s16` out, and a single addition between them."
---

# Truncating before you leave

A function whose return type is narrower than a word still hands back a whole
register, and it is the callee's job to make the low bits correct. So a narrow
return type shows up as a shift pair at the very end, immediately before the
branch home:

```asm
0        sub       r0, r1
2        lsl       r0, #16
4        asr       r0, #16
6        bx        lr
```

Subtract at full width, then `lsl #16` / `asr #16` to keep 16 bits and spread
the sign. The same reading as always: the count gives the width, and the second
mnemonic gives the signedness of the return type.

Something more interesting happens when the value being returned is *already*
narrow. The result is going to be re-truncated anyway, so the entry extension
you saw in the last lesson is pointless - gcc drops it and does the arithmetic
up in the top of the register instead:

```asm
0        lsl       r0, #24
2        mov       r1, #128
4        lsl       r1, #17
6        add       r0, r1
8        lsr       r0, #24
10       bx        lr
```

That is a `u8` argument, plus one, returned as a `u8`. The value is shifted to
the top on the way in, and the constant has to travel with it: adding 1 to a
byte sitting at bits 24-31 means adding 1 << 24, which is 16777216, built here
as 128 << 17. The closing `lsr #24` does the truncation and the move back down
in a single instruction.

So the shape tells you where the work happened. A lone `lsl` at the top and a
single matching shift at the very end mean the compiler stayed up in the top of
the register the whole way, and any constant in the middle has been scaled up to
match. To read it back, shift the constant down by the same amount the value was
shifted up.

Your target does its work up in the top of the register too, sixteen bits wide.
Reconstruct the constant sitting in the middle of it before you write anything.

## Your task

Write `func_081d17cc` to reproduce the target assembly.

<!-- solution -->
```c
s16 func_081d17cc(s16 v) {
    return v + 100;
}
```
