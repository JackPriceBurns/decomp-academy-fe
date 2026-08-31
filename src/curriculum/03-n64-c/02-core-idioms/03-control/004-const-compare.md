---
id: f087d521-0fa9-40e1-8518-763a1a273873
slug: control-const-compare
title: Comparing Against a Constant
difficulty: 2
concepts:
  - control-flow
  - branches
  - immediates
  - fingerprints
symbol: func_80021f54
hints:
  - "The `addiu at, zero, N` above the branch is the constant being compared. `beq` against it fires on equality — so the C tests the opposite."
  - "One exit returns an argument, the other a constant already sitting in a delay slot. Follow the address to pair them up."
---

# The constant goes through at

`beq` and `bne` compare two *registers* — there is no branch-if-equal-to-7
instruction. So when C compares against a constant, the compiler must first
put that constant somewhere, and its favorite parking spot is one you've met:
`at`, the assembler temporary. Here's `if (f == 3) return a; return b;`:

```asm
 0:  addiu at, zero, 3    # the 3, materialized into at
 4:  bne   a0, at, 0x14   # f != 3? skip
 8:  or    v0, a2, zero   # (delay slot) b, preloaded for the skip path
 c:  jr    ra
10:  or    v0, a1, zero   # f was 3: return a
14:  jr    ra             # otherwise the preloaded b
18:  nop
```

The shape to burn in: **`addiu`-from-`zero` directly above a `beq`/`bne`
means "compared against this constant"**. The `at` register is pure
scaffolding — it appears nowhere in the C, which just says `f == 3`.

Two notes to complete the picture:

- **Zero is the exception.** Comparing against 0 needs no materialization —
  that's exactly what `beqz`/`bnez` are for. Seeing `at` tells you the
  constant *isn't* zero.
- This is the same division of labor you saw with `div`: immediates that
  can't ride inside the instruction get staged through `at` first. Branches
  simply have *no* immediate form at all, so even a tiny constant like 3
  takes the detour.

The target compares its first argument against a different constant and
picks between an argument and a fixed value. Read `at`'s constant, flip the
branch, pair the exits.

## Your task

Write `func_80021f54` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80021f54(s32 m, s32 x) {
    if (m != 4) {
        return 0;
    }
    return x;
}
```
