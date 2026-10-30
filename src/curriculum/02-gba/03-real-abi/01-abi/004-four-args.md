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
    and four. The two values computed from them become arguments one and two.
  - The function takes two `s32` parameters and returns an `s32`, and the
    call's result is returned unchanged. Each of the two parameters is passed
    twice, once adjusted and once as it is.
---

# Filling r0 to r3

Four arguments use all of the argument registers. The caller loads argument
one into `r0`, argument two into `r1`, argument three into `r2` and argument
four into `r3`, and then branches. So if you read a call site backwards from
the `bl`, you can rebuild the argument list directly. There is one
complication: the registers being filled are often the same registers being
read.

This overlap is the part to watch. Here is a call that passes the first two
arguments in swapped order and computes the other two from them:

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

`a` has to move to `r1` and `b` has to move to `r0`. Neither move can happen
first without destroying the other value. gcc solves this by doing things in a
careful order. It copies `a` out of the way into `r4`, then moves `b` down into
`r0`. Next it computes arguments three and four from the two copies, while both
are still available. Only then does it write `a` into `r1`. gcc picks this
order so that no live value is ever overwritten, and that is why the argument
setup does not read top to bottom.

The `pop {r0}` tells you that the calling function returns `void`. Nothing
comes back in `r0`, so `r0` is the cheapest place to put the return address.

Watch for one more habit. When gcc saves a copy of a value at a call site, it
often picks a register that is *already* going to hold an outgoing argument.
Then one `mov` both saves the value and sets up the argument. So a copy into
`r2` or `r3` early in a call sequence is not always a temporary. If you read it
as one, you will miss an argument.

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
