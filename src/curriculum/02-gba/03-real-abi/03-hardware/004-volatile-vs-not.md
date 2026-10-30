---
id: 34337173-d9d8-498c-96a8-ebfdf5898d61
slug: gba-hardware-volatile-vs-not
title: The Load That Cannot Be Reused
difficulty: 3
concepts:
  - volatile
  - hardware
  - optimizer
symbol: func_08363694
hints:
  - Two `ldrh` instructions from the same base register, one right after the
    other, are the sign to look for. The source read that location twice, and
    the compiler was not allowed to merge the loads.
  - "Nothing goes in, and the combined halfword comes out. The address 67108870
    is 0x04000006, the scanline counter, and the two loaded values are combined
    with exclusive or. Both reads have to go through a `vu16`."
---

# Two loads where one would be enough

If you ask gcc to read the same address twice, it will normally read it once.
Common subexpression elimination is one of the first things `-O2` does. It is
correct for ordinary memory and wrong for hardware.

Here is a function that reads `BG0CNT` twice and adds the two results, written
with a `vu16`:

```asm
0        ldr       r0, [pc, #12] (->16)
2        ldrh      r1, [r0, #0]
4        ldrh      r0, [r0, #0]
6        add       r0, r1
8        lsl       r0, #16
10       lsr       r0, #16
12       bx        lr
14       .hword    0
16       .word     67108872
```

There are two `ldrh` instructions, with the same base register, the same
offset, and nothing between them. The compiler knows that on ordinary memory
both loads would return the same value. It issues them anyway, because
`volatile` says each access in the source must happen.

If you remove the qualifier, the same source gets much shorter:

```asm
0        ldr       r0, [pc, #8] (->12)
2        ldrh      r0, [r0, #0]
4        lsl       r0, #17
6        lsr       r0, #16
8        bx        lr
10       .hword    0
12       .word     67108872
```

Now there is one load. With one value instead of two, the compiler can replace
`a + a` with cheaper shifts. `lsl #17` shifts left by one, which doubles the
value, and moves it up by sixteen more bits in the same instruction. `lsr #16`
brings it back down. Together, the two instructions double the value and
truncate it to sixteen bits.

Look at what did not change in the volatile version. The pool word is loaded
once, and the base register is reused for both loads. `volatile` only affects
the accesses to the hardware. The address arithmetic around them is ordinary
code, and the compiler optimises it as usual.

Here is one warning that will save you time. You can write the two reads as
named locals, or fold them into a single expression. Both are the same program,
but gcc 2.9 allocates registers differently for them. Sometimes the address
goes in `r0` and the values in `r1`, and sometimes the other way round. Which
form gives which layout also depends on the operator. If your two `ldrh`
instructions are correct but the base register is swapped, write the reads the
other way and compile again.

This is the clearest place in the course to see a keyword in a listing. Count
the loads. Your target has two of them from one base. If you write it without
`volatile`, the optimiser will merge them into one.

## Your task

Write `func_08363694` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_08363694(void)
{
    u16 a = *(vu16 *)0x04000006;
    u16 b = *(vu16 *)0x04000006;
    return a ^ b;
}
```
