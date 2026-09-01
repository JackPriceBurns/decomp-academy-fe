---
id: 6a629675-3c9d-45cd-a950-f29bb34ad0f0
slug: gba-structs-far-field
title: A Field Past the Ceiling
difficulty: 3
concepts:
  - structs
  - addressing
  - offsets
hints:
  - "`add r0, #128` followed by `ldr r0, [r0, #0]` is one field access whose
    offset would not fit the load — a plain field name in the C, not pointer
    arithmetic."
  - A `struct Save *` in, a `u32` out. Two fields, four bytes apart in the
    struct, and only one of them fits an ordinary load.
symbol: func_0824e87c
---

# 124, 62, 31

The offset in a Thumb load is a five-bit field scaled by the access size. That
gives a word load offsets 0 to 124 in steps of 4, a halfword load 0 to 62 in
steps of 2, and a byte load 0 to 31 in steps of 1. Those three numbers are worth
memorising, because a struct field one byte past its ceiling generates
completely different code from the field before it.

Past the limit the addressing mode is unusable, so the compiler adds the offset
into a register first and then loads at `[rB, #0]`. It adds into whichever copy
of the pointer nothing needs again, and that is often the argument register
itself — which is why you will see a function modify its own argument and then
load from it.

Here is a function reading two byte fields of a log record with a 30-byte body
in the middle of it:

```asm
0        ldrb      r1, [r0, #31]
2        add       r0, #32
4        ldrb      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Both fields are single bytes, and they are *adjacent*. Offset 31 is the last one
a byte load can encode, so it loads directly. Offset 32 is one past, so it costs
an `add` and a second load. And because `r0` was spent building that second
address, the first value had to go somewhere else, the subtraction lands in `r1`,
and the return needs a `mov r0, r1` on the end. One byte of struct layout, three
extra instructions.

Reading this backwards is the skill. A bare `add rB, #N` immediately followed by
a load at `[rB, #0]` means "the field at offset N", and you should write it as a
plain field access. Writing `(u8 *)p + 32` or an intermediate pointer variable
will not reproduce it — the compiler got there from an ordinary `p->field`.

Your target does the same thing with word loads. Work out which of its two
fields is on which side of the ceiling.

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
