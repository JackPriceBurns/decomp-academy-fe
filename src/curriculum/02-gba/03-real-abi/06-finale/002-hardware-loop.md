---
id: 53f4ec24-c65c-4618-b8f8-7ec8d0f0162e
slug: gba-realfinale-hardware-loop
title: Hardware in a Loop
difficulty: 4
concepts:
  - volatile
  - loops
  - globals
symbol: func_083f2314
hints:
  - The pool load happens once, before the loop. Inside the loop, the base
    register moves forward two bytes on each trip, and that step is the element
    size.
  - You do not write the `ldrh` in front of the `strh`. Write only the
    subscripted store, and the compiler adds the load for you.
  - "`void func_083f2314(s32 n, s32 step)` is the signature. The loop runs `n`
    times over `gPaletteRam`, and the value stored grows by `step` on every
    trip."
---

# One store per trip, and an extra load

Video and palette memory work like a large array of halfwords, so GBA code
writes to them in loops. Two rules you already know apply here. First, the
address of a global is a constant, so the compiler moves its pool load out of
the loop. Second, `volatile` stops the compiler from changing the stores in any
way. It cannot move them out of the loop, merge them, or remove them, even when
they look redundant.

The loop handles the base register with ordinary strength reduction. Instead of
computing `base + i * 2` on every trip, gcc keeps a pointer that moves forward
and adds the element size to it each time. So the constant in `add rN, #imm`
tells you the width of each element being written.

One part of the output looks like a mistake. When you write a byte or halfword
store with the **subscript operator on a volatile array**, the compiler puts a
load of the same address in front of it. The loaded value is never used. Here
is `fadeRows`, which writes a descending ramp of values into `gBlendTable`:

```asm
0        push      {r4, r5, lr}
2        mov       r4, r0
4        mov       r3, #0
6        cmp       r3, r4
8        bge       28 ~>
10       mov       r5, #31
12       ldr       r2, [pc, #20] (->36)
14     ~>sub       r0, r5, r3
16       ldrh      r1, [r2, #0]
18       strh      r0, [r2, #0]
20       add       r2, #2
22       add       r3, #1
24       cmp       r3, r4
26       blt       14 ~>
28     ~>pop       {r4, r5}
30       pop       {r0}
32       bx        r0
34       .hword    0
36       .word     gBlendTable
```

`ldrh r1, [r2, #0]` at address 16 reads the halfword that address 18 is about to
overwrite. Nothing ever reads r1 after that load. The source has only one
assignment. The extra load comes from the way gcc 2.9 handles a narrow volatile
lvalue, and you get it automatically when you write the plain subscripted store.

Now write the store a different way. If you write `*(gBlendTable + i)` instead
of `gBlendTable[i]`, the extra load disappears:

```asm
0        push      {r4, lr}
2        mov       r3, r0
4        mov       r1, #0
6        cmp       r1, r3
8        bge       26 ~>
10       mov       r4, #31
12       ldr       r2, [pc, #16] (->32)
14     ~>sub       r0, r4, r1
16       strh      r0, [r2, #0]
18       add       r2, #2
20       add       r1, #1
22       cmp       r1, r3
24       blt       14 ~>
26     ~>pop       {r4}
28       pop       {r0}
30       bx        r0
32       .word     gBlendTable
```

The C standard defines `a[i]` as `*(a + i)`, so the two functions mean exactly
the same thing. Even so, gcc 2.9 gives the subscript version one more
instruction, and that instruction needs a register to load into. In `fadeRows`
this is one register more than the function has free, so it pushes r4 and r5.
The pointer version pushes only r4. In a loop with fewer live values, the extra
load still appears, but no extra push is needed.

The extra load costs the game very little, and it tells you something useful:
which of the two equivalent spellings the original programmer used. Choosing the
right one is the difference between a match and a near-match.

These listings show one more thing. `fadeRows` counts **up** and compares its
counter with the trip count, because the body uses the value of `i` itself.
When strength reduction has removed every use of the index, gcc has no reason
to keep it. It then turns the counter into one that counts down to zero.

Your target counts down, so the body never uses the index. Everything the body
needs is built by adding a fixed amount on each trip, and that includes the
value that gets stored.

## Your task

Write `func_083f2314` to reproduce the target assembly.

<!-- context -->
```c
extern vu16 gPaletteRam[256];
```

<!-- solution -->
```c
void func_083f2314(s32 n, s32 step) {
    s32 i;

    for (i = 0; i < n; i++) {
        gPaletteRam[i] = i * step;
    }
}
```
