---
id: dbda911e-656e-403e-9196-14dc1ca16ebb
slug: gba-abi-callee-saved
title: Registers That Must Survive
difficulty: 3
concepts:
  - abi
  - callee-saved
  - calls
symbol: func_082e65e4
hints:
  - Two values are copied into saved registers before the call and used after
    it, in the order the two arithmetic instructions read them.
  - The function takes three `s32` parameters and returns an `s32`. Only the
    first parameter is passed to `probe`. The other two are applied to the
    result, with the multiply first.
---

# Registers that belong to the caller

The other half of the ABI is about what your function owes its caller.
`r0` to `r3` are yours to destroy, but `r4` to `r7` belong to the caller:
whatever was in them when your function started must still be there when it
returns. gcc treats them as extra registers it can use at a cost, and the cost
is a save and a restore.

gcc pays this cost even when the function makes no call. This function never
executes a `bl`, but it still starts with a push:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r0, r4
6        mul       r0, r1
8        mov       r1, r2
10       mul       r1, r3
12       add       r0, r1
14       add       r4, r3
16       sub       r0, r4
18       pop       {r4}
20       pop       {r1}
22       bx        r1
```

Four arguments arrive. Three of them are still needed after the first product
overwrites `r0`, and `r0` to `r3` cannot hold five live values at once. So gcc
borrows `r4`. As soon as `r4` goes into a push list, `lr` goes in with it. A
function that could have ended with a plain `bx lr` now needs the full two-step
return. So `push {r4, lr}` at the top of a listing does not prove, on its own,
that the function makes a call.

The stack layout forces two separate pops. A Thumb pop list restores registers
in ascending order from ascending addresses. `lr` was pushed last, so its saved
value sits at the top of the block. That value cannot be popped in the same
list as a lower-numbered register such as `r1`, and it cannot be popped into
`pc`. So the function does `pop {r4}`, then `pop {r1}`, then `bx r1`.

When the function does make a call, the saved register keeps a value safe
across it:

```asm
0        push      {r4, lr}
2        mov       r4, r1
4        bl        guard-4
8        lsl       r4, #2
10       add       r0, r4
12       pop       {r4}
14       pop       {r1}
16       bx        r1
```

`b` arrived in `r1`, and `guard` is free to destroy `r1`. So `b` is copied into
`r4` before the call and added into the result afterwards. Look at what went
into `r4`: `b` itself. The shift waits until address 8, although it could just
as well have run before the call. gcc saves the value that must survive the
call, and does the arithmetic on it only after the call returns.

This gives you a counting rule. **The number of registers from `r4` upward in
the push list is the number of values gcc could not keep in `r0` to `r3` for
as long as it needed them.** If one of those values arrived as an argument, a
`mov` right after the push copies it into its saved register.

## Your task

`extern s32 probe(s32 v);` is declared for you. Write `func_082e65e4` to
reproduce the target assembly.

<!-- context -->
```c
extern s32 probe(s32 v);
```

<!-- solution -->
```c
s32 func_082e65e4(s32 a, s32 b, s32 c) {
    return probe(a) * b + c;
}
```
