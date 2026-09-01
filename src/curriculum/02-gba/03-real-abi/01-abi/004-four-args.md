---
id: 6b6ca18e-421f-4684-bd0e-66e363e684c4
slug: gba-abi-four-args
title: Four Arguments Fit
difficulty: 3
concepts:
  - abi
  - arguments
  - calls
symbol: func_082ead58
hints:
  - The two copies made before the arithmetic become outgoing arguments three
    and four, and the two values built on top of them become arguments one and
    two.
  - Two `s32` parameters in, an `s32` out, and the call's result is returned
    unchanged. Each of the two parameters is passed twice, once adjusted and
    once plain.
---

# Filling r0 to r3

Four arguments is the whole register budget. The caller loads argument one into
`r0`, two into `r1`, three into `r2`, four into `r3`, and branches. Reading a
call site backwards from the `bl` therefore reconstructs the argument list
directly — as long as you account for the fact that the registers you are
filling are frequently the registers you are reading.

That collision is the interesting part. Consider a call that swaps its first two
arguments and computes the other two from them:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r0, r1
6        add       r2, r4, r0
8        sub       r3, r4, r0
10       mov       r1, r4
12       bl        draw4-4
16       pop       {r4}
18       pop       {r0}
20       bx        r0
```

`a` has to move to `r1` and `b` to `r0`, and neither can go first without
destroying the other. gcc solves it by evacuating `a` into `r4`, moving `b` down
into `r0`, computing arguments three and four from the two copies while both are
still available, and only then writing `a` back into `r1`. The order is chosen
so that no live value is ever overwritten, which is why the argument setup does
not read top to bottom.

The `pop {r0}` says the function doing the calling returns `void` — nothing is
coming back in `r0`, so it is the cheapest place to land the return address.

One more habit to watch for. When gcc parks a copy at a call site it will
happily choose a register that is *already* destined to be an outgoing
argument, so that one `mov` does double duty as the save and as the argument
setup. A copy into `r2` or `r3` early in a call sequence is not always a
temporary, and reading it as one will cost you an argument.

## Your task

`extern s32 blit(s32 x, s32 y, s32 w, s32 h);` is declared for you. Write
`func_082ead58` to reproduce the target assembly.

<!-- context -->
```c
extern s32 blit(s32 x, s32 y, s32 w, s32 h);
```

<!-- solution -->
```c
s32 func_082ead58(s32 x, s32 y) {
    return blit(x + 1, y + 1, x, y);
}
```
