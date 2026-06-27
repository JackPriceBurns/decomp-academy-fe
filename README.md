# Decomp Academy

**Learn to decompile GameCube (PowerPC) assembly back into byte-matching C — graded live by the real Metrowerks CodeWarrior GC/2.0 compiler.**

[![Live: decomp-academy.dev](https://img.shields.io/badge/live-decomp--academy.dev-6d28d9)](https://decomp-academy.dev)
[![License: AGPL v3](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

🎮 **Try it at [decomp-academy.dev](https://decomp-academy.dev)** — 254 free, interactive lessons, in the browser, no signup required to start.

Decomp Academy teaches **matching decompilation**: the craft of recovering original
C source from a compiled binary so faithfully that it *re-compiles to the same
machine code*, instruction for instruction. You read the PowerPC assembly the
retail compiler produced, write C, and the real 2001 **Metrowerks CodeWarrior
GC/2.0** compiler (`mwcceppc.exe`) compiles and diffs your code against the
target. When every byte matches, the function is solved — even a single extra
instruction counts as a miss.

It takes you from *never having read a register* all the way to matching
authentic **Star Fox Adventures** functions.

## Who it's for

- Programmers curious how C actually compiles down to PowerPC, and how compilers work
- Contributors to GameCube & Wii **decompilation projects** who want to get faster at matching
- Anyone learning **reverse engineering** who prefers hands-on, graded practice over theory

## How it works

1. **Read the assembly** — the real PowerPC the retail compiler emitted.
2. **Write the C** — reconstruct the source; hints and a reference solution are a click away.
3. **The compiler grades it** — the actual MWCC GC/2.0 compiles your code and diffs it byte-for-byte.

## Curriculum

254 lessons across 18 chapters, grouped into four strictly-progressive tiers:

- **Warm-up — learn to read the machine.** Foundations (registers, return values,
  reading MWCC output) · The Decomp Loop (match %, objdump, diffing a near-match).
- **Core idioms — every shape C compiles into.** Integer arithmetic · bitwise &
  shifts · control flow (signed vs unsigned compares) · loops · types & width (the
  `u8`-not-`char` rule) · pointers & memory · structs, unions & bitfields · floating
  point (`frsp`, `fmadds`) · whole-function capstones.
- **The real ABI — frames, globals, optimizer, 64-bit.** Functions & the ABI (stack
  frames, declaration-order register coloring) · globals, the SDA & pools (`@sda21`,
  `@ha`/`@l`) · optimization & scheduling (`-O4,p`, peephole, the `#pragma` toggles) ·
  advanced idioms (paired-singles, switch jump tables, `volatile`) · 64-bit integers
  (carry chains, register pairing, downcast fingerprints).
- **Proving ground — real functions, start to finish.** Authentic Star Fox Adventures
  functions, from warm-ups to full capstones.

A live **[playground](https://decomp-academy.dev/playground)** compiles arbitrary C
through MWCC GC/2.0 so you can inspect the assembly it emits, and a
**[glossary](https://decomp-academy.dev/glossary)** defines the PowerPC, ABI, and
compiler vocabulary you'll meet along the way.

## Credits & related projects

Lessons draw on real functions from open-source GameCube decompilation projects:
[Star Fox Adventures](https://github.com/zcanann/SFA-Decomp) ·
[Pikmin 2](https://github.com/projectPiki/pikmin2) ·
[Metroid Prime](https://github.com/PrimeDecomp/prime) ·
[Mario Party 4](https://github.com/mariopartyrd/marioparty4).

Part of the wider decompilation community —
[decomp.me](https://decomp.me) ·
[decomp.dev](https://decomp.dev) ·
[the decomp wiki](https://wiki.decomp.dev). Instruction-level diffing is powered by
[objdiff](https://github.com/encounter/objdiff).

## Tech

Next.js (App Router) frontend, with the real MWCC GC/2.0 toolchain in the grading
loop and `objdiff` for byte-accurate assembly diffing.

## Running it locally

Requires Node 18+ and the sibling [`../sfa`](../sfa) decompilation project present
(it provides the MWCC compiler and binutils). Point elsewhere with
`SFA_ROOT=/path/to/sfa`.

```sh
npm install
npm run dev      # http://localhost:3000
```

## Contributing

Contributions are very welcome — especially new lessons. The workflow is the
standard GitHub fork-and-PR flow:

1. **Fork** the repository on GitHub and clone your fork:
   ```sh
   git clone https://github.com/<your-username>/decomp-academy-fe
   cd decomp-academy-fe
   ```
2. **Create a branch** for your change:
   ```sh
   git checkout -b my-new-lessons
   ```
3. **Make your changes** (see "Adding a lesson" below), commit, and push to your
   fork:
   ```sh
   git commit -am "Add lessons on <topic>"
   git push origin my-new-lessons
   ```
4. **Open a Pull Request** from your branch against this repo's `main`. Describe
   what you added and, for new lessons, which compiler behaviour they teach.

### Where the content lives

All content lives under **`src/curriculum/`** as a three-level folder tree —
ordering and grouping come entirely from the folder/file names, so there's no
config map to maintain:

```
src/curriculum/
  03-real-abi/              ← tier ("act" on the curriculum map)
    _tier.md                  title + one-line blurb
    05-int64/                ← chapter
      _chapter.md             title + one-line blurb
      001-register-pairing.md ← lesson
      002-add.md
```

- Every folder is named `NN-<id>`. The `NN` prefix orders siblings *within* its
  parent only — chapters restart at `01` inside each tier.
- A **lesson** `.md` has YAML frontmatter (`id`, `title`, `difficulty`,
  `concepts`, `symbol`, `hints`) followed by the explanation and a
  `<!-- starter -->` / `<!-- solution -->` C block.

The build step compiles this Markdown tree into JSON the app imports — it runs
automatically before `dev`/`build`, or on demand:

```sh
npm run curriculum
```

### Adding a lesson

1. Pick (or create) a chapter folder under the appropriate tier in
   `src/curriculum/` (add a new chapter with its own `_chapter.md`, or a new
   tier with a `_tier.md`).
2. Copy an existing `NNN-<slug>.md` as a template and edit the frontmatter,
   explanation, starter, and solution. The `symbol` field is the function name
   the grader compiles and diffs.
3. Run `npm run curriculum` and check the lesson appears in the app.
4. Verify your reference solution actually compiles to its symbol: start the app
   (`npm run dev`) and open `/api/admin/verify-all`, which compiles every
   lesson's reference solution through the compile API and reports any failures.

Because the *real* compiler is in the loop, every lesson target must be
truthful — write the C, compile it, and quote the assembly the compiler actually
emits. Nothing is hand-waved or hard-coded.

## License

Decomp Academy is free software licensed under the **GNU Affero General Public
License v3.0** ([AGPL-3.0](LICENSE)). You are free to use, study, modify, and
redistribute it — but any derivative work, **including a modified version run as
a network service**, must also be released under the AGPL-3.0 with its complete
source code made available. See [LICENSE](LICENSE) for the full text.
