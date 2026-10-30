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
  - "The `addiu at, zero, N` above the branch is the constant being compared. `beq` against it jumps when the values are equal, so the C tests the opposite."
  - "One exit returns an argument, the other a constant already loaded in a delay slot. Follow the address to pair them up."
---

# The constant goes through at

`beq` and `bne` compare two *registers*. There is no instruction that branches
if a register equals 7. So when C compares with a constant, the compiler must
first put that constant in a register. Its usual choice is one you have already
met: `at`, the assembler temporary. Here is `if (f == 3) return a; return b;`:

```asm
 0:  addiu at, zero, 3    # the 3, loaded into at
 4:  bne   a0, at, 0x14   # f != 3? skip
 8:  or    v0, a2, zero   # (delay slot) b, preloaded for the skip path
 c:  jr    ra
10:  or    v0, a1, zero   # f was 3: return a
14:  jr    ra             # otherwise the preloaded b
18:  nop
```

The pattern to remember: **an `addiu` from `zero` directly above a `beq`/`bne`
means "compared against this constant"**. The `at` register is only a helper.
It does not appear in the C, which just says `f == 3`.

Two more notes:

- **Zero is the exception.** Comparing against 0 does not need the constant in
  a register, because that is exactly what `beqz`/`bnez` are for. If you see
  `at`, the constant *isn't* zero.
- This is the same split you saw with `div`: an immediate that can't fit inside
  the instruction is loaded into `at` first. Branches have *no* immediate form
  at all, so even a small constant like 3 goes through `at`.

The target compares its first argument with a different constant and chooses
between an argument and a fixed value. Read the constant loaded into `at`,
flip the branch, and pair up the exits.

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
