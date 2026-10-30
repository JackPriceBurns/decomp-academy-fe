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
  - The pool word is 299, and the branch skips the body when the value is
    greater than it. Reverse the skip, then undo the compiler's change of one,
    and you have the comparison that was written.
  - There are two `s32` arguments and an `s32` result. The function returns the
    second argument, which is incremented on the guarded path.
  - The `.hword 0` and the `.word` are data that the compiler emits for you.
    Write the constant in your C and they appear by themselves.
---

# The constant in the listing can differ from the source

`cmp Rn, #imm` encodes eight bits, so a compare can use 0 through 255 directly
and nothing else. But before that limit matters, gcc rewrites the comparison.
It turns `>=` and `<` against a constant into `>` and `<=`, and changes the
constant by one. That is the standard form its comparison code prefers.

You can see the rewrite straight away. This is a guarded statement, so the
branch is inverted to skip the body:

```asm
0        cmp       r0, #63
2        ble       6 ~>
4        mov       r1, #0
6      ~>mov       r0, r1
8        bx        lr
```

The listing says 63, but the source said 64. Work it out in two steps. The `ble`
skips the body, so the body runs when the value is *greater than* 63. And
"greater than 63" is how the compiler writes "at least 64". Both ways of writing
it in C produce this exact listing, so both are correct answers. What matters
is that you do not read 63 as the constant the programmer typed.

Above 255, the constant needs a register of its own. The compiler builds it the
same way as in arithmetic, with a move and then a shift:

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

250 shifted left by one is 500, and `cmp r0, r1` compares against it. This
time the constant is not changed by one: `>` against a constant is already the
standard form, so 500 in the listing is 500 in the source. Note also the extra
`mov r2, r1` at the top. Building the constant needs a scratch register, and
`r1` was in use, so its value had to move first.

Sometimes no eight-bit value can be shifted up to reach the constant. This
happens for any constant whose odd part is larger than 255. Then a move and a
shift cannot build it, and the compiler uses a PC-relative load instead. The
`.word` it loads sits in the middle of the listing as data. A `.hword 0` comes
before it when the pool would otherwise not sit on a four-byte boundary. Those
rows are not instructions, and you do not write them. They appear because of the
constant you use.

Your target has a pool word, and its value is one away from the number you need
to write. Use the branch to work out which direction.

## Your task

Write `func_08130b7c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08130b7c(s32 x, s32 y) {
    if (x < 300) y = y + 1;
    return y;
}
```
