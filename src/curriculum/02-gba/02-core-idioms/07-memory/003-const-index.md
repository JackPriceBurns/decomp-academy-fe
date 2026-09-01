---
id: f4276a8e-56ca-4c01-aa47-8d863dc2f69f
slug: gba-memory-const-index
title: A Constant Index Is an Offset
difficulty: 2
concepts:
  - pointers
  - arrays
  - addressing
symbol: func_081fe254
hints:
  - Divide each printed offset by four to get back the index that was written
    in the C.
  - One `s32 *` in, an `s32` out. The opening `mov` is the compiler moving the
    base out of the way so the result can be built in `r0`.
---

# The index disappears into the instruction

`p[3]` means `*(p + 3)`, and on a pointer to 32-bit words that is twelve bytes
past the base. Thumb carries a small offset field inside `ldr` and `str`
precisely so that this addition never needs an instruction of its own.

The field does not hold a byte count. It holds the offset divided by the
access size — five bits, scaled back up by four for a word — which is why a
word load can address 0, 4, 8, 12 and nothing in between. The workspace
listing prints the byte offset after the scaling, so what you read is the
index multiplied by four:

```asm
0        ldr       r0, [r0, #24]
2        bx        lr
```

Twenty-four bytes is element six. The store direction encodes it the same way:

```asm
0        str       r1, [r0, #20]
2        bx        lr
```

Twenty divided by four is five, so that is `p[5]`, and `r1` — the second
argument — is the value going into it.

One wrinkle when a function touches two constant indices off the same base.
The base has to stay live across both accesses, but the result wants to end up
in `r0`, so gcc opens by copying the pointer into a scratch register and works
from there. An opening `mov r1, r0` in front of a pair of loads is that
bookkeeping, and it means the same base feeds both.

Your target reads two slots of one array. Divide each offset by four.

## Your task

Write `func_081fe254` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081fe254(s32 *p) {
    return p[3] + p[7];
}
```
