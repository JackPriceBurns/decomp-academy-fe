---
id: c419ba11-b0d0-41f2-8a34-c10031207c2a
slug: gba-control-compare-constant
title: Comparing Against a Constant
difficulty: 3
concepts:
  - branches
  - immediates
  - constants
symbol: func_08130b7c
hints:
  - The pool word is 299 and the branch skips the body when the value is greater
    than it. Undo the skip, then undo the compiler's off-by-one, and you have
    the relation that was written.
  - Two `s32` arguments and an `s32` result. The second argument is what comes
    back, incremented on the guarded path.
  - The `.hword 0` and the `.word` are data the compiler emitted for you. Write
    the constant in your C and they appear on their own.
---

# The number in the listing is not the number in the source

`cmp Rn, #imm` encodes eight bits, so a compare can name 0 through 255 directly
and nothing else. Before it even gets to that limit, though, gcc rewrites the
relation: `>=` and `<` against a constant are canonicalised into `>` and `<=`
with the constant nudged by one, because that is the form its comparison code
prefers.

The rewrite shows up immediately. This is a guarded statement, so the branch is
inverted to skip the body:

```asm
0        cmp       r0, #63
2        ble       6 ~>
4        mov       r1, #0
6      ~>mov       r0, r1
8        bx        lr
```

The listing says 63; the source said 64. Unpick it in two steps. The `ble`
skips, so the body runs when the value is *greater than* 63 — and "greater than
63" is the compiler's spelling of "at least 64". Either spelling in C produces
this exact listing, so both are correct answers; what matters is that you do not
read 63 as the constant the programmer typed.

Past 255 the constant needs a register of its own, built with the same
mov-and-shift trick arithmetic uses:

```asm
0        mov       r2, r1
2        mov       r1, #250
4        lsl       r1, #1
6        cmp       r0, r1
8        ble       12 ~>
10       mov       r2, #0
12     ~>mov       r0, r2
14       bx        lr
```

250 shifted left by one is 500, and `cmp r0, r1` compares against it. Note there
is no nudge this time: `>` against a constant is already the canonical form, so
500 in the listing really is 500 in the source. Note also the extra `mov r2, r1`
at the top — building the constant needs a scratch register, and `r1` was
occupied, so the value living there had to move first.

When no eight-bit value can be shifted up to reach the constant — anything
whose odd part is larger than 255 — mov-and-shift runs out and the compiler
falls back to a PC-relative load. The `.word`
it reads sits in the middle of the listing as data, with a `.hword 0` in front
of it when the pool would otherwise land off a four-byte boundary. Those rows
are not instructions and you do not write them — they appear as a consequence of
the constant you ask for.

Your target has a pool word, and its value is one away from the number you need
to write. Work out the direction from the branch.

## Your task

Write `func_08130b7c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08130b7c(s32 x, s32 y) {
    if (x < 300) y = y + 1;
    return y;
}
```
