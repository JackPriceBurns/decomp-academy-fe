---
id: a923863b-4181-51cb-ba81-e72f2f87fd4b
slug: types-counter-increment
title: Bumping a Byte Counter
difficulty: 4
concepts:
  - loads
  - stores
  - read-modify-write
  - u8
symbol: func_80248e18
hints:
  - "Read-modify-write a byte: load with `lbz`, add with `addi`, store with
    `stb`."
  - "`p[0]++;` on a `u8*` gives `lbz` / `addi` / `stb` and no `extsb`."
---

# Read, modify, write a single byte

A byte never really changes where it sits. PowerPC fetches it into a register,
lets you fiddle with it there, then writes the result back, and it reaches for
the very same trio every time. Here is `p[1]` going up by `2`:

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

So the byte rides up into a register zero-padded, picks up its `2` where a whole
32 bits give the sum room to breathe, and then only its lowest eight bits survive
the trip back to memory. Everything above those eight is thrown out, which is why
`255 + 1` does not grow into 256 but loops quietly back to `0`.

Conspicuously missing from all of this is `extsb`. That one earns a place only
when a signed byte has to be hauled up into a wider signed type, and nothing of
the sort happens here, the value just loads, shifts a little, and heads back to
memory at its original width. So `u8` and `char` agree to leave it out. Still,
`u8` is the safer habit by far. Let a `char` drift into some wider signed
expression and `extsb` resurfaces unbidden, the very wrinkle `u8` spares you.

`func_80248e18` follows the very same cut, three phases in the very same order. All that
moves is the displacement and the immediate, so read those straight off the
target and puzzle out which element is in play and what happens to it.

## Your task

Write `func_80248e18` to match the target. Expect exactly `lbz` / `addi` / `stb` with no `extsb`.

<!-- solution -->
```c
void func_80248e18(u8* p) {
    p[0]++;
}
```
