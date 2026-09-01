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
  - Two `ldrh` from the same base register, back to back, is the fingerprint.
    The source named that location twice and the compiler was forbidden from
    merging the loads.
  - "Nothing goes in; the combined halfword comes out. The address 67108870 is
    0x04000006, the scanline counter, and the two loaded values are
    exclusive-ored together. Both reads have to go through a `vu16`."
---

# Two loads where one would do

Ask gcc to read the same address twice and it will normally read it once.
Common subexpression elimination is one of the first things `-O2` does, it is
correct for ordinary memory, and it is exactly wrong for hardware.

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

Two `ldrh`, same base register, same offset, nothing between them. The compiler
knows both loads return the same thing on ordinary memory and it issues them
anyway, because `volatile` says each access in the source is an event that has
to happen.

Drop the qualifier and the same source collapses:

```asm
0        ldr       r0, [pc, #8] (->12)
2        ldrh      r0, [r0, #0]
4        lsl       r0, #17
6        lsr       r0, #16
8        bx        lr
10       .hword    0
12       .word     67108872
```

One load. And once there is one value instead of two, `a + a` is worth
strength-reducing: `lsl #17` shifts left by one and up by sixteen at once, and
`lsr #16` brings it back down, which doubles the value and truncates it to
sixteen bits in two instructions.

Notice what stayed the same in the volatile version. The pool word is fetched
once and the base register is reused for both loads. `volatile` pins the
accesses to the hardware; the address arithmetic around them is ordinary code
and gets optimised normally.

One warning before you go, because it will cost you time otherwise. Naming the
two reads as locals and folding them into a single expression are the same
program, and gcc 2.9 allocates registers differently for them — sometimes the
address lands in `r0` and the values in `r1`, sometimes the other way round, and
which spelling gives which flips depending on the operator. If your two `ldrh`
come out correct but with the base register swapped, rewrite the reads the other
way and compile again.

This is the cleanest place in the course to read a keyword off a listing. Count
the loads. Your target has two of them from one base, and no version of it
written without `volatile` will survive the optimiser intact.

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
