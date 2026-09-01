---
id: 2fe0d9ca-0580-4919-8da8-e13bbc04a6c2
slug: gba-memory-halfword-array
title: Halfword Arrays
difficulty: 3
concepts:
  - pointers
  - arrays
  - addressing
symbol: func_08210024
hints:
  - Only one of the two elements can ride the offset field. Ask yourself which
    direction the field cannot go.
  - A `u16 *` and an `s32` index in, a sum out. The two elements sit one on
    each side of the one the index names.
---

# Two bytes per element

A 16-bit array scales its index by two, loads with `ldrh`, and encodes its
constant offsets in units of two. All three follow from the element size, and
all three are visible:

```asm
0        lsl       r1, #1
2        add       r1, r0
4        ldrh      r0, [r1, #0]
6        neg       r0, r0
8        bx        lr
```

`lsl #1` doubles the index, `ldrh` moves sixteen bits, and the `neg` afterwards
works on the loaded value rather than on the address. With constant indices the
shift and the add both vanish into the offset field:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #20]
4        ldrh      r1, [r1, #2]
6        sub       r0, r1
8        bx        lr
```

Halve each offset to recover the index — 20 is element 10, 2 is element 1. And
since the field is five bits scaled by two, a halfword load reaches 0 to 62,
so the ceiling arrives at element 31 rather than element 63.

Now the part that catches people out. **The offset field is unsigned.** It can
only reach forwards from the base. Once the compiler has folded a variable
index into a register, an element *after* that position rides along in the
offset field for free, but an element *before* it has no encoding at all and
needs its own instruction to move the base backwards. Two accesses that look
equally cheap in C come out asymmetric in the listing, and the asymmetry is the
sign of the index arithmetic.

Your target's two accesses are not both reachable from the same base register.

## Your task

Write `func_08210024` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08210024(u16 *p, s32 i) {
    return p[i - 1] + p[i + 1];
}
```
