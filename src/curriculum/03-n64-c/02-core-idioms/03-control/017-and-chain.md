---
id: 674ebc1d-b619-468c-9a34-7c5770b20859
slug: control-and-chain
title: "&&: A Ladder of Bailouts"
difficulty: 4
concepts:
  - control-flow
  - branches
  - short-circuit
  - delay-slots
symbol: func_801d3af0
hints:
  - "Two branches to the SAME failure label = two &&-ed conditions, each flipped. The first slot computes the second test early."
  - "The second condition is an ordered compare between the two arguments —
    read the `slt` literally, then remember the && only passes when the
    branch does NOT fire."
---

# Both conditions, one failure exit

C's `&&` doesn't evaluate its right side unless the left side passed — and
compiled MIPS makes that ordering visible. Each condition becomes a branch,
each branch inverted, and *all of them jump to the same failure label*.
Here's `if (a > 0 && b > 0) return 1; return 0;`:

```asm
 0:  blez a0, 0x18        # first test fails? bail
 4:  or   v0, zero, zero  # (delay slot) the failure 0, preloaded
 8:  blez a1, 0x18        # second test — only reached if the first passed
 c:  nop
10:  jr   ra
14:  addiu v0, zero, 1    # both passed
18:  jr   ra              # the shared failure exit
1c:  nop
```

The signature is in the branch *targets*: two conditional branches, **both
aimed at `0x18`**. Multiple branches converging on one label is how `&&`
looks from the outside — a ladder where any rung drops you to the same
place. Decode each branch, flip each condition (the branches fire on
*failure*), and join them with `&&` in source order, top rung first.

Note also what the first slot did: it preloaded the failure value once, and
*both* bailout branches rely on it. One slot, two customers.

In the target, the second condition isn't a sign test — it's an ordered
compare between the two arguments, so an `slt` materializes it and the
branch tests the boolean (the `sltu` lesson's pattern, signed this time).
And the compare has been hoisted into the *first branch's delay slot* —
computed before you know whether it's needed, harmless if not. By now
that's a familiar IDO move. The success path returns one argument, the
failure path the other; the branch flavors tell you the rest.

## Your task

Write `func_801d3af0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801d3af0(s32 a, s32 b) {
    if (a != 0 && b > a) {
        return b;
    }
    return a;
}
```
