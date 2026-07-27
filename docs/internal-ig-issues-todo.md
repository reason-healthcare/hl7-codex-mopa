# Internal IG Issues To Do

## Status

The corrective IG changes are not currently applied to the working tree. They are stored in the Git stash named:

`WIP: internal IG corrections identified during Da Vinci Jira review`

The Da Vinci Jira draft is outside this checklist and was not included in that stash.

## Reference Versions

Review the internal IG against:

- Da Vinci CRD 2.2.1
- Da Vinci DTR 2.2.0
- Da Vinci PAS 2.2.1
- mCODE 4.0.0 (STU4)
- US Core 6.1.0, the baseline used by mCODE STU4
- FHIR R4 4.0.1

## IG Corrections

### Conformance and dependencies

- [ ] Align the IG's direct US Core dependency and versioned aliases with US Core 6.1.0. The IG currently declares US Core 7.0.0 while mCODE STU4 is based on US Core 6.1.0. This does not prevent use of mCODE, but it creates an avoidable mixed-version baseline in `sushi-config.yaml` and `input/fsh/aliases.fsh`.

**Original IG alignment:** Misaligned.

- [ ] Add central conformance guidance for mCODE and oncology candidate artifacts. State that oncology data fitting an mCODE STU4 profile should use that profile. Define candidate artifacts as canonical profiles, extensions, or value sets for identified mCODE gaps, and make clear that they are not current mCODE or Da Vinci artifacts until adopted or explicitly permitted.

**Affected content:** `input/pagecontent/conformance.md`, `input/pagecontent/data-requirements.md`, and `input/pagecontent/davinci-gap-proposals.md`.

**Original IG alignment:** Partially aligned. Individual candidate profiles describe their temporary status, but the IG lacks a single conformance rule.

### CRD examples and guidance

- [ ] Replace CRD response examples that use decision or DTR-launch cards as the computable coverage result. CRD 2.2.1 uses Coverage Information for the computable result; optional cards must not duplicate it.

**Affected examples:** `input/pagecontent/cds-workflow.md`, `input/pagecontent/walkthrough.md`, and `input/fsh/instances/examples/CdsHooksBundles-examples.fsh`.

**Incompatibility:** The current examples teach a response shape that no longer represents the current CRD-to-DTR workflow.

**Original IG alignment:** Misaligned.

- [ ] Do not show CRD card `appContext` as the DTR launch mechanism. When Coverage Information indicates that documentation is needed, the CRD client offers DTR and supplies the applicable request and coverage context at launch.

**Affected examples:** `input/pagecontent/cds-workflow.md`, `input/pagecontent/walkthrough.md`, `input/images/ogca-cds-hooks.mermaid`, and `input/images/ogca-workflow.mermaid`.

**Incompatibility:** The current launch example follows an obsolete card-based pattern.

**Original IG alignment:** Misaligned.

- [ ] Label Coverage Information attached directly to a regimen `RequestGroup` as proposed target-state content. The current CRD coverage-information extension does not permit `RequestGroup`, so the examples depend on the change requested from CRD.

**Affected examples:** CRD response payloads in `input/pagecontent/walkthrough.md` and the related gap description.

**Incompatibility:** Without the label, readers may treat a currently nonconformant extension target as valid CRD 2.2.1 content.

**Original IG alignment:** Partially aligned. The IG identifies the upstream gap but does not consistently qualify the examples.

- [ ] Correct hook-context guidance so `context.draftOrders` carries the regimen for `order-select` and `order-sign`, while `context.selections` is used only for `order-select`.

**Affected content:** `input/fsh/instances/CapabilityStatements.fsh`, `input/fsh/mcode-candidates/profiles/AntiCancerRegimenRequestGroup.fsh`, `input/pagecontent/conformance.md`, and `input/pagecontent/davinci-gap-proposals.md`.

**Incompatibility:** The current text applies an `order-select` context element to `order-sign`.

**Original IG alignment:** Misaligned.

