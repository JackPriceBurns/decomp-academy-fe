---
id: 6f51e306-bebd-4943-8be3-2829a0fd1002
slug: gba-bitwise-pack-two
title: Packing Two Values
difficulty: 3
concepts:
  - bitwise
  - shifts
  - constants
symbol: func_08108868
hints:
  - One constant is built and then used by two different `and` instructions.
    So both fields are trimmed to the same width before they are combined.
  - The function takes two `u32` arguments and returns a `u32`. Both are masked
    to a byte, and one of them is shifted up before the two are or-ed together.
---

# Shift into place, then or

Packing is the inverse of extraction, and you can read it in the same fixed
way. Each field is shifted up to its bit position, and the shifted pieces are
or-ed together. The field at bit 0 needs no shift at all.

```asm
0        mov       r2, r0
2        lsl       r0, r1, #12
4        orr       r0, r2
6        bx        lr
```

The second argument is shifted up by 12, and the first stays where it is. That
puts a tile number in the low bits with a palette index above it, which is
close to what a real background map entry looks like. The `mov r2, r0` at the
top moves the unchanged field out of the destination register, so that the
shift result can be written there.

A field that might have junk bits above its width is masked first:

```asm
0        lsl       r0, #5
2        mov       r2, #31
4        and       r2, r1
6        orr       r0, r2
8        bx        lr
```

Only the second field is masked here. The compiler never adds masks on its own,
because it has no idea what range a value has. So a mask in the listing is a
mask in the source. When there is no mask, the author knew the value would fit.
This difference between the fields is one of the more useful things a packing
listing tells you.

When two fields are trimmed to the same width, the constant is built once and
used twice. A single `mov` feeding two separate `and` instructions means the
register allocator noticed that the same number is needed in two places.

## Your task

Write `func_08108868` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_08108868(u32 x, u32 y) {
    return ((x & 0xFF) << 8) | (y & 0xFF);
}
```
