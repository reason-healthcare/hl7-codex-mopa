### Overview

The `DataRequirementLabel` extension attaches a short, human-readable name to a `DataRequirement`
entry within an `OncologyDataRequirementsLibrary`. This allows DTR questionnaire generators, CRD
content viewers, and other tooling to display requirement names without parsing profile URLs.

### Usage

Apply this extension to any `DataRequirement` entry in a condition-specific Library instance.
The first `DataRequirement` in every Library (the primary cancer condition, required by invariant
`ocpa-dr-1`) **SHALL** carry a label of the canonical form `[Cancer Type] Diagnosis`
(e.g., `Breast Cancer Diagnosis`). All other entries **SHOULD** carry descriptive labels.

### Constraints Summary

- Applied only to `DataRequirement` elements (context: `DataRequirement`)
- Value is a `string` — a short, human-readable name for the requirement
- First DataRequirement label convention: `[Cancer Type] Diagnosis`
