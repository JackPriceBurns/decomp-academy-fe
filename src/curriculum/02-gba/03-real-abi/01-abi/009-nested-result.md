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
  - The `mov r1, r0` after the first `bl` is the inner call's result being moved
    into an argument slot that is not the first one.
  - Two `s32` parameters in, an `s32` out. The first parameter feeds `lookup`,
    and the second is passed straight through to `wrapTo`.
---

# When a result is already in the right place

`r0` is where a function leaves its result and where the next function looks for
its first argument. Those two facts line up, and gcc exploits it: a call whose
result is the first argument of another call needs no plumbing whatsoever.

```asm
0        push      {lr}
2        bl        gammaOf-4
6        bl        tint-4
10       pop       {r1}
12       bx        r1
```

Five instructions for two calls and a return. No callee-saved register is
touched, because nothing needs to survive — the argument arrived in `r0`, the
first call consumed it and left its answer in `r0`, and that answer is exactly
what the second call wants. Two `bl`s back to back with no instruction between
them is one of the most compressed things this compiler produces.

Move the inner call to any other argument position and the arrangement collapses:

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

Now the inner result has to end up in `r2`, so it is moved out of `r0` the
instant the call returns, and the other two arguments have to be rebuilt
afterwards from copies parked in `r4` and `r5` before the call. Notice where
each half of that happens. The two cheap arguments are *computed* at addresses 2
and 4, before the call, because that is while the value they are made from is
still in `r1`; they are *placed* into `r0` and `r1` at 12 and 14, after it,
because that is when those registers are finally free. The call sits in the
middle of its own argument list.

That gives you a reading rule. A `mov rN, r0` immediately after a `bl`, where
`rN` is another argument register, means the inner call's result is argument
*N+1* of the outer call — and every `mov` that follows it is another argument
being restored around it.

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
