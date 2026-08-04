---
id: 01aeb375-0c51-5d26-87f9-aec405b4e868
slug: types-u8-not-char
title: u8, Not char (The Spurious extsb)
difficulty: 3
concepts:
  - signed
  - char
  - sign-extension
  - matching-idiom
symbol: func_8006bacc
hints:
  - "`char` is signed in MWCC, so promoting it to `int` for the call inserts an
    `extsb`."
  - Switch both pointers from `char*` to `u8*`; an unsigned byte needs no
    sign-extend, and the `extsb` disappears.
---

# A common byte-matching mix-up: char vs u8

The thing to internalise about MWCC is that a bare **`char`** is *signed*, and it
causes more wrong diffs than almost anything else at this level. The moment a
`char` is *promoted* into a wider context — say an argument or an `int` return
value — an **`extsb`** has to run first to stretch its sign across the register.
None of that touches a **`u8`**, which is unsigned to begin with, so there is no
sign to carry upward.

Load a byte, pass it into a function expecting an `int`, and the difference shows
up right away. The `char` version drags an `extsb` along in front of the call:

```asm
lbz   r3, 0(r4)
extsb r3, r3      # <-- spurious: char promotes to signed int
bl    scale
stb   r3, 0(r31)
```

The unsigned version carries no such baggage, and the byte feeds the call as-is:

```asm
lbz   r3, 0(r4)
bl    scale       # no extsb: u8 is already zero-extended
stb   r3, 0(r31)
```

Either way the trailing `stb` is already correct, since a *store* drops
everything above the low 8 bits on its own. So `scale`'s `int` result narrows
back through the byte pointer for nothing, and adding `& 0xFF` would only conjure
a `clrlwi` the target was never built with.

A single orphaned `extsb` in your output, one the target does not have, is nearly
always the fingerprint of a `char` where a `u8` belonged. **For a raw byte, reach
for `u8` rather than `char`.**

## Your task

Here `scale` takes an `int`. Write `func_8006bacc` so it loads `s[0]`, passes it to
`scale`, and stores the result to `d[0]` — **with no `extsb`**. Choose your
pointer types carefully.

<!-- starter -->
```c
void func_8006bacc(char* d, char* s) {
    d[0] = scale(s[0]);
}
```

<!-- solution -->
```c
void func_8006bacc(u8* d, u8* s) {
    d[0] = scale(s[0]);
}
```

<!-- context -->
```c
int scale(int x);
```
