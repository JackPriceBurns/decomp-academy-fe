---
id: d612ca2d-8f9d-4a03-9f58-34cd40dea5d9
slug: gba-abi-local-array
title: Room on the Stack
difficulty: 4
concepts:
  - abi
  - frames
  - stack
symbol: func_08305a10
hints:
  - The frame is sixteen bytes and there are four word stores. The
    `mov r0, sp` shows that the block's own address is passed, along with a
    second argument that the listing builds with a `mov`.
  - The function takes three `s32` parameters and returns an `s32`. The array
    holds the three parameters and then their sum.
---

# When a local needs an address

A register has no address, so gcc keeps local variables in registers whenever
it can. It creates a stack frame only when something requires one: an array
passed to another function, a variable whose address is taken, or an outgoing
argument block. Everything else stays in registers, however it was declared.

This function contains an array but has no frame at all, because nothing ever
needs the array's address:

```asm
0        mov       r1, r0
2        add       r2, r0, #1
4        mov       r0, r1
6        mul       r0, r2
8        bx        lr
```

gcc put the two elements in two registers and multiplied them. To gcc,
`s32 t[2]` and two separate variables are the same thing, until something uses
the array's address.

When an address is needed, gcc opens the frame with `sub sp, #N` right after
the push, and closes it with a matching `add sp, #N` right before the pops. `N`
is the total size of every local that needed a slot, rounded up to a multiple
of **four**. Modern ARM code requires 8-byte stack alignment, but that rule
came later than this ABI. Here is a buffer of six bytes:

```asm
0        push      {lr}
2        sub       sp, #8
4        mov       r1, sp
6        strb      r0, [r1, #0]
8        strb      r0, [r1, #5]
10       mov       r0, sp
12       bl        sendBuf-4
16       add       sp, #8
18       pop       {r1}
20       bx        r1
```

Six rounds up to eight. The first local sits at the bottom of the frame, so
getting its address takes only a `mov r0, sp`, with no arithmetic. The stores
go through `r1` instead of `sp`. Thumb has a `str` that addresses relative to
`sp`, but it has no `sp`-relative `strb` or `strh`. So a `mov r1, sp` followed
by byte or halfword stores is a reliable sign of a `u8` or `s16` local.

Word stores do not need this extra step. They can address `[sp, #imm]`
directly, for offsets up to 124. Read the offsets your target stores to and the
size of the frame it opens. Together they tell you the shape of the local it
fills.

## Your task

`extern s32 total(s32 *p, s32 n);` is declared for you. Write `func_08305a10` to
reproduce the target assembly.

<!-- context -->
```c
extern s32 total(s32 *p, s32 n);
```

<!-- solution -->
```c
s32 func_08305a10(s32 a, s32 b, s32 c) {
    s32 t[4];
    t[0] = a;
    t[1] = b;
    t[2] = c;
    t[3] = a + b + c;
    return total(t, 4);
}
```
