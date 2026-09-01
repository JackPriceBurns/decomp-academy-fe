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
  - Two registers are parked before the call and consumed after it, in the order
    the two arithmetic instructions read them.
  - Three `s32` parameters in, an `s32` out. Only the first one is passed to
    `probe`; the other two are applied to the result, multiply first.
---

# Somebody else's registers

The other half of the ABI contract is the half you owe. `r0`-`r3` are yours to
destroy, but `r4`-`r7` belong to your caller: whatever was in them when you were
entered has to be there when you leave. gcc treats them as a reserve it can draw
on at a price, and the price is a save and a restore.

The price is charged even when there is no call in sight. This function never
executes a `bl`, and still opens with a push:

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

Four arguments arrive, three of them are still needed after `r0` has been
overwritten by the first product, and `r0`-`r3` cannot hold five live values. So
gcc borrows `r4` — and the moment `r4` goes into a push list, `lr` is dragged in
with it, which turns a function that could have ended in a bare `bx lr` into one
with the full two-step return. `push {r4, lr}` at the top of a listing is not by
itself evidence of a call.

The two pops are forced by the layout. A Thumb pop list restores in ascending
register order from ascending addresses, and `lr` was pushed last, so it sits at
the top of the block. It cannot share a list with a lower-numbered register like
`r1`, and it cannot be popped into `pc`. Hence `pop {r4}`, then `pop {r1}`, then
`bx r1`.

Around a real call the same reserve does the obvious job:

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

`b` arrived in `r1`, which `guard` is free to destroy, so it is copied into `r4`
before the call and folded into the result afterwards. Look at what went into
`r4`: `b` itself, with the shift deferred to address 8. That shift could have
run before the call just as easily. gcc parks the value that has to survive and
leaves the arithmetic on it until the call is back.

That gives you a counting rule: **the number of `r4`-and-up registers in the
push list is the number of values gcc could not keep in `r0`-`r3` for as long as
it needed them**, and any one of them that arrived as an argument is set up by a
`mov` in the instructions immediately after the push.

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
