---
id: dfd00711-197e-5ee7-93ff-8966db791d03
slug: abi-tail-call
title: Returning a Called Result Directly
difficulty: 3
concepts:
  - calls
  - return-value
  - calling-convention
symbol: call_it
hints:
  - "`x` passes through r3 into the call, and the result returns in r3."
  - No `mr` is needed around the `bl` — just the prologue/epilogue boilerplate.
---

# When the result is already in the right place

Some functions are pure middlemen. They call someone else and hand back
whatever comes out, nothing more. Since the callee drops its result in `r3`, and
that is the very register our own return value has to live in, nothing needs
shuffling between the call and the return. Here is `relay(s32 n) { return
mapper(n); }`.

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
bl     mapper
lwz    r0,20(r1)
mtlr   r0
addi   r1,r1,16
blr
```

It is not a leaf, mind you. That `bl` clobbers the link register, so the full
frame has to stick around to save and restore it. Even so, strip away the
prologue and epilogue and all that remains is one lonely `bl`. No `mr` shows up
to reposition the result, because `mapper` returns into `r3` and `relay` returns
from `r3`; same register, no move. The incoming argument coasts through `r3`
untouched too.

Do not mistake this for a tail call in the optimizing-compiler sense. MWCC
GC/2.0 never does tail-call elimination, so the `bl` always wears the full
prologue and epilogue and the function returns with a real `blr`. You will not
see a bare `b target` that hijacks the caller's frame. The compiler simply does
not emit that, so do not waste time hunting for it.

## Your task

Write `call_it` to match the target. `helper` is declared for you. Expect
the call surrounded only by the prologue and epilogue.

<!-- solution -->
```c
int call_it(int x) {
    return helper(x);
}
```

<!-- context -->
```c
extern int helper(int x);
```
