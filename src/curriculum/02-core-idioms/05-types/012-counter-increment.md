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

Narrow read-modify-write sequences follow a fixed three-instruction pattern on
PowerPC. Consider a function that adds `2` to the byte at `p[1]`:

```c
void add_two(u8* p) {
    p[1] += 2;
}
```

```asm
lbz   r4, 1(r3)   # load unsigned byte from p[1]
addi  r0, r4, 2   # add the constant in a 32-bit register
stb   r0, 1(r3)   # truncate and store back
blr
```

Three phases, three instructions: **`lbz`** zero-extends one byte into a
register; **`addi`** does the arithmetic at 32-bit width; **`stb`** takes the
low byte of the result and writes it back, discarding the upper bits — so
`255 + 1` correctly wraps to `0`.

Notice there is no `extsb` anywhere. That instruction appears only when a
signed byte value is *widened* to a wider signed integer. Because the byte is
loaded, modified, and stored back without ever being compared or passed to
something that needs a sign-extended value, neither `u8` nor `char` generates
one here. The habit still stands: reach for **`u8` for a raw byte**, because
the moment a `char` value escapes into a wider signed context you will see a
spurious `extsb` that `u8` avoids.

The assembly for `bump` follows the same three-phase structure. The
displacement and immediate differ — study those numbers and work out what
operation on which element they represent.

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
