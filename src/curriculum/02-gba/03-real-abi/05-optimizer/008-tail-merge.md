---
id: facde530-3178-4a71-86b5-c98febc43ac2
slug: gba-optimizer-tail-merge
title: Two Paths, One Ending
difficulty: 4
concepts:
  - optimizer
  - branches
  - calls
symbol: func_083d765c
hints:
  - The `add r0, r1` at address 12 is not something that happens after the
    branch. It is the shared end of both arms - glue each arm's own `lsl` in
    front of it and read what that arm computes.
  - "`extern s32 submit(s32 v);` is declared for you. Two `s32` parameters, an
    `s32` out, and both arms end in the same call with a different small
    multiple of the second parameter."
---

# The ending both arms share

Cross-jumping is the pass that looks at two paths arriving at the same place,
notices they end with the same instructions, and keeps only one copy. The
earlier path branches into the survivor instead of repeating it.

The result reads badly if you take the listing at face value. Instructions
after the join look like a step the function performs once the branch is
settled, when in fact they are the last part of *both* branches — a suffix
written twice in the C and printed once. Reconstructing the C means gluing
the merged tail onto the end of each arm separately and asking what each
combination computes.

The pass is greedy from the end backwards, so it will swallow as much as
matches: arithmetic, a `bl`, and the epilogue all merge together if the two
paths agree that far. It does nothing at the front, though. Two arms that
*begin* with the same instruction keep both copies, because there is nothing to
branch into.

Here is `blendPick`, whose two arms differ only in one instruction:

```asm
0        cmp       r0, #0
2        bne       8 ~>
4        sub       r0, r1, r2
6        b         10 ~>
8      ~>add       r0, r1, r2
10     ~>asr       r0, #2
12       bx        lr
```

The `asr r0, #2` at address 10 is written once and belongs to both returns. The
false arm computes a difference, the true arm a sum, and each then falls into
the shared shift.

The pass is not exhaustive, and it is worth seeing it decline. `splitNotify`
calls the same function from both arms of an if/else:

```asm
0        push      {lr}
2        cmp       r0, #0
4        ble       14 ~>
6        add       r0, r1, #1
8        bl        notify-4
12       b         20 ~>
14     ~>sub       r0, r1, #1
16       bl        notify-4
20     ~>pop       {r0}
22       bx        r0
```

Two `bl notify` instructions, unmerged, even though the tails match. Do not
assume that identical endings always collapse — read what is actually there.

Your target does merge, and it merges more than the call. Look at everything
between the branch join and the `bl`.

## Your task

Write `func_083d765c` to reproduce the target assembly.

<!-- context -->
```c
extern s32 submit(s32 v);
```

<!-- solution -->
```c
s32 func_083d765c(s32 x, s32 y) {
    if (x < 0) return submit(y * 3);
    return submit(y * 5);
}
```
