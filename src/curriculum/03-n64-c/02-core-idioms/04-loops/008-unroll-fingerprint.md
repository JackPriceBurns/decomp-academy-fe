---
id: f5c0db62-137a-44cd-94b2-2b30d1c0f611
slug: loops-unroll-fingerprint
title: "The ×4 Unroll (and Its Useless sll)"
difficulty: 3
concepts:
  - loops
  - unrolling
  - fingerprints
  - arrays
symbol: func_8017036c
hints:
  - "Same two-loop structure as the worked example; only the stored value changes — and the value being stored needs no register setup at all."
  - "Your C is a three-line counted `for` storing into `dst[i]`. All forty lines of structure come from the compiler."
---

# Three lines of C, forty of assembly

Here is the transformation that makes IDO loops famous. Give it a counted
`for` over an array and it doesn't compile your loop — it compiles *two*
loops: a small one to burn off `n mod 4` elements, then a main loop doing
**four elements per trip**. Here's `fill_words(dst, value, n)`, which
stores `value` into `dst[0..n-1]`:

```asm
 0:  blez  a2, 0x58        # guard: n <= 0? skip everything
 4:  or    v0, zero, zero  # (slot) i = 0
 8:  andi  t0, a2, 0x3     # t0 = n & 3 — the remainder
 c:  beqz  t0, 0x30        # divisible by 4? straight to the main loop
10:  or    a3, t0, zero    # (slot) remainder-loop trip count
14:  sll   t6, zero, 2     # t6 = 0 << 2 … which is 0. Yes, really.
18:  addu  v1, a0, t6      # v1 = dst + 0
1c:  addiu v0, v0, 1       # ── remainder loop: i++
20:  sw    a1, 0(v1)       # dst[i] = value
24:  bne   a3, v0, 0x1c    # done n&3 elements yet?
28:  addiu v1, v1, 4       # (slot) v1++
2c:  beq   v0, a2, 0x58    # remainder was all of n? exit
30:  sll   t7, v0, 2       # ── main-loop setup: i scaled to bytes
34:  sll   t8, a2, 2       # n scaled to bytes
38:  addu  a3, t8, a0      # a3 = dst + n*4 — the end pointer
3c:  addu  v1, a0, t7      # v1 = dst + i*4 — the cursor
40:  addiu v1, v1, 16      # ── main loop: bump cursor FIRST…
44:  sw    a1, -12(v1)     # …then store behind it: dst[i+1]
48:  sw    a1, -8(v1)      # dst[i+2]
4c:  sw    a1, -4(v1)      # dst[i+3]
50:  bne   v1, a3, 0x40    # cursor reached the end pointer?
54:  sw    a1, -16(v1)     # (slot) dst[i+0] — the fourth store
58:  jr    ra
5c:  nop
```

The skeleton to memorize — you will see it dozens of times:

1. **Guard** on `n`, as ever.
2. **`andi …, n, 0x3`** — the remainder count. This instruction is the
   unroll's opening move; when you spot it right after a loop guard, you
   already know everything that follows.
3. **Remainder loop** — the plain one-per-trip loop, run `n & 3` times.
4. **Main loop** — the body ×4, bumping the cursor by 16 and storing at
   negative offsets, ending when the cursor hits a precomputed **end
   pointer** (`bne v1, a3` — no `slt` needed).

And line `14`: `sll t6, zero, 2` — shift *the zero register* left by two.
That is a real instruction IDO emits, computing `0 << 2 = 0` into `t6`. It's
the address-scaling of `i` at loop entry, where `i` is known to be 0 —
generated anyway, never cleaned up. It does nothing, it matches nothing in
your C, and it is **the** tell-tale that you're looking at an IDO unrolled
loop. Don't fight it; greet it.

Decompiling this means *collapsing* it: find the one operation both loops
share (here, a `sw` of the same register), and write the single naive
`for` that does it once per element. Loop count, remainder handling,
end pointers — all of it regenerates from three lines of C.

The target is this exact transformation applied to a fill with a value you
won't need a register for.

## Your task

Write `func_8017036c` to reproduce the target assembly.

<!-- solution -->
```c
void func_8017036c(s32 *dst, s32 n) {
    s32 i;
    for (i = 0; i < n; i++) {
        dst[i] = 0;
    }
}
```
