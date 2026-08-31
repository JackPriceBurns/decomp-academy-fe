---
id: 4b5953d8-dcb7-5f04-8f93-d4a6f83c86ba
slug: pointers-strlen
title: Walking a String
difficulty: 3
concepts:
  - loops
  - pointers
  - u8
symbol: func_802d654c
hints:
  - Loop loading `*s` with `lbz`, advancing `s` with `addi`, until the byte is 0.
  - The u8 type makes the zero-test an unsigned `cmplwi r0, 0`.
---

# Advancing a pointer in a loop

Walking a byte buffer is a small loop. Each pass loads a byte with `lbz`, bumps
the pointer with `addi`, and checks the result. The element is a `u8`, so it's
unsigned, which pushes the zero test to `cmplwi` (compare logical word
immediate) instead of the signed `cmpwi`.

MWCC puts the test at the bottom of the loop. An opening `b` jumps straight to
that check, so an empty input never enters the body. The back-edge branch has a
`+` hint — MWCC's guess that a loop usually loops, marking the taken path as
likely.

Here's a different version, summing byte values instead of counting:

```c
int byte_sum(u8* s) {
    int total = 0;
    while (*s) {
        total += *s;
        s++;
    }
    return total;
}
```

```asm
li      r4,0
b       10 <byte_sum+0x10>
add     r4,r4,r0
addi    r3,r3,1
lbz     r0,0(r3)
cmplwi  r0,0
bne+    8 <byte_sum+0x8>
mr      r3,r4
blr
```

The `lbz`/`cmplwi`/`bne+` trio handles the loop check, the pointer inches
forward with `addi r3,r3,1`, and `r4` holds the running total until the final
`mr`. Now picture the body when you only want to *count* iterations instead of
adding byte values. What replaces the `add`?

## Your task

Write `func_802d654c` to reproduce the target assembly.

<!-- solution -->
```c
int func_802d654c(u8* s) {
    int n = 0;
    while (*s) {
        n++;
        s++;
    }
    return n;
}
```
