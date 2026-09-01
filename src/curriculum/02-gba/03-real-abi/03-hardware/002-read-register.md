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
    size — one is an address up in the I/O region, the other is far too small
    to be one.
  - "No parameters, and the halfword it builds is the return value. The address
    is 0x04000130, the key-input register, and 1023 is 0x3FF, the ten key
    bits."
---

# Fetching a number the hardware wrote

A hardware read is a load like any other. What makes it recognisable is where
the address comes from: an I/O register sits at a fixed absolute address that
almost never fits in an immediate, so the function opens by pulling that address
out of its literal pool.

Here is a read of `BG0CNT`, the control word for background layer 0:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldrh      r0, [r0, #0]
4        bx        lr
6        .hword    0
8        .word     67108872
```

67108872 is `0x04000008`. The `ldr` fetches that address into `r0`, then
`ldrh r0, [r0, #0]` loads the halfword living there, overwriting the address
with the value it pointed at. `ldrh` zero-extends into the full 32-bit register,
so the top sixteen bits come back as zero and no extra narrowing is needed.

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

The value lands in `r1` this time, because `r0` is needed to hold the mask.
Thumb's `and` is two-operand and destructive, so the compiler arranges for the
result to end up in `r0` by putting the *mask* there and anding the *value* into
it. Reading `and r0, r1` as "r0 becomes mask & value" is the right way round.

Seven fits in a `mov`. A mask wider than eight bits does not, and it takes the
same route the address took — into the pool, out through an `ldr`. A function
with two pool words is common in this chapter, and telling them apart is easy:
an I/O address prints as something over 67 million, and a mask prints as a
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
