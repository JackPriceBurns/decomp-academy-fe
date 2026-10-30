---
id: 9f7b0748-fa4d-4231-8501-d18c336c2e80
slug: gba-bitwise-insert
title: Putting a Field Back
difficulty: 4
concepts:
  - bitfields
  - bitwise
  - constants
symbol: func_080ff980
hints:
  - "`mov #241` then `neg` builds -241, which is `0xFFFFFF0F`. Complement that,
    and you have the field that the C clears."
  - The function takes two `u32` arguments and returns a `u32`. Clear a nibble
    out of the first argument, mask the second down to a nibble, shift it into
    the gap, and or it in.
---

# Clear, shift, or

Writing a field back into a packed word takes three operations, and they appear
in the listing in the same order every time. First the destination bits are
cleared, then the new value is moved into position, then the two are combined.
With a variable mask, the whole thing is three instructions:

```asm
0        bic       r0, r2
2        and       r1, r2
4        orr       r0, r1
6        bx        lr
```

`bic` clears the masked bits in the first argument, `and` keeps only those bits
of the second, and `orr` joins the two parts together. Learn these three
instructions as one unit. Any GBA codebase that writes hardware registers is
full of them.

With a constant field, the mask has to be built. The compiler builds the
*complement* of the mask, because clearing is what it needs:

```asm
0        ldr       r2, [pc, #8] (->12)
2        and       r2, r0
4        lsl       r1, #5
6        orr       r1, r2
8        mov       r0, r1
10       bx        lr
12       .word     4294966303
```

`4294966303` is `0xFFFFFC1F`, and its complement is `0x3E0`, which is bits 5
through 9. So the first argument keeps everything except that field, the second
argument is shifted up by 5 to land in it, and the two are or-ed together. The
shift amount matches the position of the cleared field. That is a good check
when you decode one of these.

If the clear mask is small enough to build with `neg`, the compiler does not
need the literal pool: `mov #16` then `neg` gives `0xFFFFFFF0`, the complement
of the low nibble. Whenever you see `mov`/`neg` in front of an `and`, complement
the number to find the field.

The compiler will not decide for you whether the incoming value needs trimming.
If the listing masks the new value before shifting it, the original C masked
it. If it does not, the original C trusted the value to fit. Both are legal C,
and they produce different code.

## Your task

Write `func_080ff980` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080ff980(u32 v, u32 x) {
    return (v & ~0xF0) | ((x & 0xF) << 4);
}
```
