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
  - "`negu` is really `subu` from `zero` — the disassembler just prints the
    nicer name. It computes rd = -rt."
  - "Apply rd = -rt to the target's registers and the one-line C falls right out."
---

# Subtracting from nothing

MIPS has no negate instruction. When C flips a sign, the compiler subtracts from
the zero register: `0 − x` is `−x`, and `zero` supplies the 0 for free. The
disassembly prints the friendly alias `negu rd, rt` — but underneath it's
`subu rd, zero, rt`, the always-zero register doing real arithmetic. That
register really is everywhere: it loaded your constants in `addiu`, copied
registers in `or`, and now it negates. (And the `u` is our old friend "don't
trap", not "unsigned": plain `-x` on an `s32` produces `negu`.)

Here it is negating a value that was just computed — last lesson's shift trick
followed by the flip:

```asm
sll  v0, a0, 2     # v0 = n * 4
negu v0, v0        # v0 = -(n * 4)
jr   ra
nop
```

Read `negu rd, rt` as `rd = -rt` and chains like that decode themselves.

The target below is simpler than the example — one `negu`, straight off an
argument register. Say out loud what it computes, and write exactly that.

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
