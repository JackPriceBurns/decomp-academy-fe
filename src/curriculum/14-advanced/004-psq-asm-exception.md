---
id: advanced-psq-asm-exception
title: "Where Inline asm{} Earns Its Place: psq_l / psq_st"
difficulty: 4
concepts:
  - paired-singles
  - asm
  - intrinsics
  - psq_l
  - objdump
symbol: load_pair
hints:
  - Paired-singles have no MWCC intrinsic, so a small `asm{}` block is the
    practical way to emit psq_l/psq_st.
  - The operand form is `psq_l f0, 0(src), 0, 0`; keep both pointers
    `register`-qualified so they sit in GPRs.
---

# When inline asm is the right tool

In decompilation the aim is clean C that byte-matches the target, so inline
`asm{}` is something you generally steer clear of — pasted assembly proves
nothing about the original source. There is one situation where it's genuinely
justified: the **paired-single load/store** instructions `psq_l` and `psq_st`
(and the `ps_*` arithmetic family). The reason is simple: **MWCC GC/2.0
has no intrinsic for them.** The exception you saw in the prologue lesson is
narrow: a callee-save `psq_st` falls out *automatically* with a fixed
register-and-offset pattern, but you cannot deliberately direct a `psq_l` (or
the `ps_*` arithmetic family) at an arbitrary pointer from C at all. So when the
original code deliberately packed two floats and loaded or moved them as a unit,
the only faithful recovery is a tiny `asm{}` block.

It compiles cleanly here as long as the pointer operands are
`register`-qualified (the assembler needs them already in a GPR):

```asm
psq_l  f0, 0(r4), 0, 0   # load two packed 32-bit floats from src into f0
psq_st f0, 0(r3), 0, 0   # store both halves to dst
blr
```

Read the operand form `psq_l fD, offset(rA), W, I`: `W` selects 1-vs-2 values,
`I` picks a graphics-quantization mode (`0` = no scaling, plain `f32`). One last
trap: **stock objdump mis-decodes paired-singles as PowerPC VSX**. A GameCube
decomp toolchain uses a patched objdump and disassembles with **`-M gekko`** (the
compiler service here already does) — without it, `psq_l` shows up as garbage VSX
mnemonics and you'll think the match is broken when it isn't.

## Your task

Write `load_pair(register f32 *dst, register const f32 *src)` that uses an
`asm{}` block to `psq_l` a packed pair from `src` into `f0` and `psq_st` it to
`dst`. This is the *only* lesson where `asm{}` is the right answer — keep both
pointer parameters `register`-qualified or the assembler rejects the operands.

<!-- starter -->
```c
void load_pair(register f32 *dst, register const f32 *src) {
    // asm { ... } using psq_l / psq_st
}
```

<!-- solution -->
```c
void load_pair(register f32 *dst, register const f32 *src) {
    asm {
        psq_l   f0, 0(src), 0, 0
        psq_st  f0, 0(dst), 0, 0
    }
}
```
