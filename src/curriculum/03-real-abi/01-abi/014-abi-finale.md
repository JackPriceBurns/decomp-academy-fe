---
id: abi-finale
title: "Chaining: The Whole ABI in One Function"
difficulty: 5
concepts:
  - saved-registers
  - declaration-order
  - calls
  - arguments
  - arithmetic
  - chaining
symbol: capstone
hints:
  - Two parameters are used *after* the call, so both `r31` and `r30` are filled
    before the `bl`; the remaining parameter is marshalled into the call.
  - After the call, the result is combined with both survivors — a `mullw`
    pairing one survivor with the result, then an `add` folding in the other.
---

# Everything at once

This is the chapter finale: a single function that exercises every ABI rule you
have learned. It allocates a frame, preserves the link register, keeps **two**
parameters alive across a call in `r31`/`r30`, marshals another parameter into
the callee's argument register, and then does arithmetic that combines both
survivors with the returned result.

Consider `mash(p, q, r)`, which calls `blendfn(p, r)` and then computes
`q - blendfn(...) * p`:

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
stw    r31,12(r1)
mr     r31,r4       # q survives the call -> r31
mr     r4,r5        # marshal r into the 2nd arg slot
stw    r30,8(r1)
mr     r30,r3       # p survives too -> r30 (and p is also the 1st arg, in r3)
bl     blendfn      # blendfn(p, r)
mullw  r0,r3,r30    # result * p
subf   r3,r0,r31    # q - (result * p)
lwz    r0,20(r1)
lwz    r31,12(r1)
lwz    r30,8(r1)
mtlr   r0
addi   r1,r1,16
blr
```

Every layer is visible at once: the prologue/epilogue boilerplate, two
saved-register slots, the survival moves (`q`→`r31`, `p`→`r30`), the single
argument marshal (`r`→`r4`, while `p` is already in `r3` for the first arg), the
`bl`, and finally the two-instruction arithmetic that weaves the call's result
together with both preserved values. Note `p` does double duty — it is both the
first argument to the call *and* a survivor needed afterward, so it sits in `r3`
for the call and in `r30` for the arithmetic.

The target assembly for `capstone` has the identical shape, but the
parameter-to-role mapping differs: a *different* parameter is the survivor used
in the multiply, a different one is added at the end, and the marshalling into the
call is arranged differently — note which parameter has to be *moved* into `r3`
for the call rather than already being there. Trace each register from its
argument origin, through its saved-register home, to its final use, and
reconstruct the expression.

## Your task

Write `capstone`, which calls `work` and combines the result with two surviving
parameters, to reproduce the target assembly. `work` is declared for you.

<!-- starter -->
```c
int capstone(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int capstone(int a, int b, int c) {
    int r = work(b, c);
    return r * a + b;
}
```

<!-- context -->
```c
extern int work(int p, int q);
```
