---
id: structs-capstone
title: "Capstone: Reading a Whole Struct"
difficulty: 3
concepts:
  - structs
  - arrays
  - offsets
  - chaining
  - capstone
symbol: Hero_power
hints:
  - Four fields feed the result, one of them a constant-indexed member array.
    Read each load's displacement against the struct layout to name the field.
  - The two `lwz`s into scratch registers, the `mullw`, and the final `add`/`subf`
    reproduce one expression — trace the registers from each load to the return.
---

# Putting the chapter together

This is the chapter capstone. A realistic accessor pulls **several fields of one
struct** — scalars and a member-array element — and folds them into a single
value. Everything here you have already met: fields are loaded at their byte
offsets, a member array element is a fixed displacement, and the loads combine
through scratch registers in expression order, with the base pointer reused as
the address for every load until it's no longer needed.

Consider a signal struct mixing scalar fields with a sampled-data array:

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

Lay out the offsets: `kind` 0, `rate` 4, `samples` 8 (so `samples[1]` is at
`8 + 4 = 12`), `offset` at `8 + 16 = 24`. The compiler loads the operands,
multiplies two of them, then threads the rest through:

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

Four fields, four offsets, one expression. Each `lwz` displacement maps to a
field through the struct layout; the `mullw`, `add`, and `subf` show how they
combine (`subf rD, rA, rB` is `rB − rA`). Note the loads aren't in offset order —
they follow the order the operands are needed by the arithmetic.

The target assembly accesses a different struct with the same flavour: scalar
fields plus one member-array element, multiplied and added and subtracted into a
result. Decode every offset against the layout below, then rebuild the
expression.

## Your task

With the `Hero` struct above, write `Hero_power` to reproduce the assembly above.

<!-- starter -->
```c
int Hero_power(Hero* h) {
    return 0;
}
```

<!-- solution -->
```c
int Hero_power(Hero* h) {
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
