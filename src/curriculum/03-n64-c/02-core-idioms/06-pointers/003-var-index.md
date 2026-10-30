---
id: 12e0afeb-5b19-474f-90c2-e68ad5b14e53
slug: pointers-var-index
title: "The Indexing Trio: sll, addu, lw"
difficulty: 2
concepts:
  - pointers
  - arrays
  - indexing
  - shifts
symbol: func_800b82bc
hints:
  - "The first three instructions are the standard trio: shift the index, add the base, load. The extra `addu` after the load adds in the third argument."
  - "The body is one return line: `arr[i]` plus something. All three parameters are used."
---

# When the index is a variable

A constant index goes into the offset field. A *variable* index can't,
because the offset is fixed inside the instruction and `i` is not known until
run time. So the compiler computes the address itself. It uses what may be
the most common three-instruction sequence in all of N64 code:

```c
s32 nth(s32 *arr, s32 i) {
    return arr[i];
}
```

```asm
sll   t6, a1, 2     # i * 4      (stride of an s32)
addu  t7, a0, t6    # arr + i*4  (the element's address)
lw    v0, 0(t7)     # arr[i]
jr    ra
nop
```

Read it as one unit, **shift, add, load**, and turn it back into a single `[]`
in your head:

- the `sll` amount gives the element size (`2` means ×4, so each element
  is 4 bytes),
- the `addu` adds the base pointer and the scaled index,
- the offset of the load is `0`, because the whole index went into the
  address computation.

From now on, when you see `sll`, `addu` and a load together, read them as
`arr[i]` instead of as three separate instructions. The registers tell you
which parameter is the base (`a0`) and which is the index (`a1`).

Other instructions can follow the trio. The target runs the same three
instructions and then does one more operation before it returns. Trace the
register that the load writes to see where the value goes next.

## Your task

Write `func_800b82bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800b82bc(s32 *arr, s32 i, s32 bias) {
    return arr[i] + bias;
}
```
