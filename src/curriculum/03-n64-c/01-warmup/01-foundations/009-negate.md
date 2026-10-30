---
id: 6559024b-e7b0-440d-8e4f-7dffab3006b6
slug: foundations-negate
title: Negation and the Zero Register
difficulty: 1
concepts:
  - arithmetic
  - registers
  - pseudo-ops
symbol: negate
hints:
  - "`negu` is really `subu` from `zero`. The disassembler prints the nicer
    name. It computes rd = -rt."
  - "Apply rd = -rt to the target's registers, and that gives you the one-line C."
---

# Subtracting from zero

MIPS has no negate instruction. When C flips a sign, the compiler subtracts from
the zero register: `0 − x` is `−x`, and `zero` supplies the 0 for free. The
disassembly prints the friendlier alias `negu rd, rt`, but the real instruction
is `subu rd, zero, rt`, with the always-zero register doing real arithmetic. You
will see that register everywhere. It loaded your constants in `addiu` and
copied registers in `or`, and here it negates. (The `u` again means "don't
trap", and it does not mean "unsigned". Plain `-x` on an `s32` produces
`negu`.)

In this example it negates a value that was just computed: a shift, as in the
multiply lesson, followed by the sign flip:

```asm
sll  v0, a0, 2     # v0 = n * 4
negu v0, v0        # v0 = -(n * 4)
jr   ra
nop
```

Read `negu rd, rt` as `rd = -rt`, and you can decode a chain like this one
instruction at a time.

The target below is simpler than the example. It has one `negu`, applied
directly to an argument register. Say in words what it computes, and write
exactly that.

## Your task

Write `negate`, taking an `s32 x`, to match the target assembly.

<!-- starter -->
```c
s32 negate(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 negate(s32 x) {
    return -x;
}
```
