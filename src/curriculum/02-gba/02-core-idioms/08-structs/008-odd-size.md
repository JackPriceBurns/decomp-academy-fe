---
id: 173328d4-6126-411c-a4a0-eef7777a3af6
slug: gba-structs-odd-size
title: A Size That Is Not a Power of Two
difficulty: 4
concepts:
  - structs
  - arrays
  - strength-reduction
hints:
  - Run the ladder as arithmetic on the index. Whatever multiple of `i` sits in
    the register after the last shift is the element size — check it against
    `sizeof` the struct in the context block.
  - A `struct Rec20 *` and an `s32` in, a `u32` out. Two fields of the same
    element, and you never write the multiply yourself.
symbol: func_0825bed8
---

# Reading a size out of a shift ladder

When the element size is not a power of two, the compiler still refuses to reach
for a multiply if it can avoid one. It splits the size into an odd factor and a
power of two, builds the odd factor from the index with one shift plus one add
or subtract, and then applies the power of two as a final shift.

Here is an array of 28-byte records being indexed:

```asm
0        lsl       r2, r1, #3
2        sub       r2, r1
4        lsl       r2, #2
6        add       r2, r0
8        ldr       r0, [r2, #24]
10       ldr       r1, [r2, #0]
12       sub       r0, r1
14       bx        lr
```

Follow the register. After `lsl r2, r1, #3` it holds 8i. The `sub r2, r1` makes
it 7i — note the subtract, which is how the compiler reaches 7 as 8 minus 1
rather than 4 plus 2 plus 1. Then `lsl r2, #2` gives 28i, and the `add` makes it
an address. The two loads at 24 and 0 are the last and first words of the
element.

The ladder gives out when the odd factor needs more than one add or subtract.
At 44 bytes the compiler gives up and materialises the size:

```asm
0        mov       r2, #44
2        mul       r1, r2
4        add       r1, r0
6        ldr       r0, [r1, #40]
8        bx        lr
```

`mul r1, r2` is Thumb's two-operand multiply, with the *constant* in the second
register. So one word added to a struct definition can flip its indexing code
between a three-instruction ladder and a two-instruction multiply. Neither
version is something you write by hand — both come from a plain `p[i].field`,
and hand-writing `i * 44` in the C will get you a different function.

Your target has a ladder too, with a different pair of shifts. Multiply it out
and check the answer against the struct you were given.

## Your task

Write `func_0825bed8` to reproduce the target assembly.

<!-- context -->
```c
struct Rec20 {
    u32 id;
    u32 a;
    u32 b;
    u32 c;
    u32 total;
};
```

<!-- solution -->
```c
u32 func_0825bed8(struct Rec20 *r, s32 i) {
    return r[i].total + r[i].id;
}
```
