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
  - The pool word is loaded into a scratch register first, because the value
    being stored needs its own register.
  - "It takes one `s32` argument and returns nothing. `lsl r1, r0, #1 / add r1, r0` is how the compiler multiplies by a small constant. Work out which constant."
---

# The store side of the same pair

Writing a global starts with the same first step: load the address from the
literal pool. The second step is a `str` instead of an `ldr`.

What changes is the choice of register. On a read, the address can go into the
destination register, because the value replaces it a moment later. On a write,
a register already holds the value to be stored, so the address has to go
somewhere else. That is usually `r1`, or a higher register if the value itself
needed a scratch register.

Here are two functions that each store to a different global:

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

`muteAudio` builds the value it wants with `mov r0, #0`. `nudgeTimer` changes a
value it was passed. Both then write four bytes to the address from the pool
with `str r0, [r1, #0]`. The offset of zero in `[r1, #0]` means a plain global.
A non-zero offset there means an array element or a struct field, which the
next few lessons cover.

Look at where each listing ends. The store is the last useful instruction in
both functions, and nothing after it sets up a value for the caller. Whatever
is in `r0` at `bx lr` is left over from the work. You can read the end of a
listing this way to guess whether a function returns a value. It is still only
a guess, because a result that is already in `r0` doesn't need a move either.

Your target does more work on the value before it stores it. That work is
everything between the pool load and the `str`, and you saw its pattern in the
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
