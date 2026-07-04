---
id: d6ed728f-0f96-511a-b89d-e4ce9366a0f7
slug: loops-array-max
title: Finding the Maximum
difficulty: 3
concepts:
  - arrays
  - ctr-loop
  - conditional-update
symbol: amax
hints:
  - Seed `m = a[0]`, then loop `i` from 1 to `n-1`.
  - "Update conditionally: `if (a[i] > m) m = a[i];` becomes a compare and a
    `mr`."
  - A known trip count makes MWCC use `mtctr` / `bdnz` for the loop.
---

# When the trip count is known up front

I still remember the first max-scan that fooled me. The count was no secret, `n`
sat right there, and MWCC noticed. Watch what it did. `n - 1` went straight into
the **count register** via `mtctr`, and from then on `bdnz` ("decrement CTR,
branch if non-zero") carried the loop. Search the body all you like, you won't
find a counter compare.

```asm
subi r0, r4, 1      # trip count = n - 1
addi r5, r3, 4      # pointer past first element
lwz  r3, 0(r3)      # load seed value
mtctr r0            # CTR = n - 1
cmpwi r4, 1
blelr-              # early return when nothing to scan
body:
lwz  r0, 0(r5)      # load candidate
cmpw r0, r3         # compare against running result
ble- skip
mr   r3, r0         # conditional update
skip:
addi r5, r5, 4      # advance pointer
bdnz+ body          # CTR--, loop while non-zero
blr
```

What fooled me was expecting an unrolled body. Nope. My running max only budged
when a candidate beat it, and MWCC won't unroll across a dependency like that, so
the loop stayed put even at `-O4,p`.

So, two souvenirs. `mtctr` cuddled up next to `bdnz`? Trip count was known before
the loop ever ran. `blelr-`? Compare-and-return, fused, the early bail when
there's nothing to scan. Keep that `mtctr`/`bdnz` couple in view, it walks back
on stage in the break lesson driving a loop that bails early too.

## Your task

Write `amax`, returning the largest of the `n` elements of `a` (assume `n >= 1`).

<!-- starter -->
```c
int amax(int *a, int n) {
    int i, m = a[0];
    // keep the largest element
    return m;
}
```

<!-- solution -->
```c
int amax(int *a, int n) {
    int i, m = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] > m) m = a[i];
    }
    return m;
}
```
