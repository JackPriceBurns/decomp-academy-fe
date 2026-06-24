---
id: loops-strlen
title: Walking a Pointer to a Sentinel
difficulty: 3
concepts:
  - pointers
  - sentinel
  - byte-load
symbol: slen
hints:
  - Loop `while (*p) { n++; p++; }` — the pointer itself is the loop state.
  - A `u8` load is `lbz`; comparing an unsigned byte gives `cmplwi`, not `cmpwi`.
  - Keep `p` typed as `u8*` so no sign-extension creeps in.
---

# No counter, just a moving pointer

Some loops have no numeric bound at all — they advance a pointer until they hit a
**sentinel** value, like the `'\0'` that terminates a C string. Here there is no
induction integer; the pointer in `r3` *is* the loop state. Each iteration loads
a byte with `lbz` (load byte, zero-extended), tests it, and bumps the pointer:

```asm
li   r4, 0          # counter = 0
b    test
body:
addi r4, r4, 1      # increment counter
addi r3, r3, 1      # advance pointer
test:
lbz  r0, 0(r3)      # byte load
cmplwi r0, 0        # unsigned compare against zero
bne+ body
mr   r3, r4
blr
```

Two things to notice. The byte load is `lbz` because the data is `u8`, and the
test is `cmplwi` — an *unsigned* compare, because `u8` is unsigned. Typing the
pointer as `u8*` (not `char*`) is what keeps the load clean with no sign-extend.

`u8` is the project's own name for an unsigned byte — `typedef unsigned char
u8;` from a shared header, the same `u8`/`u16`/`u32` convention nearly every GC
decompilation uses. It matters here: `char` would invite a sign-extending load,
giving subtly different asm, so reach for the exact project type the target was
built with.

## Your task

Write `slen`, counting bytes until the zero terminator (a from-scratch `strlen`).
`p` is a `u8*`.

<!-- starter -->
```c
int slen(u8 *p) {
    int n = 0;
    // advance until *p == 0
    return n;
}
```

<!-- solution -->
```c
int slen(u8 *p) {
    int n = 0;
    while (*p) {
        n++;
        p++;
    }
    return n;
}
```
