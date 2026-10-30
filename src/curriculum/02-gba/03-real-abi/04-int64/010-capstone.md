---
id: 423a7325-9e9c-4a49-a10e-712882122ae7
slug: gba-int64-capstone
title: "Capstone: A 64-bit Accumulator"
difficulty: 5
concepts:
  - int64
  - loops
  - libgcc
symbol: func_083b3abc
hints:
  - There are two sign fills in the listing, and they widen different things.
    The one inside the loop widens each element before it is added to the
    total. The one after the loop widens a value for the helper call.
  - It takes an `s32 *` and an `s32`, and returns an `s32`. Sum the array into a
    64-bit accumulator, divide by the count, and let the result truncate when it
    is returned.
---

# Everything at once

In GBA code, 64-bit arithmetic appears mainly in accumulators that are wider
than the values they add up. An accumulator like this also uses nearly
everything this chapter has covered: a widening for each element, an `add`/`adc`
for each element, and a truncation at the end.

Here is one that sums halfwords:

```asm
0        push      {r4, r5, lr}
2        mov       r4, #0
4        mov       r5, #0
6        cmp       r1, #0
8        ble       30 ~>
10       mov       r2, r0
12       mov       r3, r1
14     ~>ldrh      r0, [r2, #0]
16       mov       r1, #0
18       add       r4, r0
20       adc       r5, r1
22       add       r2, #2
24       sub       r3, #1
26       cmp       r3, #0
28       bne       14 ~>
30     ~>mov       r0, r4
32       pop       {r4, r5}
34       pop       {r1}
36       bx        r1
```

Read it one part at a time.

The **loop skeleton** is the rotated shape you already know. There is a guard
(`cmp r1, #0` / `ble`) before the body and a repeated test at the bottom
(`cmp r3, #0` / `bne`). The counter is rewritten to count down to zero, even
though the source counts up.

The **accumulator** is `r4:r5`. Two `mov`s set it to zero before the guard. It
is kept in callee-saved registers because it has to survive the whole loop. Each
iteration widens the loaded element with `mov r1, #0`. That is a zero fill, so
the elements are unsigned. Then `add r4, r0` / `adc r5, r1` adds the element to
the accumulator.

The **cursor** is `r2`. `add r2, #2` moves it forward, because these elements
are two bytes wide.

The **exit** is `mov r0, r4`. The low half is the answer, and the high half is
dropped without any instruction. `pop {r1}` confirms that this function returns
32 bits.

Your target's loop is shorter than this one. Its load and its cursor update are
combined into the `ldmia rN!, {rX}` you met in the loops chapter, so the stride
never appears as an `add`.

After the loop, your target calls a helper, because there is no 64-bit divide
instruction either. Here is one that divides by a constant:

```asm
0        push      {lr}
2        ldr       r3, [pc, #16] (->20)
4        ldr       r2, [pc, #8] (->16)
6        bl        __divdi3-4
10       pop       {r2}
12       bx        r2
14       .hword    0
16       .word     1000
20       .word     0
```

The two pool words together are the divisor. `__divdi3` expects one pair in
`r0:r1` and the other in `r2:r3`, so any value narrower than 64 bits has to be
built into a pair before the call. That is why your target spends four
instructions between the loop and its `bl`. Work out which two of them are the
divisor.

## Your task

Write `func_083b3abc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_083b3abc(s32 *p, s32 n) {
    s64 t = 0;
    s32 i;
    for (i = 0; i < n; i++) t += p[i];
    return (s32)(t / n);
}
```
