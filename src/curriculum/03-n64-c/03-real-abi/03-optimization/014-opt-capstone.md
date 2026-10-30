---
id: 641dbc8f-a5c2-4ee1-ae8e-08b94c5e3ea5
slug: opt-capstone
title: "Capstone: All the Fingerprints Together"
difficulty: 4
concepts:
  - optimizer
  - loops
  - unrolling
  - multiply
  - capstone
symbol: func_801076f0
hints:
  - "Split the listing at the `bne`. Above it is an unrolled loop you have read before. Below it is a multiply. What is multiplied, and by what?"
  - "The second argument is not used until after the loop ends. That also tells you where it goes in your C."
---

# One function with every fingerprint

Now you will read a function the way you will read real game code: several
optimizer fingerprints in one listing, and nothing that points them out. First,
a small worked example. `damp(x, k)` clamps `x` up to zero, then multiplies it
by `k`:

```asm
 0:  bgez   a0, 0xc        # x already ≥ 0? skip the clamp
 4:  nop                   # …a PLAIN branch, slot unfilled
 8:  or     a0, zero, zero # x = 0
 c:  multu  a0, a1
10:  mflo   v0
14:  nop                   # the two-slot window, unfilled
18:  nop
1c:  jr     ra
20:  nop
```

List the fingerprints you can see:

- a sign-test branch (`bgez`, "branch if greater than or equal to zero") that
  jumps around a one-instruction clamp
- a `nop` in that branch's slot, because IDO does not *always* pick a likely
  form (read what is there instead of assuming)
- the multiply sequence, with both slots of its window padded

That is three lessons' worth of fingerprints in nine lines, and the C is two
short statements.

This is the skill the chapter has been building. You no longer decode one
instruction at a time. You spot *shapes* (here, a clamp and a multiply window)
and write the C one statement at a time.

The target combines bigger shapes: a loop from earlier in the chapter that you
will recognize straight away, feeding a multiply at the end of the function.
Name each section, then write the few lines of C that produce all of it.

## Your task

Write `func_801076f0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801076f0(s32 *p, s32 k) {
    s32 s = 0;
    s32 i;

    for (i = 0; i < 8; i++) {
        s += p[i];
    }
    return s * k;
}
```
