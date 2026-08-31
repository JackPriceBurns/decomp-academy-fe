---
id: 86d164ad-13ad-466b-84ad-752fbb7fb121
slug: types-byte-loop
title: "Bytes in a Loop"
difficulty: 3
concepts:
  - types
  - loops
  - pointers
  - delay-slots
symbol: func_801b4590
hints:
  - "A do/while — no guard branch — with the load at the top and the accumulate riding the back-edge's slot."
  - "Sum every byte, walk by one, count down. Four lines of body; the load's mnemonic types the pointer."
---

# The loop chapter, one byte at a time

Time to run the two chapters together. Byte buffers get processed in
loops constantly — checksums, string scans, palette tweaks — and the
result is loop skeletons you know wearing load mnemonics you now read.
Here's `count_zeros(p, n)`, which counts zero bytes in a buffer:

```c
s32 count_zeros(u8 *p, s32 n) {
    s32 c = 0;
    do {
        if (*p == 0) {
            c++;
        }
        p++;
        n--;
    } while (n > 0);
    return c;
}
```

```asm
 0:  or    v1, zero, zero  # c = 0
 4:  lbu   t6, 0(a0)       # ── loop top: current byte
 8:  addiu a1, a1, -1      # n--
 c:  bnez  t6, 0x18        # non-zero? skip the count
10:  nop
14:  addiu v1, v1, 1       # c++
18:  bgtz  a1, 0x4         # more bytes? around again
1c:  addiu a0, a0, 1       # (slot) p++
20:  or    v0, v1, zero
24:  jr    ra
28:  nop
```

Everything is a rerun, recombined: `do`/`while` so no guard, an `if`
inside the body (forward branch, flipped, honest `nop` in its slot), the
pointer increment riding the back-edge slot, stride 1 because bytes. The
only *new* information in the whole listing is `lbu` — one mnemonic
carrying the source declaration, exactly as it did in a two-line
function.

That's the general truth of this chapter: width idioms don't change
inside larger structures. A `lbu` in a forty-line function means what it
meant in a four-line one. When a big target overwhelms, find the loads
and stores first — they type your variables — then read the control
skeleton around them.

The target accumulates every byte of a buffer into a total, counting
down. No `if` this time — a tighter body than the worked example, same
bones.

## Your task

Write `func_801b4590` to reproduce the target assembly. Assume the count is
at least 1.

<!-- solution -->
```c
s32 func_801b4590(u8 *data, s32 n) {
    s32 t = 0;
    do {
        t += *data;
        data++;
        n--;
    } while (n > 0);
    return t;
}
```
