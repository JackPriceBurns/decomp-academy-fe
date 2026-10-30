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
  - Only one of the two elements can use the offset field. Think about which
    direction the field cannot reach.
  - It takes a `u16 *` and an `s32` index, and returns a sum. The two elements
    are one on each side of the element the index names.
---

# Two bytes per element

A 16-bit array scales its index by two, loads with `ldrh`, and encodes its
constant offsets in units of two. All three come from the element size, and you
can see all three in the listing:

```asm
0        lsl       r1, #1
2        add       r1, r0
4        ldrh      r0, [r1, #0]
6        neg       r0, r0
8        bx        lr
```

`lsl #1` doubles the index, and `ldrh` loads sixteen bits. The `neg` afterwards
works on the loaded value, not on the address. With constant indices, the shift
and the add both disappear into the offset field:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #20]
4        ldrh      r1, [r1, #2]
6        sub       r0, r1
8        bx        lr
```

Halve each offset to get the index back: 20 is element 10, and 2 is element 1.
The field is five bits scaled by two, so a halfword load reaches 0 to 62. This
means the limit is at element 31 rather than element 63.

There is one more property to know. **The offset field is unsigned.** It can
only reach forwards from the base. After the compiler adds a variable index to
the base register, an element *after* that position fits in the offset field at
no extra cost. An element *before* it cannot be encoded at all, so it needs its
own instruction to move the base backwards. Two accesses that look equally
cheap in C come out differently in the listing, and that difference tells you
the sign of the index arithmetic.

Your target's two accesses cannot both be reached from the same base register.

## Your task

Write `func_08210024` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08210024(u16 *p, s32 i) {
    return p[i - 1] + p[i + 1];
}
```
