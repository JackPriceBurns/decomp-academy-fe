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

A classic string walk reads bytes until it hits the NUL terminator, counting as
it goes. The compiler keeps the running pointer in `r3` and the count in `r4`,
bumping both with `addi` and re-checking the loaded byte against zero each
iteration:

```asm
li      r4, 0          # count = 0
b       check
loop:
addi    r4, r4, 1      # count++
addi    r3, r3, 1      # s++
check:
lbz     r0, 0(r3)      # *s
cmplwi  r0, 0          # compare unsigned against 0
bne+    loop           # keep going while non-zero
mr      r3, r4         # return count
blr
```

Note the loop tests at the *bottom* (the initial `b` jumps straight to the
check), and the unsigned compare `cmplwi` comes from the `u8` element type. The
`+` on `bne+` is a static branch hint predicting the back-edge is taken — loops
are expected to iterate, so MWCC marks the loop branch as likely. (Contrast the
`beq-` in the NULL-check lesson, where the early-out is marked *un*likely.)

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
