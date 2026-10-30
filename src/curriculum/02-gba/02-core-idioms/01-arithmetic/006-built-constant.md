---
id: 5d234950-81f9-4fc8-8b5b-b7dc3e61bb4e
slug: gba-arithmetic-built-constant
title: Constants Built From Two Instructions
difficulty: 3
concepts:
  - immediates
  - constants
  - shifts
symbol: func_0804a874
hints:
  - Read the `mov` and the `lsl` together as one number. Shift the moved value
    left by the shift amount, and the result is the constant the source wrote.
  - The function takes two `s32` parameters and returns an `s32`. The
    subtraction is the second parameter minus the first, and the built constant
    is added to that difference.
---

# Reading a constant from a mov and a shift

Once a constant is above 255, no immediate field can hold it. So agbcc builds
the value in a spare register before using it. The first method it tries is a
small number multiplied by a power of two.

Here is `y + 2000`:

```asm
0        mov       r2, #250
2        lsl       r2, #3
4        add       r0, r1, r2
6        bx        lr
```

250 shifted left by 3 is 2000. To recover the constant, do that arithmetic
yourself: **take the moved value and multiply it by 2 to the power of the
shift.**

You can predict which pair gcc picks. It uses the *smallest* shift that brings
the value under 256. So 2000 becomes 250 << 3 instead of 125 << 4, and 65280
comes out like this:

```asm
0        mov       r1, #255
2        lsl       r1, #8
4        add       r0, r1
6        bx        lr
```

That is 255 << 8. The moved value is always in the range 0..255, and the shift
is whatever is needed to reach the constant.

Notice two details in those listings. First, the constant is built in a
**scratch** register (`r2` in the first listing, `r1` in the second). gcc picks
it from the registers the arguments left free, so the register number tells you
nothing about the source. Second, in the first example the final add uses the
three-operand form (`add r0, r1, r2`). That is because the value being added to
was still in `r1`. This is the operand-order rule from earlier in this chapter.

Where the constant appears in the listing also matters. gcc emits the whole
`mov`/`lsl` pair at the point where the constant is *used*. So any register
arithmetic that comes first in the source also comes first in the assembly, and
the instructions that build the constant come after it.

Not every number can be built this way. 257 and 1025 are not a small value
times a power of two, so they are handled in a completely different way. That
is the next lesson. The constant in your target can be built this way.

## Your task

Write `func_0804a874` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0804a874(s32 a, s32 b) {
    return (b - a) + 1024;
}
```
