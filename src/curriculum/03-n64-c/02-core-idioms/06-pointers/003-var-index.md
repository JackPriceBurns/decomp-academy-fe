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
  - "The first three instructions are the standard trio — shift the index, add the base, load. The extra `addu` after the load brings in the third argument."
  - "One return line, `arr[i]` plus something. All three parameters get used."
---

# When the index is a variable

A constant index folds into the offset field; a *variable* index can't —
the offset is baked into the instruction, and `i` isn't known until run
time. So the compiler computes the address itself, in what might be the
single most common three-instruction sequence in all of N64 code:

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

Read it as one unit — **shift, add, load** — and translate it back to a
single `[]` in your head:

- the `sll` amount encodes the element size (`2` means ×4, so a 4-byte
  element),
- the `addu` marries base pointer and scaled index,
- the load's offset is `0` because the whole index went through the
  address computation.

From here on, when you see `sll`/`addu`/load clustered together, don't
read three instructions — read `arr[i]`. The registers tell you which
parameter is the base (`a0`) and which the index (`a1`).

The trio never minds company. The target runs the same three
instructions and then folds in its third argument with one more
operation before returning — trace the register the load lands in to see
where it goes.

## Your task

Write `func_800b82bc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800b82bc(s32 *arr, s32 i, s32 bias) {
    return arr[i] + bias;
}
```
