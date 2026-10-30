---
id: 37b9a40f-311b-4241-90af-aba6ef89957d
slug: types-narrow-stores
title: "sb and sh: Stores Ignore Signedness"
difficulty: 2
concepts:
  - types
  - stores
symbol: func_801ee690
hints:
  - "There are two stores of the same register at neighboring element offsets. The gap between the offsets shows the element size."
  - "The value parameter stays a plain `s32`. The pointer's type does all the narrowing."
---

# Fewer mnemonics for stores

Storing narrow values is simpler than loading them, and the instruction set
reflects that. There is `sb` (store byte) and `sh` (store halfword), but
**there is no `sbu` or `shu`**. A store takes the low bits of the register and
writes them to memory. Nothing needs to be extended, so stores have no separate
signed and unsigned versions. Here is `put_byte`, which writes an `s32` value
into a byte slot:

```c
void put_byte(u8 *p, s32 v) {
    p[2] = v;
}
```

```asm
sb    a1, 2(a0)     # p[2] = low 8 bits of v
jr    ra
nop
```

Notice what is missing: there is no `andi 0xff` and no mask before the store.
C says that assigning a value to a `u8` keeps only the low byte. `sb` already
writes only the low byte, so the compiler emits nothing extra. The store itself
does the truncation.

This has two consequences when you decompile:

- A bare `sb`/`sh` tells you the *width* of the destination, but **not its
  signedness**. Stores to `s8` and `u8` look the same. When only a store
  touches a field, either declaration matches. Loads of that field elsewhere
  usually tell you which one is right.
- Assigning a wide value to a narrow location needs zero conversion
  instructions. If you see a mask before a store, something else is happening
  (the value is also *used* as a narrow value somewhere else).

The target writes one value into two neighboring slots of an array. Read the
store mnemonic for the width, and the offsets for the two indices.

## Your task

Write `func_801ee690` to reproduce the target assembly.

<!-- solution -->
```c
void func_801ee690(s16 *p, s32 v) {
    p[0] = v;
    p[1] = v;
}
```
