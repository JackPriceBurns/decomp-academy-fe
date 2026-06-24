---
id: abi-saved-registers
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

A function call may clobber any **volatile** register (`r3`–`r12`). So if a value
has to still be around *after* a call returns, the compiler can't leave it in a
volatile register — it moves it into a **non-volatile** (callee-saved) register,
`r14`–`r31`, which the ABI promises any callee will preserve. MWCC fills these
from the top down, so the first such value goes in **`r31`**.

Consider `preserve_z(s32 x, s32 y, s32 z)`, which calls `modify(y)` and then
returns `z`. The third argument `z` arrives in `r5` and must be available after
the call, so the compiler parks it in `r31`:

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

Two new instructions join the prologue/epilogue: `stw r31, 12(r1)` saves the
incoming value of `r31` (so we can hand it back untouched), and the matching
`lwz r31, 12(r1)` restores it. Seeing a `stw r31` paired with a `mr r31, ...`
before a `bl` tells you a value is being preserved across the call.

Now read the target assembly for `keep`. Find which register is stashed into
`r31` before the `bl` and returned with `mr r3, r31` afterwards, and trace it
back to a parameter.

## Your task

Write `keep`, which calls `side` and then returns a surviving parameter.
`side` is declared for you.

<!-- starter -->
```c
int keep(int x, int y) {
    return 0;
}
```

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
