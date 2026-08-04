---
id: a837e015-26b2-5e85-b52a-2183fcabbee8
slug: globals-narrow-type
title: The Opcode Follows the Type
difficulty: 2
concepts:
  - globals
  - sda21
  - types
  - lbz
  - lhz
symbol: func_8020df80
hints:
  - A u8 global loads with `lbz` (byte, zero-extended), still at an @sda21
    offset.
  - "`return gPlayerHealth;` compiles to `lbz r3, gPlayerHealth@sda21(r13)`."
---

# Narrow globals: same SDA, different load

`@sda21` addressing doesn't change with the global's width — but the opcode does,
the same way type tracks any load. The relocation stays `R_PPC_EMB_SDA21`; the
instruction tells you the declared type:

```asm
lbz   r3, g@sda21(r13)   # u8  global  (load byte, zero-extend)
lhz   r3, g@sda21(r13)   # u16 global  (load halfword, zero-extend)
lha   r3, g@sda21(r13)   # s16 global  (load halfword, sign-extend)
```

A `u8` global gives `lbz` (load byte zero), `u16` gives `lhz` (load halfword
zero), and signed `s16` switches to `lha` (load halfword algebraic = sign-extend).
This is how you recover a global's type from disassembly: the displacement says
"it's a global," the opcode says "this wide, this signedness." A byte global read
with `lbz` was a `u8`, not an `int`.

Writes mirror this — a `u8` store is `stb rX, sym@sda21(r13)` and a 16-bit store
is `sth rX, sym@sda21(r13)` (no signed/unsigned distinction on stores; only width
matters). That `stb`/`sth` is the narrow-width sibling of `stw`.

## Your task

`extern u8 gPlayerHealth;` is provided. Write `func_8020df80` to match the target.
Keep the return type `u8` so the load stays `lbz`.

<!-- solution -->
```c
u8 func_8020df80(void) {
    return gPlayerHealth;
}
```

<!-- context -->
```c
extern u8 gPlayerHealth;
```
