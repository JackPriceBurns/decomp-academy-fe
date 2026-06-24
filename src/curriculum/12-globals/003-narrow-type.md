---
id: globals-narrow-type
title: The Opcode Follows the Type
difficulty: 2
concepts:
  - globals
  - sda21
  - types
  - lbz
  - lhz
symbol: readHealth
hints:
  - A u8 global loads with `lbz` (byte, zero-extended), still at an @sda21
    offset.
  - "`return gPlayerHealth;` compiles to `lbz r3, gPlayerHealth@sda21(r13)`."
---

# Narrow globals: same SDA, different load

The `@sda21` addressing doesn't change with the width of the global — but the
**opcode does**, exactly the way it tracks type for any load. The relocation stays
`R_PPC_EMB_SDA21`; the instruction tells you the declared type:

```asm
lbz   r3, g@sda21(r13)   # u8  global  (load byte, zero-extend)
lhz   r3, g@sda21(r13)   # u16 global  (load halfword, zero-extend)
lha   r3, g@sda21(r13)   # s16 global  (load halfword, sign-extend)
```

For a `u8` global you get **`lbz`** (load byte zero), for `u16` **`lhz`** (load
halfword zero), and a *signed* `s16` switches to **`lha`** (load halfword
algebraic = sign-extend). This is how you recover a global's type from
disassembly: the displacement says "it's a global," the opcode says "this wide,
this signedness." A byte global read with `lbz` was a `u8`, not an `int`.

Writes mirror this exactly — a `u8` store is `stb rX, sym@sda21(r13)` and a
16-bit store is `sth rX, sym@sda21(r13)` (there's no signed/unsigned distinction
on stores; only the width matters). That `stb`/`sth` is just the narrow-width
sibling of the `stw` from the previous lesson.

## Your task

`extern u8 gPlayerHealth;` is provided. Write `readHealth` to match the target.
Keep the return type `u8` so the load stays `lbz`.

<!-- starter -->
```c
u8 readHealth(void) {
    return 0;
}
```

<!-- solution -->
```c
u8 readHealth(void) {
    return gPlayerHealth;
}
```

<!-- context -->
```c
extern u8 gPlayerHealth;
```
