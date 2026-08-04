---
id: d11ac49b-4e99-59e8-830d-54985f7801ce
slug: structs-capstone
title: "Capstone: Reading a Whole Struct"
difficulty: 3
concepts:
  - structs
  - arrays
  - offsets
  - chaining
  - capstone
symbol: func_80046b10
hints:
  - Four fields feed the result, one of them a constant-indexed member array.
    Read each load's displacement against the struct layout to name the field.
  - The two `lwz`s into scratch registers, the `mullw`, and the final `add`/`subf`
    reproduce one expression — trace the registers from each load to the return.
---

# Several fields, one expression

This is where the chapter cashes out. A real accessor doesn't touch just one field.
It grabs several fields of one struct at once — some scalars and a member-array
element — and crushes them into a single number. Nothing below is new, though. Each
field loads from its byte offset. An array element is the same idea plus a fixed
displacement. The values gather in scratch registers in whatever order the
expression calls for, and `r3` keeps doubling as the load address until there's
nothing left to load.

Take a signal struct that mixes scalar fields with a small array of samples:

```c
typedef struct {
    int kind;
    int rate;
    int samples[4];
    int offset;
} Signal;

int Signal_value(Signal* s) {
    return s->rate * s->kind + s->samples[1] - s->offset;
}
```

Work the offsets out first. `kind` at 0, `rate` at 4, `samples` at 8, so
`samples[1]` is at `8 + 4 = 12`, and `offset` is at `8 + 16 = 24`. Then the
compiler pulls the operands, multiplies two of them, and threads the rest in:

```asm
lwz    r4, 4(r3)     # rate          (offset 4)
lwz    r0, 0(r3)     # kind          (offset 0)
lwz    r5, 12(r3)    # samples[1]    (8 + 4)
mullw  r0, r4, r0    # rate * kind
lwz    r3, 24(r3)    # offset        (8 + 16), into r3
add    r0, r5, r0    # + samples[1]
subf   r3, r3, r0    # - offset
blr
```

Four fields, four offsets, one expression. Match each `lwz` displacement to a field
through the layout, and the `mullw`, `add`, and `subf` tell you how they combine
(`subf rD, rA, rB` is `rB − rA`). The loads ignore offset order; they appear exactly
when the arithmetic wants them.

The target works a different struct the same way: scalar fields plus one
member-array element, multiplied and added and subtracted into a result. Decode
each offset against the layout below, then rebuild the expression.

## Your task

With the `Hero` struct above, write `func_80046b10` to reproduce the assembly above.

<!-- solution -->
```c
int func_80046b10(Hero* h) {
    return h->strength * h->level + h->items[2] - h->bonus;
}
```

<!-- context -->
```c
typedef struct {
    int level;
    int strength;
    int items[3];
    int bonus;
} Hero;
```
