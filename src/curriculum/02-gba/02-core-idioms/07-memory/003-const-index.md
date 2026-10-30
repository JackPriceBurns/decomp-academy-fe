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
  - It takes one `s32 *` and returns an `s32`. The opening `mov` copies the
    base into another register, so the result can be built in `r0`.
---

# The index disappears into the instruction

`p[3]` means `*(p + 3)`. On a pointer to 32-bit words, that is twelve bytes
past the base. In Thumb, `ldr` and `str` have a small offset field inside the
instruction, so this addition does not need an instruction of its own.

The field does not hold a byte count. It holds the offset divided by the access
size. The field is five bits wide, and for a word the hardware multiplies it by
four. This is why a word load can reach offsets 0, 4, 8, 12 and so on, but
nothing in between. The workspace listing prints the byte offset after this
scaling, so the number you read is the index multiplied by four:

```asm
0        ldr       r0, [r0, #24]
2        bx        lr
```

Twenty-four bytes is element six. A store encodes the offset the same way:

```asm
0        str       r1, [r0, #20]
2        bx        lr
```

Twenty divided by four is five, so this is `p[5]`. `r1`, the second argument,
is the value stored into it.

There is one more detail when a function uses two constant indices from the
same base. The base must stay live across both accesses, and the result needs
to end up in `r0`. So gcc starts by copying the pointer into a scratch register
and works from that copy. An opening `mov r1, r0` before a pair of loads is
this bookkeeping. It tells you that both loads use the same base.

Your target reads two slots of one array. Divide each offset by four.

## Your task

Write `func_081fe254` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081fe254(s32 *p) {
    return p[3] + p[7];
}
```
