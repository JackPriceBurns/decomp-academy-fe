---
id: 1c63d736-a3c0-58df-ab87-9ec7b12d93fa
slug: advanced-psq-asm-exception
title: "Where Inline asm{} Earns Its Place: psq_l / psq_st"
difficulty: 4
concepts:
  - paired-singles
  - asm
  - intrinsics
  - psq_l
  - objdump
symbol: func_80318f5c
hints:
  - Paired-singles have no MWCC intrinsic, so a small `asm{}` block is the
    practical way to emit psq_l/psq_st.
  - The operand form is `psq_l f0, 0(src), 0, 0`; keep both pointers
    `register`-qualified so they sit in GPRs.
---

# Why paired-singles need a hand-written asm block

Most of the time, inline `asm{}` is a smell in a decomp. It proves nothing about
the source you're trying to recover. Paired-singles are the one place it belongs.

The reason is that MWCC has no intrinsic for the paired-single loads and stores,
or for the `ps_*` math. You saw a hint of this in the prologue lesson, where a
callee-save `psq_st` just appeared on its own, its register and offset fixed by
the compiler. That one you got for free. You can't ask for it, and no C you can
write will aim a `psq_l` at a pointer you chose. When the original code packed
two floats and carried them together, hand-written assembly is the only faithful
way back.

Both pointer arguments need the `register` qualifier or the build fails. The
assembler wants them already living in a GPR.

```asm
psq_l  f0, 0(r4), 0, 0   # load two packed 32-bit floats from src into f0
psq_st f0, 0(r3), 0, 0   # store both halves to dst
blr
```

The operand form is `psq_l fD, offset(rA), W, I`. `W` says whether you move one
value or two. `I` selects a graphics-quantization mode, where `0` means no
scaling, plain `f32`. One last gotcha: stock objdump thinks paired-singles are
PowerPC VSX and decodes them into nonsense, so a GameCube toolchain patches
objdump and passes **`-M gekko`** — the service here does this for you. Without
it, `psq_l` looks like VSX garbage and you'll think a good match is broken.

## Your task

Write `func_80318f5c(register f32 *dst, register const f32 *src)` that uses an
`asm{}` block to `psq_l` a packed pair from `src` into `f0` and `psq_st` it to
`dst`. This is the *only* lesson where `asm{}` is the right answer — keep both
pointer parameters `register`-qualified or the assembler rejects the operands.

<!-- solution -->
```c
void func_80318f5c(register f32 *dst, register const f32 *src) {
    asm {
        psq_l   f0, 0(src), 0, 0
        psq_st  f0, 0(dst), 0, 0
    }
}
```
