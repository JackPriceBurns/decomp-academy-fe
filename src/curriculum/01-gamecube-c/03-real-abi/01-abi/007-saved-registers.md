---
id: 88d929d5-69be-5b0a-a4b2-5bb4880ba168
slug: abi-saved-registers
title: "Surviving a Call: Saved Registers"
difficulty: 3
concepts:
  - saved-registers
  - calls
  - register-allocation
symbol: keep
hints:
  - "`y` is needed after the call, so it can't stay in a volatile register."
  - Expect `stw r31,12(r1)` / `mr r31, r4` before the `bl`, and `mr r3, r31`
    after.
---

# Values that must outlive a call

Call something and it can scribble over any of `r3` through `r12`, the
**volatile** registers. That is a problem for a value you still need once the
call returns. It has to move out of harm's way, into a **non-volatile** register
from `r14` to `r31`. The ABI guarantees a callee restores those before it hands
control back. MWCC works from the top, so the very first value it rescues ends
up in **`r31`**.

Here is `preserve_z(s32 x, s32 y, s32 z)`: it calls `modify(y)` and returns `z`.
`z` shows up in `r5`, but the return needs it long after `modify` has run, so the
compiler tucks it into `r31` before branching.

```asm
stwu   r1,-16(r1)
mflr   r0
mr     r3,r4       # move y into r3 to pass as the argument
stw    r0,20(r1)
stw    r31,12(r1)  # save caller's r31 in the saved-register slot at 12(r1)
mr     r31,r5      # park z (r5) in non-volatile r31
bl     modify      # r3..r12 may be destroyed, but r31 is safe
lwz    r0,20(r1)
mr     r3,r31      # recover z for the return value
lwz    r31,12(r1)  # restore the caller's r31
mtlr   r0
addi   r1,r1,16
blr
```

Holding onto `r31` is not free. `stw r31, 12(r1)` stashes whatever the caller
left in `r31`, and `lwz r31, 12(r1)` hands it back at the end, so nobody upstream
notices we borrowed it. A `stw r31` sitting next to a `mr r31, ...` just before a
`bl` is the tell: something is riding across the call.

Now the target assembly for `keep`. Spot the register that gets dropped into
`r31` before the `bl` and pulled back out with `mr r3, r31` afterward, then chase
it back to whichever parameter fed it.

## Your task

Write `keep`, which calls `side` and then returns a surviving parameter.
`side` is declared for you.

<!-- solution -->
```c
int keep(int x, int y) {
    side(x);
    return y;
}
```

<!-- context -->
```c
extern int side(int x);
```