- [ ] Change `order-sign` examples from requiring all component `MedicationRequest` resources to be finalized to requiring the components available at hook invocation. Explain how unresolved components are represented without requiring finalization solely to invoke CRD.

**Affected examples:** `input/fsh/instances/examples/CdsHooksBundles-examples.fsh` and `input/pagecontent/walkthrough.md`.

**Incompatibility:** The current examples impose a workflow constraint that CRD does not require and that some ordering workflows cannot satisfy.

**Original IG alignment:** Misaligned.

### DTR examples and guidance

- [ ] Define both DTR changes required for regimen-level documentation: permit `RequestGroup` as the `$questionnaire-package` `order` resource type and as a DTR `qr-context` target.

**Affected content:** `input/pagecontent/davinci-gap-proposals.md` and `input/pagecontent/walkthrough.md`.

**Incompatibility:** DTR 2.2.0 currently permits neither use, so regimen examples must be marked as proposed.

**Original IG alignment:** Partially aligned. The IG identifies regimen linkage but not both required DTR target-list changes.

- [ ] Remove any `QuestionnaireResponse.basedOn` reference to `RequestGroup`. FHIR R4 restricts `QuestionnaireResponse.basedOn` to `CarePlan` or `ServiceRequest`; use the proposed expanded DTR `qr-context` instead.

**Affected examples:** Regimen-level DTR completion examples in `input/pagecontent/walkthrough.md`.

**Incompatibility:** A profile cannot broaden the FHIR R4 base element's reference targets.

**Original IG alignment:** Misaligned where `basedOn` is used.

- [ ] Make the DTR-to-Observation transition explicit. A saved questionnaire answer does not itself create an mCODE Tumor Marker Test `Observation`; the example must identify configured SDC extraction/write-back or retain the answer only in the `QuestionnaireResponse`.

**Affected example:** HER2 sequence in `input/pagecontent/walkthrough.md`.

**Incompatibility:** The current walkthrough has the next CRD query find an Observation that no prior step creates.

**Original IG alignment:** Misaligned.

### PAS guidance and examples

- [ ] Describe the PAS regimen package as a proposed future pattern, not as current PAS 2.2.1 support. Identify the required `Claim.supportingInfo.valueReference` targets for `RequestGroup`, `PlanDefinition`, and applicable non-US-Core mCODE resources.

**Affected content:** `input/pagecontent/davinci-gap-proposals.md`.

**Incompatibility:** Current PAS targets do not permit all proposed regimen resources.

**Original IG alignment:** Partially aligned. The IG identifies a PAS gap but describes the example resources too much like current PAS content.

- [ ] Preserve the regimen as the authorization submission unit while retaining component item detail. Remove language requiring a payer to adjudicate internally at regimen scope.

**Affected content:** `input/pagecontent/davinci-gap-proposals.md` and `input/pagecontent/use-cases.md`.

**Incompatibility:** The current wording goes beyond an interoperability requirement and prescribes payer decision behavior.

**Original IG alignment:** Misaligned.

### Diagrams and cross-page consistency

- [ ] Regenerate the workflow diagrams after correcting the Mermaid sources. Diagrams should show Coverage Information, a client-offered DTR launch, and proposed regimen-level extensions consistently with the narrative.

**Affected examples:** `input/images/ogca-cds-hooks.mermaid`, `input/images/ogca-workflow.mermaid`, and their generated SVG files.

**Incompatibility:** The existing diagrams continue to teach the card-based flow even if only the narrative is corrected.

**Original IG alignment:** Misaligned.

- [ ] Correct the workflow image reference in `input/pagecontent/use-cases.md` so it points to the maintained, regenerated workflow diagram rather than the stale image name.

**Incompatibility:** The page can display an outdated diagram or fail to display the intended updated artifact.

**Original IG alignment:** Misaligned.

## Verification

- [ ] Run SUSHI and resolve all errors.
- [ ] Regenerate and visually inspect both affected SVG diagrams.
- [ ] Parse strict JSON examples and validate JSON-with-comments examples after removing comments.
- [ ] Run `git diff --check`.
- [ ] Run the full IG Publisher when `publisher.jar` is available.
