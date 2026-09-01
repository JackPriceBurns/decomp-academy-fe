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
  - The pool load happens once, above the loop. Inside, the base register walks
    forward two bytes a trip, and that step is the element size.
  - The `ldrh` in front of the `strh` is not something you write. Write the
    subscripted store on its own and the compiler adds the load for you.
  - "`void func_083f2314(s32 n, s32 step)` — the loop runs `n` times over
    `gPaletteRam`, and the value stored grows by `step` on every trip."
---

# A write per trip, and a load nobody asked for

Video and palette memory behave like a big array of halfwords, so GBA code
writes them in loops. Two rules you already know meet here: the address of a
global is a constant, so its pool load lifts out of the loop; and `volatile`
forbids the compiler from touching the stores at all — none of them can be
hoisted, merged, or dropped, however obviously redundant they look.

What the loop does with the base register is ordinary strength reduction. Rather
than recompute `base + i * 2` each trip, gcc keeps a walking pointer and adds
the element size to it, so the step in `add rN, #imm` tells you the width of the
thing being written.

Then there is the part that reads like a mistake. A byte or halfword store
written with the **subscript operator on a volatile array** comes out with a
load of the same address in front of it, and the loaded value is never used.
Here is `fadeRows`, writing a descending ramp into `gBlendTable`:

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
overwrite, and r1 is dead the moment it is written. The source has one
assignment in it. This is a quirk of how gcc 2.9 handles a narrow volatile
lvalue, and you get it for free by writing the plain subscripted store.

Now change how the store is spelled. Write `*(gBlendTable + i)` in place of
`gBlendTable[i]`, and the phantom load is gone:

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

The C standard defines `a[i]` as `*(a + i)`, so those two functions are the same
program. gcc 2.9 disagrees by one instruction, and that instruction needs a
register to land in. In `fadeRows` that is one register too many: it pushes r4
and r5 where the pointer version pushes only r4. A loop with fewer live values
pays for the load without paying for the extra push.

That makes the phantom load worth more to you than it costs the game. It tells
you which of two identical spellings the original programmer used, and that is
the difference between a match and a near-match.

One more thing to read off these listings. `fadeRows` counts **up**, comparing
its counter against the trip count, because the body needs the value of `i`
itself. When every use of the index has been strength-reduced away, gcc has no
reason to keep it and turns the counter into a downcounter that runs to zero.

Your target counts down, so the index never reaches the body — everything the
body needs is built by adding a fixed amount each trip, including the value that
gets stored.

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
