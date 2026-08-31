---
id: eb6ff15d-c639-4b98-829d-25eae890e991
slug: loops-while-nonzero
title: "Looping While Bits Remain"
difficulty: 3
concepts:
  - loops
  - while
  - shifts
  - delay-slots
symbol: func_802dbfc4
hints:
  - "Two temporaries per trip — one is the tested low bit, one is the shifted remainder. The accumulator collects the first; the slot commits the second back into the loop variable."
  - "The shift amount is 1 and the mask is 1 — this is the classic count-the-set-bits body, written as a plain `while (mask != 0)`."
---

# beqz / bnez, loop edition

Not every `while` compares magnitudes. Grinding through the bits of a word
runs *while anything is left* — `while (x != 0)` — and compiles to the
zero-test branches: `beqz` flipped as the guard, `bnez` straight as the
back-edge. Here's `fold_down`, which XOR-folds a word four bits at a time:

```c
u32 fold_down(u32 x) {
    u32 t = 0;
    while (x != 0) {
        t = t ^ x;
        x = x >> 4;
    }
    return t;
}
```

```asm
 0:  beqz  a0, 0x18       # guard: nothing set? skip
 4:  or    v1, zero, zero # (slot) t = 0
 8:  xor   v1, v1, a0     # ── loop top: t ^= x
 c:  srl   t6, a0, 4      # the shifted-down remainder…
10:  bnez  t6, 0x8        # …still non-zero? again
14:  or    a0, t6, zero   # (delay slot) x = remainder
18:  or    v0, v1, zero
1c:  jr    ra
20:  nop
```

The interesting move is at `c`–`14`: the C says `x = x >> 4` *then* test
`x` — the assembly shifts into a scratch `t6`, tests **`t6`**, and only
commits it back to `a0` in the slot. Same values, better schedule: the test
doesn't have to wait for the copy. When a back-edge tests a `t`-register
and the slot copies that same register into the loop variable, read it as
the plain C sequence "update, test" — the compiler just overlapped them.

Note also which slot got the copy this time: the *plain* `bnez` carries it
safely, because on the final trip "commit the remainder into `x`" is still
correct — `x` ends as 0, exactly what the C says. Compare that with the
accumulate that needed cloning two lessons ago. Whether the slot's op is
harmless on the last trip is precisely what decides plain versus likely.

The target walks a word one bit at a time, pulling each low bit off with a
mask and adding it up — same guard, same back-edge shape, one more
instruction in the body.

## Your task

Write `func_802dbfc4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802dbfc4(u32 mask) {
    s32 n = 0;
    while (mask != 0) {
        n += mask & 1;
        mask >>= 1;
    }
    return n;
}
```
