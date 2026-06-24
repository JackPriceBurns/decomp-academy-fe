---
id: types-counter-increment
title: Bumping a Byte Counter
difficulty: 4
concepts:
  - loads
  - stores
  - read-modify-write
  - u8
symbol: bump
hints:
  - "Read-modify-write a byte: load with `lbz`, add with `addi`, store with
    `stb`."
  - "`p[0]++;` on a `u8*` gives `lbz` / `addi` / `stb` and no `extsb`."
---

# Read, modify, write — all at byte width

A byte counter ticking up is a complete read-modify-write at narrow width, and it
ties this chapter together. `(*p)++` on a `u8*` loads the byte, adds one, and
stores it back:

```asm
lbz   r4, 0(r3)   # load the current count (zero-extended, no extsb)
addi  r0, r4, 1   # increment
stb   r0, 0(r3)   # truncate back to a byte and store
blr
```

Three details to absorb: the load is `lbz` (unsigned byte, zero-extended), the
arithmetic is a plain `addi` in a 32-bit register, and the store is `stb`, which
truncates the sum back into one byte — so `255 + 1` correctly wraps to `0`.
Here the byte is loaded, incremented, and stored straight back — it never escapes
into a wider signed context — so even a `char*` counter would compile to this
exact sequence with no `extsb`. But the moment a `char` value *is* widened to
`int` (passed to a function, used in 32-bit arithmetic), that spurious `extsb`
appears (you saw it in the u8-vs-char lesson). The habit stands: **`u8` for a raw
byte.**

## Your task

Write `bump` to match the target. Expect exactly `lbz` / `addi` / `stb` with no `extsb`.

<!-- starter -->
```c
void bump(u8* p) {
}
```

<!-- solution -->
```c
void bump(u8* p) {
    p[0]++;
}
```
