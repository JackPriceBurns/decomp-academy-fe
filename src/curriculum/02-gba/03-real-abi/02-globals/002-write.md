---
id: 9de98adf-91fa-4963-9bb8-ee371cafd8e2
slug: gba-globals-write
title: Writing a Global
difficulty: 3
concepts:
  - globals
  - literal-pool
  - memory
symbol: func_083206c8
hints:
  - The pool word is fetched into a scratch register first, because the value
    being stored needs a register of its own.
  - "One `s32` argument, nothing returned. `lsl r1, r0, #1 / add r1, r0` is the compiler's way of multiplying by a small constant — work out which one."
---

# The store side of the same pair

Writing a global uses the identical first step: fetch the address out of the
literal pool. The second step is a `str` instead of a `ldr`.

The register choice is what changes. On a read the address can land in the
destination register and be overwritten a moment later. On a write there is
already a value in flight, so the address has to go somewhere else — usually
`r1`, sometimes higher if the value itself needed a scratch register.

Two stores into two different globals:

```asm
0        ldr       r1, [pc, #4] (->8)
2        mov       r0, #0
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gVolume
```

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, #8
4        str       r0, [r1, #0]
6        bx        lr
8        .word     gTimer
```

`muteAudio` builds the value it wants with `mov r0, #0`; `nudgeTimer` adjusts
something it was handed. Both then write four bytes through the pooled address
with `str r0, [r1, #0]`. The `[r1, #0]` offset of zero is what a bare global
looks like — a non-zero offset there means an array element or a struct field,
which the next few lessons get to.

Notice where each listing stops. The store is the last useful thing either
function does, and nothing after it arranges a value for the caller — what sits
in `r0` at `bx lr` is debris from the work. Reading the tail of a listing that
way is how you guess whether a function hands anything back, and it stays a
guess: a result that already sits in `r0` needs no move either.

Your target does more to the value on its way to memory. Everything between the
pool load and the `str` is that work, and its shape is one you met in the
arithmetic chapter.

## Your task

Write `func_083206c8` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gScrollX;
```

<!-- solution -->
```c
void func_083206c8(s32 x) {
    gScrollX = x * 3;
}
```
