---
id: 5a94d50c-2ecb-5d3b-8c7b-f0848a73794c
slug: optimization-scheduling-off
title: "#pragma scheduling off: Freezing the Order"
difficulty: 4
concepts:
  - scheduling
  - pragma
  - ordering
symbol: func_802a5354
hints:
  - "Same body as the very first lesson: two sums, then multiply them."
  - The pragma forces source order, so each `add` follows its own pair of loads.
  - Keep the `#pragma scheduling off`/`reset` lines untouched.
---

# Putting the instructions back in source order

That pragma has a twin: `scheduling off`. Switch it on and MWCC stops reordering
for latency, writing instructions out more or less in the order you typed them.
So the loads-first shape from before never shows up in a target built this way.
Loads end up wedged right against whatever consumes them.

Here's lesson 1's body again — two sums and a multiply — except this time
scheduling is off.

```asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0    # a computed immediately after its loads
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0    # b computed immediately after its loads
mullw r3, r5, r0
```

See how the four loads never get gathered up front. Each pair stays welded to its
own `add`, and that ordering — plus the register numbers it drags along — is the
tell for `scheduling off`. Peephole worked the same way. You bracket the region
and always close an `off` with a `reset`; in real decomp the two pragmas tend to
travel together around an entire function.

> The `#pragma scheduling off` / `reset` lines are already there in the starter
> and the solution, and they apply to the target as well, so your job is only the
> body.

## Your task

Write `func_802a5354` to match the un-batched, source-order assembly above. Read
which array slots pair with which `add`, and what the final `mullw` combines. With
scheduling off the compiler emits in source order, so the layout of the loads
tells you the layout of the C.

<!-- starter -->
```c
#pragma scheduling off
int func_802a5354(int *p) {
    return 0;
}
#pragma scheduling reset
```

<!-- solution -->
```c
#pragma scheduling off
int func_802a5354(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
#pragma scheduling reset
```
