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
  - "There are two temporaries per trip. One is the tested low bit, and the other is the shifted remainder. The accumulator collects the first. The delay slot copies the second back into the loop variable."
  - "The shift amount is 1 and the mask is 1. This is the classic loop body that counts the set bits, written as a plain `while (mask != 0)`."
---

# beqz and bnez in a loop

Not every `while` compares sizes. A loop that works through the bits of a
word runs *while any bits are left*, which is `while (x != 0)`. It compiles
to the branches that test against zero: `beqz`, flipped, as the guard, and
`bnez`, as written, as the back-edge. Here is `fold_down`, which XORs a word
into a total and shifts the word down four bits on each trip:

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

The interesting part is lines `c` to `14`. The C does `x = x >> 4` and
*then* tests `x`. The assembly shifts into a scratch register `t6`, tests
**`t6`**, and only copies it back to `a0` in the delay slot. The values are
the same, and the schedule is better, because the test doesn't have to wait
for the copy. When a back-edge tests a `t`-register and the slot copies that
same register into the loop variable, read it as the plain C sequence
"update, then test". The compiler has only overlapped the two steps.

Also notice which delay slot holds the copy this time. The *plain* `bnez`
can carry it safely, because on the final trip "copy the remainder into `x`"
is still correct: `x` ends as 0, which is what the C says. Compare that with
the accumulate that needed cloning two lessons ago. What decides between a
plain and a likely back-edge is whether the instruction in the slot is
harmless on the last trip.

The target works through a word one bit at a time. It takes each low bit
with a mask and adds it to a total. It has the same guard and the same
back-edge shape, with one more instruction in the body.

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
