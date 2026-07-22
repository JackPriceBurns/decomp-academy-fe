---
id: 83f44e13-b70a-5a69-a447-879332094c8c
slug: loops-strlen
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

This one threw me the first time, because there's nothing to count. The loop
just walks a pointer until it meets a **sentinel**, here the `'\0'` ending a C
string. No loop variable anywhere. `r3` is the loop itself, and each turn loads a
byte with `lbz` (load byte, zero-extended), checks it, and steps on.

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

Two snags that bit me. The load is `lbz` only because the data is a `u8`. The
compare is `cmplwi` only because that `u8` is unsigned. Type the pointer `u8*`
rather than `char*` and the load comes out clean.

That `u8` is the project's own unsigned byte, just `typedef unsigned char u8;` in
a shared header, the `u8`/`u16`/`u32` style nearly every GC decomp uses. Pick
`char` instead and you'd get a sign-extending load and slightly different asm, so
I always match the type the target was built with.

## Your task

Write `slen`, counting bytes until the zero terminator (a from-scratch `strlen`).
`p` is a `u8*`.

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
