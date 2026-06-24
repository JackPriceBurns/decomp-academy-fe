---
id: workflow-reading-objdump
title: Reading objdump
difficulty: 1
concepts:
  - objdump
  - disassembly
  - relocations
concept: true
---

# Reading objdump

Before you can match an asm function you have to *read* it. The target asm comes
from disassembling an object file with GNU objdump, with Gekko (the GameCube CPU)
extensions enabled:

```text
powerpc-eabi-objdump -M gekko -drz  some.o
```

The flags matter: `-d` disassembles, `-r` shows **relocations** inline, `-z` keeps
zero-bytes from being collapsed, and `-M gekko` makes objdump decode the
GameCube's paired-single instructions correctly instead of mistaking them for
something else.

## Anatomy of a line

Here is a real function that adds 1 to a register and returns:

```asm
<increment>:
   0:	38 63 00 01 	addi    r3,r3,1
   4:	4e 80 00 20 	blr
```

Each instruction line has four parts:

| Column        | Example       | Meaning                                   |
|---------------|---------------|-------------------------------------------|
| **Address**   | `0:`          | byte offset of this instruction in the fn |
| **Raw bytes** | `38 63 00 01` | the 4-byte encoded instruction            |
| **Mnemonic**  | `addi`        | the operation                             |
| **Operands**  | `r3,r3,1`     | destination first, then sources           |

Every PowerPC instruction is exactly 4 bytes, so addresses climb by 4.

## Symbol annotations: `<sym+0x..>`

When an instruction refers to a known address, objdump annotates it with the
nearest symbol and an offset. A local branch looks like this:

```asm
  10:	40 80 00 08 	bge-    18 <si+0x18>
```

`<si+0x18>` just means "address 0x18, which is 0x18 bytes into the function
`si`." It's a human label for the branch target — don't read it as data.

## Relocation lines

Calls to *other* functions and reads of *global* data can't be resolved until
link time, so the compiler emits a placeholder instruction plus a **relocation**
telling the linker what to patch in. objdump prints relocations on their own
indented line, right under the instruction they fix up:

```asm
   c:	48 00 00 01 	bl      c <f+0xc>
			c: R_PPC_REL24	g
```

```asm
   0:	80 60 00 00 	lwz     r3,0(0)
			0: R_PPC_EMB_SDA21	gv
```

Two relocation types you'll see constantly:

- **`R_PPC_REL24`** — a relative call. The `bl` above will branch to the function
  `g` once linked; right now its offset field is a stand-in `0x000001`.
- **`R_PPC_EMB_SDA21`** — a *small data area* access (SDA = Small Data Area,
  21 = a 21-bit signed offset). Frequently-used globals live in a region pointed
  to by a base register: `r2` holds the SDA2 base and `r13` holds the SDA base,
  so a global is reached as a small offset from one of those instead of a full
  32-bit address. The `0(0)` you see is a placeholder — the linker patches in the
  real base register and offset at link time — so `lwz r3,0(0)` + an `SDA21`
  reloc for `gv` is just "load the global `gv`," not a null dereference.

The placeholder bytes (the `0`s in the offset) are *expected* — when you match,
your relocations must name the same symbols, but you don't hand-encode offsets.
Read the reloc line as "this instruction touches *that* symbol."
