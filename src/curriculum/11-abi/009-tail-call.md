---
id: abi-tail-call
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

Sometimes a function does nothing but call another and hand back what it gets.
Because the callee leaves its result in `r3` — exactly where our own return
value must be — there is no shuffling to do between the call and the return:

```asm
stwu r1, -16(r1)
mflr r0
stw  r0, 20(r1)
bl   helper        # helper(x)# result lands in r3
lwz  r0, 20(r1)
mtlr r0
addi r1, r1, 16
blr                # r3 already holds helper(x)
```

This still isn't a leaf — the `bl` forces the full frame so the link register
survives — but the *body* is just the call. There's no `mr` to move the result
into place, because `helper`'s return register and `call_it`'s return register
are the same `r3`. The argument `x` likewise passes straight through `r3`
untouched.

Note this is **not** a tail call in the optimized sense: MWCC GC/2.0 does not
do tail-call elimination, so you always get the full prologue/epilogue around
the `bl` and a `blr` to return — never a bare `b helper` that reuses the
caller's frame. Don't go looking for that pattern; this compiler never emits it.

## Your task

Write `call_it` to match the target. `helper` is declared for you. Expect
the call surrounded only by the prologue and epilogue.

<!-- starter -->
```c
int call_it(int x) {
    return 0;
}
```

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
