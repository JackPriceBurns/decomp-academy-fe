---
id: cc69de85-5acd-464e-9f50-cf6f41473241
slug: gba-abi-nested-result
title: Feeding One Call Into Another
difficulty: 4
concepts:
  - abi
  - calls
  - arguments
symbol: func_0830129c
hints:
  - The `mov r1, r0` after the first `bl` moves the inner call's result into an
    argument slot other than the first one.
  - The function takes two `s32` parameters and returns an `s32`. The first
    parameter is passed to `lookup`, and the second is passed straight through
    to `wrapTo`.
---

# When a result is already in the right place

A function leaves its result in `r0`, and the next function looks for its
first argument in `r0`. gcc takes advantage of this. If one call's result is
the first argument of another call, no extra instructions are needed to pass it
on:

```asm
0        push      {lr}
2        bl        gammaOf-4
6        bl        tint-4
10       pop       {r1}
12       bx        r1
```

That is five instructions for two calls and a return. No callee-saved register
is used, because no value needs to survive a call. The argument arrived in
`r0`, the first call used it and left its answer in `r0`, and that answer is
exactly what the second call needs. Two `bl`s in a row, with no instruction
between them, is one of the most compact things this compiler produces.

If you move the inner call to any other argument position, this no longer
works:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r1
4        lsl       r5, r4, #1
6        bl        tint-4
10       mov       r2, r0
12       mov       r0, r4
14       mov       r1, r5
16       bl        pick3-4
20       pop       {r4, r5}
22       pop       {r1}
24       bx        r1
```

Now the inner result has to end up in `r2`, so it is moved out of `r0` as soon
as the call returns. The other two arguments are then rebuilt from copies that
were saved in `r4` and `r5` before the call. Notice where each part of that
happens. The two simple arguments are *computed* at addresses 2 and 4, before
the call, while the value they are made from is still in `r1`. They are
*placed* into `r0` and `r1` at 12 and 14, after the call, because only then are
those registers free. So the inner call sits in the middle of the outer call's
argument setup.

This gives you a reading rule. Suppose a `mov rN, r0` comes right after a
`bl`, and `rN` is another argument register. Then the inner call's result is
argument *N+1* of the outer call, and each `mov` after it restores one of the
other arguments.

## Your task

`extern s32 lookup(s32 i);` and `extern s32 wrapTo(s32 v, s32 m);` are declared
for you. Write `func_0830129c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 lookup(s32 i);
extern s32 wrapTo(s32 v, s32 m);
```

<!-- solution -->
```c
s32 func_0830129c(s32 i, s32 m) {
    return wrapTo(m, lookup(i));
}
```
