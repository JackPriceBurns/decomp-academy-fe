---
id: types-u8-not-char
title: u8, Not char (The Spurious extsb)
difficulty: 3
concepts:
  - signed
  - char
  - sign-extension
  - matching-idiom
symbol: relay
hints:
  - "`char` is signed in MWCC, so promoting it to `int` for the call inserts an
    `extsb`."
  - Switch both pointers from `char*` to `u8*`; an unsigned byte needs no
    sign-extend, and the `extsb` disappears.
---

# A common byte-matching mix-up: char vs u8

In MWCC's world, a plain **`char` is signed**. That one fact bites constantly.
Whenever a `char` value is *promoted* — passed to a function, used in arithmetic,
returned as `int` — the compiler must sign-extend it first with an **`extsb`**.
A **`u8`** never sign-extends, because it is already unsigned.

Watch what happens when a byte is loaded and handed to a function that takes an
`int`. With `char`, an extra `extsb` appears:

```asm
lbz   r3, 0(r4)
extsb r3, r3      # <-- spurious: char promotes to signed int
bl    scale
stb   r3, 0(r31)
```

With **`u8`**, the loaded byte feeds the call directly — the `extsb` is **gone**:

```asm
lbz   r3, 0(r4)
bl    scale       # no extsb: u8 is already zero-extended
stb   r3, 0(r31)
```

The trailing `stb` needs no cleanup either way: a *store* only ever copies the
low 8 bits, so writing `scale`'s `int` result back through a byte pointer
truncates for free — don't reach for `& 0xFF`, which would add a `clrlwi` the
target doesn't have.

If your output has one stray `extsb` the target doesn't, the cause is almost
always a `char` that should have been a `u8`. That's the key takeaway of this
chapter: **for a raw byte, prefer `u8` over `char`.**

## Your task

Here `scale` takes an `int`. Write `relay` so it loads `s[0]`, passes it to
`scale`, and stores the result to `d[0]` — **with no `extsb`**. Choose your
pointer types carefully.

<!-- starter -->
```c
void relay(char* d, char* s) {
    d[0] = scale(s[0]);
}
```

<!-- solution -->
```c
void relay(u8* d, u8* s) {
    d[0] = scale(s[0]);
}
```

<!-- context -->
```c
int scale(int x);
```
