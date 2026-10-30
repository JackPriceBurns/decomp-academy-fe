---
id: 674ebc1d-b619-468c-9a34-7c5770b20859
slug: control-and-chain
title: "&&: A Ladder of Early Exits"
difficulty: 4
concepts:
  - control-flow
  - branches
  - short-circuit
  - delay-slots
symbol: func_801d3af0
hints:
  - "Two branches to the SAME failure label = two &&-ed conditions, each flipped. The first slot computes the second test early."
  - "The second condition is an ordered compare between the two arguments.
    Read the `slt` literally, then remember the && only passes when the
    branch does NOT jump."
---

# Both conditions, one failure exit

C's `&&` does not evaluate its right side unless the left side passed, and
compiled MIPS shows that order. Each condition becomes a branch, each branch
is inverted, and *all of them jump to the same failure label*. Here is
`if (a > 0 && b > 0) return 1; return 0;`:

```asm
 0:  blez a0, 0x18        # first test fails? exit early
 4:  or   v0, zero, zero  # (delay slot) the failure 0, preloaded
 8:  blez a1, 0x18        # second test, only reached if the first passed
 c:  nop
10:  jr   ra
14:  addiu v0, zero, 1    # both passed
18:  jr   ra              # the shared failure exit
1c:  nop
```

The pattern to look for is in the branch *targets*: two conditional branches,
**both aimed at `0x18`**. Several branches that go to one label is what `&&`
looks like in the assembly. It is a ladder where any step that fails sends you
to the same place. Decode each branch, flip each condition (the branches jump
on *failure*), and join them with `&&` in source order, top step first.

Note also what the first slot did: it preloaded the failure value once, and
*both* early-exit branches rely on it. One slot serves two branches.

In the target, the second condition is an ordered compare of two registers,
so it is not a sign test. An `slt` computes it as a boolean, and the branch
tests that boolean (the pattern from the `sltu` lesson, signed this time). The
compare has also been moved up into the *first branch's delay slot*. It is
computed before the code knows whether it is needed, and it does no harm if it
is not. By now this is a familiar IDO pattern. The success path and the
failure path each return an argument. The kinds of branch tell you the rest.

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
