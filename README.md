# Medical Oncology Prior Authorization (MOPA) Implementation Guide

Site: **https://reason-healthcare.github.io/hl7-codex-mopa/**

> 💬 **Have feedback?** See the [Feedback Guide](./docs/FEEDBACK.md) for easy ways to submit comments — including options for non-technical reviewers and AI-assisted issue filing.

> NOTE: For original documentation, [see docs](./docs/README.md)

A FHIR Implementation Guide that extends the [Da Vinci Burden Reduction](https://confluence.hl7.org/display/DVP)
suite — CRD, DTR, and PAS — with oncology-specific capabilities: a computable anti-cancer regimen
representation and a structured patient context package for coverage authorization evaluation.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Java | 11+ | IG Publisher |
| Node.js | 18+ | SUSHI (FSH compiler) + diagram generation |
| npm | 8+ | Dependency management |

## Quick Start

```bash
# 1. Install Node dependencies (SUSHI + Mermaid CLI)
npm install

# 2. Download IG Publisher (~100 MB, one-time)
./ig-build.sh update

# 3. Build the IG
./ig-build.sh
```

The full build output lands in `output/index.html`.

## Building

All build operations go through **`ig-build.sh`**:

```
./ig-build.sh [command] [--no-diagrams] [--no-sushi]
```

### Commands

| Command | What it does |
|---------|-------------|
| *(none)* | **Full build**: diagrams → SUSHI → IG Publisher |
| `diagrams` | Re-render `.mermaid` source files to SVG only |
| `sushi` | Run SUSHI FSH compilation only |
| `publisher` | Run IG Publisher only (no diagrams, no SUSHI) |
| `nosushi` | Diagrams → IG Publisher, skip SUSHI |
| `notx` | Full build without terminology server (offline) |
| `watch` | Full build, then watch for changes |
| `clean` | Remove `output/`, `temp/`, `template/` |
| `update` | Download / update `publisher.jar` |
| `help` | Show usage |

### Options

| Option | Effect |
|--------|--------|
| `--no-diagrams` | Skip diagram generation step |
| `--no-sushi` | Skip SUSHI compilation step |

### Common workflows

```bash
# Full build
./ig-build.sh

# Rebuild after editing FSH only (diagrams unchanged)
./ig-build.sh --no-diagrams

# Rebuild after editing a page only (no FSH, no diagrams changed)
./ig-build.sh publisher

# Build without network (no terminology server)
./ig-build.sh notx

# Watch mode — rebuilds automatically on file changes
./ig-build.sh watch

# Just regenerate diagrams after editing a .mermaid file
./ig-build.sh diagrams

# Clean and rebuild from scratch
./ig-build.sh clean && ./ig-build.sh
```

All commands are also available as npm scripts:

```bash
npm run build          # Full build
npm run build:notx     # Build offline
npm run build:nosushi  # Skip SUSHI
npm run build:watch    # Watch mode
npm run diagrams       # Diagrams only
npm run publisher:update
```

## Diagrams

Diagrams are authored as plain-text **Mermaid source files** in `input/images/`:

```
input/images/
  mopa-stakeholders.mermaid   ← edit this
  mopa-stakeholders.svg       ← generated, commit this
  mopa-workflow.mermaid
  mopa-workflow.svg
  mopa-cds-hooks.mermaid
  mopa-cds-hooks.svg
  mermaid.config.json         ← shared theme/layout config
```

To update a diagram:
1. Edit the `.mermaid` file
2. Run `./ig-build.sh diagrams` (or `npm run diagrams`)
3. Commit both the `.mermaid` source and the generated `.svg`

Generated SVGs are committed so the IG can be built without Node.js by downstream users.

## Publishing to GitHub Pages

The published IG is available at: **https://reason-healthcare.github.io/hl7-codex-mopa/**

**`ig-publish.sh`** builds the IG and force-pushes `./output` to the `origin/guide` branch,
which should be configured as the GitHub Pages source
(Settings → Pages → Branch: `guide` / root).

```bash
# Full build then publish
./ig-publish.sh

# Publish the existing ./output without rebuilding
./ig-publish.sh --skip-build

# Build but stop before pushing (verify output first)
./ig-publish.sh --dry-run
```

> **First-time setup:** run `./ig-publish.sh` once to create the `guide` branch, then
> enable GitHub Pages on it in the repository settings.

## Project Structure

```
ig-build.sh                    ← main build entry point
ig-publish.sh                  ← build + force-push output/ to origin/guide (GitHub Pages)
_generate-diagrams.sh          ← Mermaid → SVG renderer
_genonce.sh                    ← HL7 standard: run IG Publisher once
_gencontinuous.sh              ← HL7 standard: run IG Publisher in watch mode
_updatePublisher.sh            ← HL7 standard: download publisher.jar
_build.sh                      ← HL7 standard: interactive build menu
sushi-config.yaml              ← SUSHI project configuration and IG metadata
ig.ini                         ← IG Publisher entry point
package.json                   ← Node dependencies and npm scripts
input/
  fsh/                         ← FSH source (profiles, extensions, value sets, examples)
    aliases.fsh
    mcode-candidates/
      profiles/
      extensions/
      terminology/
    instances/
      examples/
  pagecontent/                 ← Narrative IG pages (Markdown)
  images/                      ← Diagram sources (.mermaid) and generated SVGs
input-cache/
  publisher.jar                ← IG Publisher (gitignored, download via ig-build.sh update)
fsh-generated/                 ← SUSHI output (gitignored)
output/                        ← IG Publisher output (gitignored)
docs/                          ← Background analysis and design documents
```

## Dependencies

| Implementation Guide | Version | Role |
|---|---|---|
| [US Core](http://hl7.org/fhir/us/core) | 7.0.0 | Base US patient, practitioner, and clinical data profiles |
| [mCODE](http://hl7.org/fhir/us/mcode) | 4.0.0 | Oncology clinical data foundation |
| [Da Vinci CRD](http://hl7.org/fhir/us/davinci-crd) | 2.2.1 | Coverage Requirements Discovery |
| [Da Vinci DTR](http://hl7.org/fhir/us/davinci-dtr) | 2.2.0 | Documentation Templates and Rules |
| [Da Vinci PAS](http://hl7.org/fhir/us/davinci-pas) | 2.2.1 | Prior Authorization Support |

## Background Documentation

Prior analysis and design documents are in [`./docs`](./docs):

- [`docs/initial-analysis.md`](./docs/initial-analysis.md)
- [`docs/iteration-2-exec-summary.md`](./docs/iteration-2-exec-summary.md)
- [`docs/iteration-2-mcode-gaps.md`](./docs/iteration-2-mcode-gaps.md)
- [`docs/iteration-2-oncology-pa-support-codex.md`](./docs/iteration-2-oncology-pa-support-codex.md)
