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
  - "`mov #241` then `neg` builds -241, which is `0xFFFFFF0F`. Complement that
    and you have the field the C is clearing."
  - Two `u32` arguments and a `u32` result. Clear a nibble out of the first,
    mask the second down to a nibble, shift it into the hole and or it in.
---

# Clear, shift, or

Writing a field back into a packed word is three operations, and they show up in
the listing in the same order every time: clear the destination bits, move the
new value into position, combine. With a variable mask the whole thing is three
instructions:

```asm
0        bic       r0, r2
2        and       r1, r2
4        orr       r0, r1
6        bx        lr
```

`bic` knocks the masked bits out of the first argument, `and` keeps only those
bits of the second, and `orr` glues the halves together. That trio is worth
memorising as a unit; any GBA codebase that writes hardware registers is full
of it.

With a constant field the mask has to be built, and the compiler builds the
*complement* rather than the mask itself, because clearing is what it needs:

```asm
0        ldr       r2, [pc, #8] (->12)
2        and       r2, r0
4        lsl       r1, #5
6        orr       r1, r2
8        mov       r0, r1
10       bx        lr
12       .word     4294966303
```

`4294966303` is `0xFFFFFC1F`, and complementing it gives `0x3E0` — bits 5
through 9. So the first argument keeps everything except that field, the second
argument is shifted up by 5 to land in it, and the two are or-ed. The shift
amount and the position of the cleared field agree, which is a good consistency
check when you are decoding one of these.

A clear-mask small enough to reach with `neg` skips the literal pool: `mov #16`
then `neg` is `0xFFFFFFF0`, the complement of the low nibble. Any time you see
`mov`/`neg` in front of an `and`, complement the number to find the field.

One thing the compiler will not do for you is decide whether the incoming value
needs trimming. If the listing masks the new value before shifting it, the
original C masked it; if it does not, the original trusted the value to fit.
Both are legal, and they are different code.

## Your task

Write `func_080ff980` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080ff980(u32 v, u32 x) {
    return (v & ~0xF0) | ((x & 0xF) << 4);
}
```
