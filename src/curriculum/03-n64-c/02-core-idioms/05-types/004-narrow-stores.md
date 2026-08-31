---
id: 37b9a40f-311b-4241-90af-aba6ef89957d
slug: types-narrow-stores
title: "sb and sh: Stores Don't Care About Sign"
difficulty: 2
concepts:
  - types
  - stores
symbol: func_801ee690
hints:
  - "Two stores of the same register at neighboring element offsets — the element size shows in the gap between them."
  - "The value parameter stays a plain `s32`; the pointer's type does all the narrowing."
---

# Half the mnemonics this time

Storing narrow values is simpler than loading them, and the instruction
set says so: there's `sb` (store byte) and `sh` (store halfword) — **no
`sbu`, no `shu`**. A store just chops off the register's low bits and
writes them; there's nothing to extend, so there's no signed/unsigned
split. Here's `put_byte`, writing an `s32` value into a byte slot:

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

Note what *didn't* happen: no `andi 0xff`, no mask before the store. C
says an assignment into a `u8` keeps only the low byte — and `sb` does
that by construction, so the compiler emits nothing extra. The store *is*
the truncation.

Two consequences for your decompiles:

- A bare `sb`/`sh` tells you the *width* of the destination but **not its
  signedness** — `s8` and `u8` targets store identically. When only a
  store touches a field, either declaration matches; the loads elsewhere
  usually break the tie.
- Assigning a wide value to a narrow location costs zero instructions of
  conversion. If you see masking before a store, something else is going
  on (the value is *used* narrow elsewhere too).

The target writes one value into two neighboring slots of an array — read
the store mnemonic for the width and the offsets for the two indices.

## Your task

Write `func_801ee690` to reproduce the target assembly.

<!-- solution -->
```c
void func_801ee690(s16 *p, s32 v) {
    p[0] = v;
    p[1] = v;
}
```
