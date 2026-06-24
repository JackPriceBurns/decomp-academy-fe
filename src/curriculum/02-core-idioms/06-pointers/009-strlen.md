---
id: pointers-strlen
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

Reading through a byte buffer means loading one byte per iteration with `lbz`,
advancing the pointer register with `addi`, and testing the loaded value. Because
the element type is `u8` (unsigned), the zero test uses `cmplwi` (compare logical
word immediate — unsigned) rather than `cmpwi`.

MWCC lays out the loop with the test **at the bottom**: an initial `b` jumps
straight to the first check, so a zero-length input skips the body entirely. The
back-edge branch carries a `+` hint — the compiler statically predicts loops will
iterate, so the branch-taken path is marked likely.

Here is a different example that sums the byte values instead of counting them:

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

Notice the `lbz`/`cmplwi`/`bne+` trio at the loop check, the pointer advancing
via `addi r3,r3,1`, and the accumulator held in `r4` until the final `mr`. Now
consider how the loop body changes when the goal is *counting* iterations instead
of summing byte values — what instruction replaces `add`?

## Your task

Write `str_len`, taking a `u8* s`, returning the number of bytes before the
terminating zero.

<!-- starter -->
```c
int str_len(u8* s) {
    return 0;
}
```

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
