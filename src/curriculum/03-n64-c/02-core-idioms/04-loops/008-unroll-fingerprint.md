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
  - "This has the same two-loop structure as the worked example. Only the stored value changes, and the value being stored needs no register setup at all."
  - "Your C is a three-line counted `for` storing into `dst[i]`. All forty lines of structure come from the compiler."
---

# Three lines of C, forty of assembly

This is the transformation that IDO loops are best known for. When you give
IDO a counted `for` over an array, it compiles *two* loops instead of one. A
small loop handles the first `n mod 4` elements. Then a main loop handles
**four elements per trip**. Here is `fill_words(dst, value, n)`, which stores
`value` into `dst[0..n-1]`:

```asm
 0:  blez  a2, 0x58        # guard: n <= 0? skip everything
 4:  or    v0, zero, zero  # (slot) i = 0
 8:  andi  t0, a2, 0x3     # t0 = n & 3, the remainder
 c:  beqz  t0, 0x30        # divisible by 4? straight to the main loop
10:  or    a3, t0, zero    # (slot) remainder-loop trip count
14:  sll   t6, zero, 2     # t6 = 0 << 2, which is 0
18:  addu  v1, a0, t6      # v1 = dst + 0
1c:  addiu v0, v0, 1       # ── remainder loop: i++
20:  sw    a1, 0(v1)       # dst[i] = value
24:  bne   a3, v0, 0x1c    # done n&3 elements yet?
28:  addiu v1, v1, 4       # (slot) v1++
2c:  beq   v0, a2, 0x58    # remainder was all of n? exit
30:  sll   t7, v0, 2       # ── main-loop setup: i scaled to bytes
34:  sll   t8, a2, 2       # n scaled to bytes
38:  addu  a3, t8, a0      # a3 = dst + n*4, the end pointer
3c:  addu  v1, a0, t7      # v1 = dst + i*4, the cursor
40:  addiu v1, v1, 16      # ── main loop: bump cursor FIRST…
44:  sw    a1, -12(v1)     # …then store behind it: dst[i+1]
48:  sw    a1, -8(v1)      # dst[i+2]
4c:  sw    a1, -4(v1)      # dst[i+3]
50:  bne   v1, a3, 0x40    # cursor reached the end pointer?
54:  sw    a1, -16(v1)     # (slot) dst[i+0], the fourth store
58:  jr    ra
5c:  nop
```

Learn this structure well, because you will see it dozens of times:

1. **Guard** on `n`, as usual.
2. **`andi …, n, 0x3`** computes the remainder count. This instruction starts
   the unroll. When you see it right after a loop guard, you already know
   everything that follows.
3. **Remainder loop.** This is the plain loop that handles one element per
   trip. It runs `n & 3` times.
4. **Main loop.** This is the body ×4. It moves the cursor forward by 16,
   stores at negative offsets, and ends when the cursor reaches an **end
   pointer** computed in advance (`bne v1, a3`, so no `slt` is needed).

Now look at line `14`: `sll t6, zero, 2`. It shifts *the zero register* left
by two. IDO really emits this instruction, and it computes `0 << 2 = 0` into
`t6`. It is the address scaling of `i` at the loop entry, where `i` is known
to be 0. The compiler generates it anyway and never removes it. The
instruction does nothing, and nothing in your C matches it. It is also
**the** clearest sign that you are looking at an IDO unrolled loop. Don't try
to make it go away. Expect to see it.

To decompile this, you *collapse* it. Find the one operation that both loops
share (here, a `sw` of the same register). Then write the single simple
`for` that does it once per element. The compiler rebuilds the loop count,
the remainder handling and the end pointer from those three lines of C.

The target is this same transformation, applied to a fill with a value that
needs no register.

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
