---
id: 53731e9f-13fc-5e82-9ed2-015854a1ac4e
slug: loops-break
title: Breaking Out Early
difficulty: 3
concepts:
  - break
  - early-exit
  - linear-search
symbol: func_800dcc78
hints:
  - A plain counted `for` with `if (a[i] == k) break;` inside.
  - When `k` is found, `break` leaves the loop with `i` holding the index.
  - If the loop finishes normally `i == n`, which is the not-found answer.
---

# Two ways out of one loop

A `break` hands a loop a second door out. This is a plain linear search, so the
counted part still rides `mtctr`/`bdnz` to its normal finish, but there's an
extra `beq-` tucked inside that bolts the instant it spots `k`. Notice both exits
funnel into the same `mr r3, r6`, the one that hands back the index `i`.

```asm
li   r6, 0          # index = 0
mtctr r4            # CTR = n
cmpwi r4, 0
ble- done           # n <= 0: skip loop entirely
body:
lwz  r0, 0(r3)      # load current element
cmpw r5, r0         # test condition
beq- done           # early exit
addi r3, r3, 4      # advance pointer
addi r6, r6, 1      # increment index
bdnz+ body          # otherwise keep counting
done:
mr   r3, r6         # return index
blr
```

The tell is simple. A CTR-driven `bdnz` plus a stray conditional branch leaping
out of the middle? That middle branch is the `break`. Miss `k` entirely and the
loop just runs out the normal way, leaving `i == n`.

## Your task

Write `func_800dcc78`, returning the index of the first element of `a` equal to `k`, or
`n` if there is none.

<!-- solution -->
```c
int func_800dcc78(int *a, int n, int k) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == k) break;
    }
    return i;
}
```
