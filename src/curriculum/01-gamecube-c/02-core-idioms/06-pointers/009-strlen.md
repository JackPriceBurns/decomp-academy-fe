---
id: 4b5953d8-dcb7-5f04-8f93-d4a6f83c86ba
slug: pointers-strlen
title: Walking a String
difficulty: 3
concepts:
  - loops
  - pointers
  - u8
symbol: str_len
hints:
  - Loop loading `*s` with `lbz`, advancing `s` with `addi`, until the byte is 0.
  - The u8 type makes the zero-test an unsigned `cmplwi r0, 0`.
---

# Advancing a pointer in a loop

Walking a byte buffer is a small loop. Each pass loads a byte with `lbz`, bumps
the pointer with `addi`, and checks what came back. The element is a `u8`, so it's
unsigned, and that nudges the zero test to `cmplwi` (compare logical word
immediate) instead of the signed `cmpwi`.

MWCC puts the test at the bottom of the loop. An opening `b` jumps right to that
check first, which means an empty input never enters the body. The back-edge
branch wears a `+` hint as well, MWCC's static guess that a loop usually loops, so
it marks the taken path as the likely one.

Here's a different one, summing the byte values rather than counting them:

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

See the `lbz`/`cmplwi`/`bne+` trio doing the loop check, the pointer creeping
forward with `addi r3,r3,1`, and `r4` holding the running total until the closing
`mr`. Now picture the body when you only want to *count* the iterations, not add
up byte values, what takes the place of `add`?

## Your task

Write `str_len`, taking a `u8* s`, returning the number of bytes before the
terminating zero.

<!-- solution -->
```c
int str_len(u8* s) {
    int n = 0;
    while (*s) {
        n++;
        s++;
    }
    return n;
}
```
