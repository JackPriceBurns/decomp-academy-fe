---
id: facde530-3178-4a71-86b5-c98febc43ac2
slug: gba-optimizer-tail-merge
title: Shared Endings Are Merged
difficulty: 4
concepts:
  - optimizer
  - branches
  - calls
symbol: func_083d765c
hints:
  - The `add r0, r1` at address 12 is the shared end of both arms, written
    once. Put each arm's own `lsl` in front of it and read what that arm
    computes.
  - "`extern s32 submit(s32 v);` is declared for you. The function takes two
    `s32` parameters and returns an `s32`. Both arms end in the same call, and
    each passes a different small multiple of the second parameter."
---

# The ending both arms share

Cross-jumping is a pass that looks at two paths that arrive at the same place.
If both paths end with the same instructions, it keeps only one copy. The
earlier path then branches to that copy instead of repeating it.

This makes the listing harder to read. The instructions after the join are the
last part of *both* branches: an ending that the C wrote twice and the listing
prints once. If you read the listing literally, they look like a separate step
that runs after the branch is finished. To rebuild the C, attach the merged
ending to each arm separately and work out what each combination computes.

The pass works backwards from the end and merges as much as it can. Arithmetic,
a `bl` and the epilogue can all merge together if the two paths match that far.
It does nothing at the start of the arms. Two arms that *begin* with the same
instruction keep both copies, because there is nothing to branch into.

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
false arm computes a difference and the true arm computes a sum. Each one then
reaches the shared shift.

The pass does not merge every matching ending, and it helps to see a case where
it does not. `splitNotify` calls the same function from both arms of an
if/else:

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

There are two `bl notify` instructions, and they are not merged, even though
the endings match. Do not assume that identical endings are always merged. Read
what is actually in the listing.

Your target does merge, and it merges more than the call. Look at everything
between the point where the branches join and the `bl`.

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
