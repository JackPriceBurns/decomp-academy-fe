---
id: 0768bc88-7d92-4af0-9fd4-4345e43ac9b6
slug: gba-hardware-read-register
title: Reading a Hardware Register
difficulty: 3
concepts:
  - hardware
  - volatile
  - literal-pool
symbol: func_0835a7ac
hints:
  - Two `.word` rows mean the function needs two constants. Judge them by
    size. One is an address in the I/O region, and the other is far too small
    to be an address.
  - "There are no parameters, and the halfword it builds is the return value.
    The address is 0x04000130, the key-input register, and 1023 is 0x3FF, the
    ten key bits."
---

# Reading a number the hardware wrote

A hardware read is an ordinary load. You can recognise it by where the address
comes from. An I/O register sits at a fixed absolute address, which almost
never fits in an immediate. So the function starts by loading that address from
its literal pool.

Here is a read of `BG0CNT`, the control word for background layer 0:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrh      r0, [r0, #0]
4        bx        lr
6        .hword    0
8        .word     67108872
```

67108872 is `0x04000008`. The `ldr` loads that address into `r0`. Then
`ldrh r0, [r0, #0]` loads the halfword stored at that address. This replaces
the address in `r0` with the value it pointed to. `ldrh` zero-extends into the
full 32-bit register. The top sixteen bits come back as zero, so no extra
narrowing is needed.

Most registers pack several fields into one halfword, so a read is usually
followed by a mask. `DISPSTAT` at `0x04000004` keeps its status flags in the low
three bits:

```asm
0        ldr       r0, [pc, #8] (->12)
2        ldrh      r1, [r0, #0]
4        mov       r0, #7
6        and       r0, r1
8        bx        lr
10       .hword    0
12       .word     67108868
```

This time the value goes into `r1`, because `r0` is needed for the mask.
Thumb's `and` takes two operands and overwrites the first one. To get the
result into `r0`, the compiler puts the *mask* in `r0` and ands the *value* into
it. So read `and r0, r1` as "r0 becomes mask & value".

Seven fits in a `mov`. A mask wider than eight bits does not. It goes the same
way as the address: into the pool, then out again with an `ldr`. Functions with
two pool words are common in this chapter, and you can tell the two words
apart. An I/O address prints as a number over 67 million. A mask prints as a
number you can recognise in hex.

Your target has two pool words and one `and`.

## Your task

Write `func_0835a7ac` to reproduce the target assembly.

<!-- solution -->
```c
u16 func_0835a7ac(void)
{
    return *(vu16 *)0x04000130 & 0x03FF;
}
```
