---
id: 49b1d003-db82-5c35-a5af-33f7897019a8
slug: types-rmw-scale
title: Read, Scale, Truncate
difficulty: 3
concepts:
  - loads
  - stores
  - read-modify-write
  - truncation
  - u8
symbol: func_8026c740
hints:
  - "Same three-phase shape as the byte counter — `lbz` / arithmetic / `stb` —
    but the middle step is a constant multiply, so it's `mulli`."
  - The store truncates the wider product back to a byte for free; no mask is
    needed.
---

# The middle step can be any arithmetic

You met the three-phase byte read-modify-write with the counter: a byte comes in
through `lbz` already zero-extended, something happens to it in a full register,
and `stb` hands the trimmed result back. Nothing pins that middle step to `addi`.
Any arithmetic fits, a constant multiply included.

Take `add5(p)`, which tacks `5` onto the byte at `p[1]`:

```asm
lbz   r4, 1(r3)   # load p[1], zero-extended
addi  r0, r4, 5   # add at 32-bit width
stb   r0, 1(r3)   # truncate the result back to one byte
blr
```

Trade the `addi` for a multiply and very little changes. Multiplying by a
constant that is not a power of two calls for `mulli`, the immediate multiply,
which works out the entire 32-bit product before `stb` skims off its low byte:

```asm
lbz   r0, 0(r3)   # load p[0]
mulli r0, r0, 6   # p[0] * 6 at 32-bit width
stb   r0, 0(r3)   # store low byte (truncates for free)
blr
```

Truncation is doing all the work here. The math runs in a full register, but a
write through a byte pointer keeps only the bottom 8 bits and lets the rest go,
so `200 * 6 = 1200` (`0x4B0`) lands in memory as `0xB0 = 176`. Resist the urge to
tack on `& 0xFF`. The `stb` has already trimmed for you, and the mask would only
conjure a `clrlwi` that the target never had.

Your target scales by some other constant, so read it off the `mulli` immediate.

## Your task

Write `func_8026c740` to match the target assembly. Expect
`lbz` / `mulli` / `stb` with no mask and no `extsb`.

<!-- solution -->
```c
void func_8026c740(u8* p) {
    p[0] = p[0] * 3;
}
```
