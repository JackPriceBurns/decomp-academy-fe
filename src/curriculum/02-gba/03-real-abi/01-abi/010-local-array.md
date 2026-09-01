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
  - Sixteen bytes of frame, four word stores, and `mov r0, sp` says the block's
    own address is what gets passed — along with a second argument the listing
    builds with a `mov`.
  - Three `s32` parameters in, an `s32` out. The array holds the three
    parameters and then their sum.
---

# When a local needs an address

Registers have no addresses, so gcc keeps locals in them for as long as it can
get away with. A frame appears only when something forces the issue: an array
handed to another function, a variable whose address is taken, or an outgoing
argument block. Everything else stays in registers no matter how it was
declared.

This function has an array in it and no frame at all, because nothing ever asks
where the array lives:

```asm
0        mov       r1, r0
2        add       r2, r0, #1
4        mov       r0, r1
6        mul       r0, r2
8        bx        lr
```

The two elements were compiled into two registers and multiplied. `s32 t[2]` and
two scalars are the same thing to gcc until an address escapes.

When one does escape, the frame opens with `sub sp, #N` right after the push and
closes with a matching `add sp, #N` right before the pops. `N` is the total size
of every local that needed a slot, rounded up to a multiple of **four**. The
8-byte stack alignment modern ARM insists on came later; this ABI predates it.
Here is a six-byte buffer:

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

Six rounds up to eight. The first local sits at the bottom of the frame, so its
address is a bare `mov r0, sp` with no arithmetic at all. And the stores go
through `r1` rather than `sp` because Thumb has an `sp`-relative `str` but no
`sp`-relative `strb` or `strh` — a `mov r1, sp` followed by byte or halfword
stores is a reliable sign of a `u8` or `s16` local.

Word stores do not need that dance; they can address `[sp, #imm]` directly for
offsets up to 124. Read the offsets your target stores to and the frame size it
opened, and the shape of the local it is filling follows.

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
