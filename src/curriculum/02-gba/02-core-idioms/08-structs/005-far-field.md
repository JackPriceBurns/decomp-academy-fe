---
id: 6a629675-3c9d-45cd-a950-f29bb34ad0f0
slug: gba-structs-far-field
title: A Field Past the Offset Limit
difficulty: 3
concepts:
  - structs
  - addressing
  - offsets
hints:
  - "`add r0, #128` followed by `ldr r0, [r0, #0]` is one field access whose
    offset is too large for the load. In the C it is a plain field name, with
    no pointer arithmetic."
  - The function takes a `struct Save *` and returns a `u32`. It reads two
    fields that are four bytes apart in the struct, and only one of them fits an
    ordinary load.
symbol: func_0824e87c
---

# Offset limits: 124, 62 and 31

The offset in a Thumb load is a five-bit field, scaled by the access size. So a
word load can reach offsets 0 to 124 in steps of 4, a halfword load 0 to 62 in
steps of 2, and a byte load 0 to 31 in steps of 1. Those three numbers are worth
memorising. A struct field one byte past the limit produces very different code
from the field before it.

Past the limit, the compiler cannot put the offset in the load. Instead it adds
the offset to a register first and then loads from `[rB, #0]`. It adds to
whichever copy of the pointer is not needed again, and that is often the
argument register itself. This is why you will see a function change its own
argument and then load from it.

Here is a function that reads two byte fields of a log record. The record has a
30-byte body in the middle:

```asm
0        ldrb      r1, [r0, #31]
2        add       r0, #32
4        ldrb      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Both fields are single bytes, and they are *adjacent*. Offset 31 is the last
offset a byte load can encode, so that field is loaded directly. Offset 32 is
one past the limit, so it needs an `add` and a second load. Building that second
address used up `r0`, so the first value had to go in another register. As a
result, the subtraction ends up in `r1`, and the function needs a `mov r0, r1`
at the end to return it. So one byte of difference in the struct layout costs
three extra instructions.

The useful skill is reading this pattern in reverse. A bare `add rB, #N`
followed straight away by a load at `[rB, #0]` means "the field at offset N".
Write it as a plain field access. Writing `(u8 *)p + 32` or using a separate
pointer variable will not reproduce it. The compiler produced this code from an
ordinary `p->field`.

Your target does the same thing with word loads. Work out which of its two
fields is on each side of the limit.

## Your task

Write `func_0824e87c` to reproduce the target assembly.

<!-- context -->
```c
struct Save {
    u32 slots[31];
    u32 checksum;
    u32 magic;
    u16 flags;
    u16 version;
};
```

<!-- solution -->
```c
u32 func_0824e87c(struct Save *s) {
    return s->magic - s->checksum;
}
```
