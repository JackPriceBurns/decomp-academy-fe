---
id: 86d164ad-13ad-466b-84ad-752fbb7fb121
slug: types-byte-loop
title: "Bytes in a Loop"
difficulty: 3
concepts:
  - types
  - loops
  - pointers
  - delay-slots
symbol: func_801b4590
hints:
  - "It is a do/while, so there is no guard branch. The load is at the top of the loop, and the addition to the total sits in the delay slot of the back-edge branch."
  - "Add up every byte, move the pointer by one each time, and count down. The body is four lines, and the load's mnemonic gives the pointer's type."
---

# Loops over bytes

Now you will combine this chapter with the loop chapter. Games process byte
buffers in loops all the time, for checksums, string scans and palette
changes. The result is a loop structure you already know, with load mnemonics
that you can now read. Here is `count_zeros(p, n)`, which counts the zero bytes
in a buffer:

```c
s32 count_zeros(u8 *p, s32 n) {
    s32 c = 0;
    do {
        if (*p == 0) {
            c++;
        }
        p++;
        n--;
    } while (n > 0);
    return c;
}
```

```asm
 0:  or    v1, zero, zero  # c = 0
 4:  lbu   t6, 0(a0)       # ── loop top: current byte
 8:  addiu a1, a1, -1      # n--
 c:  bnez  t6, 0x18        # non-zero? skip the count
10:  nop
14:  addiu v1, v1, 1       # c++
18:  bgtz  a1, 0x4         # more bytes? around again
1c:  addiu a0, a0, 1       # (slot) p++
20:  or    v0, v1, zero
24:  jr    ra
28:  nop
```

You have seen every part of this before, combined in a new way:

- It is a `do`/`while`, so there is no guard branch.
- The `if` inside the body is a forward branch with its condition flipped,
  and a real `nop` in its delay slot.
- The pointer increment is in the delay slot of the back-edge branch.
- The stride is 1, because the elements are bytes.

The only *new* information in the whole listing is `lbu`. That one mnemonic
gives you the declaration of the source, exactly as it did in a two-line
function.

This is true across the whole chapter: width idioms do not change inside
larger structures. An `lbu` in a forty-line function means the same as it does
in a four-line one. When a big target is hard to follow, find the loads and
stores first, because they give you the types of your variables. Then read the
control structure around them.

The target adds every byte of a buffer into a total, counting down. There is
no `if` this time, so the body is shorter than in the worked example, but the
structure is the same.

## Your task

Write `func_801b4590` to reproduce the target assembly. Assume the count is
at least 1.

<!-- solution -->
```c
s32 func_801b4590(u8 *data, s32 n) {
    s32 t = 0;
    do {
        t += *data;
        data++;
        n--;
    } while (n > 0);
    return t;
}
```
