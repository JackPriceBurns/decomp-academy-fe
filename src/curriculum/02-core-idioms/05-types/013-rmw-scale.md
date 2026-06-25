---
id: types-rmw-scale
title: Read, Scale, Truncate
difficulty: 3
concepts:
  - loads
  - stores
  - read-modify-write
  - truncation
  - u8
symbol: rmw_scale
hints:
  - "Same three-phase shape as the byte counter — `lbz` / arithmetic / `stb` —
    but the middle step is a constant multiply, so it's `mulli`."
  - The store truncates the wider product back to a byte for free; no mask is
    needed.
---

# The middle step can be any arithmetic

The byte counter taught the three-phase byte read-modify-write: **`lbz`** to pull
a byte into a register (zero-extended), an arithmetic step at 32-bit width, then
**`stb`** to truncate the result back to memory. That middle step isn't limited
to `addi` — it can be *any* arithmetic, including a constant multiply.

Consider `add5(p)`, which adds `5` to the byte at `p[1]`:

```asm
lbz   r4, 1(r3)   # load p[1], zero-extended
addi  r0, r4, 5   # add at 32-bit width
stb   r0, 1(r3)   # truncate the result back to one byte
blr
```

Now swap the `addi` for a multiply. A constant multiply by a non-power-of-two
uses **`mulli`** (*multiply immediate*); the whole 32-bit product is computed,
then `stb` keeps only its low byte:

```asm
lbz   r0, 0(r3)   # load p[0]
mulli r0, r0, 6   # p[0] * 6 at 32-bit width
stb   r0, 0(r3)   # store low byte (truncates for free)
blr
```

The truncation is the key idea: arithmetic always happens in a full register, but
writing through a byte pointer discards everything above the low 8 bits — so
`200 * 6 = 1200` (`0x4B0`) stores as `0xB0 = 176`. Don't add a `& 0xFF`; the
`stb` already does it, and the mask would emit a `clrlwi` the target lacks.

The target multiplies by a different constant. Read the `mulli` immediate.

## Your task

Write `rmw_scale`, taking a `u8*`, to match the target assembly. Expect
`lbz` / `mulli` / `stb` with no mask and no `extsb`.

<!-- starter -->
```c
void rmw_scale(u8* p) {
}
```

<!-- solution -->
```c
void rmw_scale(u8* p) {
    p[0] = p[0] * 3;
}
```
