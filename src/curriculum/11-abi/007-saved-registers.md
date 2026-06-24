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

Here `y` must survive the `side(x)` call so it can be returned afterwards:

```asm
stwu r1, -16(r1)
mflr r0
stw  r0, 20(r1)
stw  r31, 12(r1)   # save caller's r31 in the saved-register slot at 12(r1)
mr   r31, r4       # park y (r4) in non-volatile r31
bl   side          # side(x)# r3..r12 may be destroyed, but r31 is safe
mr   r3, r31       # recover y for the return value
lwz  r31, 12(r1)   # restore the caller's r31
... epilogue ...
blr
```

Two new instructions join the prologue/epilogue: `stw r31, 12(r1)` saves the
incoming value of `r31` (so we can hand it back untouched), and the matching
`lwz r31, 12(r1)` restores it. Seeing a `stw r31` paired with a `mr r31, ...`
right before a `bl` tells you a value is being preserved across the call.

## Your task

Write `keep`, which calls `side(x)` (ignoring its result) and then returns `y`.
`side` is declared for you. `y` must survive the call, so watch it land in
`r31`.

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
