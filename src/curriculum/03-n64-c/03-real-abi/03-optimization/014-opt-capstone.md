---
id: 641dbc8f-a5c2-4ee1-ae8e-08b94c5e3ea5
slug: opt-capstone
title: "Capstone: Fingerprints, All at Once"
difficulty: 4
concepts:
  - optimizer
  - loops
  - unrolling
  - multiply
  - capstone
symbol: func_801076f0
hints:
  - "Split the listing at the `bne`. Above it, an unrolled loop you've read before; below it, a multiply — of what, by what?"
  - "The second argument is untouched until after the loop ends. That places it in your C too."
---

# One function, every tell

Time to read a function the way you'll read real game code: several optimizer
fingerprints layered in one listing, none of them announced. First, a small
worked example — `damp(x, k)`, which clamps `x` up to zero, then multiplies
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

Inventory the tells: a sign-test branch (`bgez` — "branch if greater than or
equal to zero") steering around a one-instruction clamp; a `nop` in its slot,
because IDO doesn't *always* pick a likely form — read what's there, don't
assume; then the multiply ritual with its fully-padded window. Three lessons'
worth of fingerprints in nine lines, and the C is two short statements.

That's the skill this chapter was building: you no longer decode instruction
by instruction. You spot *shapes* — there's a clamp, there's a multiply
window — and assemble the C at the statement level.

The target stacks bigger shapes: a loop you'll recognize on sight from
earlier in the chapter, feeding a multiply that closes the function. Name
each section, then write the few lines of C that generate all of it.

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
