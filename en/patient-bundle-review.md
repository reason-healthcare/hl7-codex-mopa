# Patient Bundle Review - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Patient Bundle Review

### Purpose

Review the supplied Terán breast cancer patient data alongside the [breast cancer prior authorization use case](breast-cancer-pa.md). The JSON Bundle is included as an example with a Publisher-generated HTML view. It is review material; inclusion does not assert that it satisfies the MOPA data requirements or mCODE profiles.

### Open the Bundle

| | | | |
| :--- | :--- | :--- | :--- |
| Terán breast cancer — cleaned R4 | [View Bundle](Bundle-teran-breast-cancer-r4-clean.md) | [View JSON](Bundle-teran-breast-cancer-r4-clean.json.md) | [Download JSON](Bundle-teran-breast-cancer-r4-clean.json) |

The Bundle view shows the complete transaction. Use the table below to review each entry in its own resource page, with the standard IG Publisher narrative and format tabs.

### Source and Publication Handling

The supplied file is `Teran_breast_cancer_R4_clean.json`. The Patient narrative identifies **Synthea** as the generator. The Bundle contains a single Provenance entry with a recorded date of **2026-04-27** and has no top-level timestamp.

The cleaned file was selected because the other supplied Julia Terán file has identical content apart from three additional Patient identifiers. The cleaned file retains the Synthea and SMART Hospital identifiers and omits the SSN, state-issued identifier, and passport identifier. Only the cleaned Bundle is included in this guide.

The IG source copy adds only a top-level `Bundle.id` of `teran-breast-cancer-r4-clean`. All supplied fields, entry order, resource IDs, `fullUrl` values, references, and transaction requests are preserved in that copy. The Publisher generates narratives and language metadata in the rendered and downloadable artifacts. Individual resource pages show the same structured entries through the Publisher's resource templates; UUID references retain their Bundle context. The standalone Patient publication copy omits only its supplied Synthea boilerplate `text` so Publisher can generate a narrative containing demographics, identifiers, contact details, and extensions. The original Bundle retains that source narrative and its generator seeds. Resource-specific FHIR Liquid templates also show DiagnosticReport and DocumentReference metadata with decoded text attachments. The JSON and XML tabs retain the full structured content and base64 attachment data.

“Cleaned R4” is the supplied filename's label. The comparison establishes the identifier removal; it does not establish additional clinical-data cleanup or successful FHIR validation.

### Resource Inventory

The Bundle has `type = transaction`, with a `POST` request on each of its 265 entries. The counts below describe entry resources; contained resources are not counted separately.

| | |
| :--- | :--- |
| Patient | 1 |
| Condition | 1 |
| Encounter | 42 |
| Procedure | 40 |
| Immunization | 12 |
| DiagnosticReport | 42 |
| DocumentReference | 42 |
| Claim | 42 |
| ExplanationOfBenefit | 42 |
| Provenance | 1 |
| **Total** | **265** |

### Review Notes

* **Diagnosis:** The single Condition carries SNOMED CT code `254837009`, with the supplied display “Malignant neoplasm of breast (disorder)”. Its declared profile is US Core Encounter Diagnosis, rather than an mCODE primary cancer profile.
* **Oncology context:** The Bundle contains no Observation, MedicationRequest, RequestGroup, or PlanDefinition entries. Review the reports and documents alongside the [breast cancer PA data requirements](breast-cancer-pa.md) to determine which staging, biomarker, therapy, and regimen information still needs structured representation.
* **Documents:** DiagnosticReport and DocumentReference entries include encoded attachments. Use the **Read note** links in [Browse Resources](#browse-resources) to review their decoded text. Their presence alone does not establish that the required structured oncology data is present.
* **Reference dependencies:** The Patient's `managingOrganization` and `generalPractitioner` references point to Organization and Practitioner resources absent from the Bundle. Other entries also use identifier-based search references to external organizations, practitioners, and locations; transaction processing depends on the receiving server resolving them.
* **Validation:** Review the [Publisher QA report](../qa.md) with the example. Rendering a Bundle is separate from demonstrating conformance to its declared profiles or completeness for the MOPA workflow.

### Publisher Findings

The initial Publisher build reports validation errors in this supplied Bundle. The findings include unknown Synthea extensions, unresolved Practitioner and Organization references, failures to match referenced resources to their required profiles, and incorrect coding display text. For example, some DocumentReference categories use the display “Nexis Health” for the code `clinical-note`.

These findings remain visible in the [QA report](../qa.md) for review. The IG source retains the supplied data so reviewers can inspect the issues before deciding on corrections.

### Browse Resources

Select a resource description to open its rendered page. Filter by type or search by description, date, or resource ID. Entry numbers match the original Bundle order. Dates show each resource's event or record date; the Patient date is its birth date. The **Attachment** column links to readable notes decoded from the supplied base64 text.

Read note opens the decoded text of an embedded attachment. The 84 attachments contain 42 distinct notes; matching reports and document references share a note. The original FHIR resources retain their base64 data.

Find a resource

Resource type

All resource types
Patient (1)
Encounter (42)
Condition (1)
DiagnosticReport (42)
DocumentReference (42)
Claim (42)
ExplanationOfBenefit (42)
Procedure (40)
Immunization (12)
Provenance (1)

265 resources

| | | | | | |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Patient | 1942-11-30 | [Julia Julia Terán](Patient-324d4f70-205b-60cc-a081-24b98a0f139e.md) | — | [JSON](Patient-324d4f70-205b-60cc-a081-24b98a0f139e.json.md) |
| 2 | Encounter | 1985-07-25 | [Encounter for symptom (procedure)](Encounter-324d4f70-205b-60cc-58cf-1e7016b4cbfa.md) | — | [JSON](Encounter-324d4f70-205b-60cc-58cf-1e7016b4cbfa.json.md) |
| 3 | Condition | 1985-07-25 | [Malignant neoplasm of breast (disorder)](Condition-324d4f70-205b-60cc-e524-4f55fc9ea3c1.md) | — | [JSON](Condition-324d4f70-205b-60cc-e524-4f55fc9ea3c1.json.md) |
| 4 | DiagnosticReport | 1985-07-25 | [History and physical note](DiagnosticReport-bb3b3d35-1dab-d9c1-b72f-d11b97622fd3.md) | [Read note](patient-attachment-review.md#note-9284dab30ba5f964fcc11965045554eda7480bf7345140fa4bcd1272790a4d41) | [JSON](DiagnosticReport-bb3b3d35-1dab-d9c1-b72f-d11b97622fd3.json.md) |
| 5 | DocumentReference | 1985-07-25 | [History and physical note](DocumentReference-34d599b4-bd48-1345-e786-299461e74712.md) | [Read note](patient-attachment-review.md#note-9284dab30ba5f964fcc11965045554eda7480bf7345140fa4bcd1272790a4d41) | [JSON](DocumentReference-34d599b4-bd48-1345-e786-299461e74712.json.md) |
| 6 | Claim | 1985-07-27 | [professional claim](Claim-324d4f70-205b-60cc-4184-ff388bd1b344.md) | — | [JSON](Claim-324d4f70-205b-60cc-4184-ff388bd1b344.json.md) |
| 7 | ExplanationOfBenefit | 1985-07-27 | [professional explanation of benefit](ExplanationOfBenefit-d244603b-4e72-a986-37a6-64b59d75df22.md) | — | [JSON](ExplanationOfBenefit-d244603b-4e72-a986-37a6-64b59d75df22.json.md) |
| 8 | Encounter | 2017-02-20 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-2837-ffb3962d6ce2.md) | — | [JSON](Encounter-324d4f70-205b-60cc-2837-ffb3962d6ce2.json.md) |
| 9 | Procedure | 2017-02-20 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-283d-7af8bdc429cc.md) | — | [JSON](Procedure-324d4f70-205b-60cc-283d-7af8bdc429cc.json.md) |
| 10 | DiagnosticReport | 2017-02-20 | [History and physical note](DiagnosticReport-803be58e-714f-100b-66b5-9be4834b049f.md) | [Read note](patient-attachment-review.md#note-405b0d8c3870b2c6ac4f2c1c2cc2353bee55f2facbeebcc1c8742eafb25210de) | [JSON](DiagnosticReport-803be58e-714f-100b-66b5-9be4834b049f.json.md) |
| 11 | DocumentReference | 2017-02-20 | [History and physical note](DocumentReference-5363ba6c-37e7-603c-3308-59a0059a10cc.md) | [Read note](patient-attachment-review.md#note-405b0d8c3870b2c6ac4f2c1c2cc2353bee55f2facbeebcc1c8742eafb25210de) | [JSON](DocumentReference-5363ba6c-37e7-603c-3308-59a0059a10cc.json.md) |
| 12 | Claim | 2017-02-20 | [professional claim](Claim-324d4f70-205b-60cc-d5dd-8d9526fc9cac.md) | — | [JSON](Claim-324d4f70-205b-60cc-d5dd-8d9526fc9cac.json.md) |
| 13 | ExplanationOfBenefit | 2017-02-20 | [professional explanation of benefit](ExplanationOfBenefit-8ba2a788-d4ff-1383-613e-0ceca977f286.md) | — | [JSON](ExplanationOfBenefit-8ba2a788-d4ff-1383-613e-0ceca977f286.json.md) |
| 14 | Encounter | 2017-02-20 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-5b10-efa5a0f8e7b4.md) | — | [JSON](Encounter-324d4f70-205b-60cc-5b10-efa5a0f8e7b4.json.md) |
| 15 | Procedure | 2017-02-20 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-5da8-7e4d633e3065.md) | — | [JSON](Procedure-324d4f70-205b-60cc-5da8-7e4d633e3065.json.md) |
| 16 | DiagnosticReport | 2017-02-20 | [History and physical note](DiagnosticReport-7d406308-ccf7-eb57-01bf-602dc69658ed.md) | [Read note](patient-attachment-review.md#note-298c3a5ceadcf449e0ed0e2c52ef8b9379e35d2fd63d0557fbfa7e549080ff31) | [JSON](DiagnosticReport-7d406308-ccf7-eb57-01bf-602dc69658ed.json.md) |
| 17 | DocumentReference | 2017-02-20 | [History and physical note](DocumentReference-6bcd79b4-f9d1-1e02-5f3a-25d8f1ba45cf.md) | [Read note](patient-attachment-review.md#note-298c3a5ceadcf449e0ed0e2c52ef8b9379e35d2fd63d0557fbfa7e549080ff31) | [JSON](DocumentReference-6bcd79b4-f9d1-1e02-5f3a-25d8f1ba45cf.json.md) |
| 18 | Claim | 2017-02-20 | [professional claim](Claim-324d4f70-205b-60cc-eb4a-3f746aca7988.md) | — | [JSON](Claim-324d4f70-205b-60cc-eb4a-3f746aca7988.json.md) |
| 19 | ExplanationOfBenefit | 2017-02-20 | [professional explanation of benefit](ExplanationOfBenefit-e68112fe-e224-d464-532d-8d8e084dff18.md) | — | [JSON](ExplanationOfBenefit-e68112fe-e224-d464-532d-8d8e084dff18.json.md) |
| 20 | Encounter | 2017-02-20 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-7e2e-dd08e1c087a0.md) | — | [JSON](Encounter-324d4f70-205b-60cc-7e2e-dd08e1c087a0.json.md) |
| 21 | Procedure | 2017-02-20 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-7c2d-4382d3c52063.md) | — | [JSON](Procedure-324d4f70-205b-60cc-7c2d-4382d3c52063.json.md) |
| 22 | Procedure | 2017-02-20 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-d349-8836c48ba066.md) | — | [JSON](Procedure-324d4f70-205b-60cc-d349-8836c48ba066.json.md) |
| 23 | DiagnosticReport | 2017-02-20 | [History and physical note](DiagnosticReport-b6c039db-34f7-ef6a-3b3f-37002e965d00.md) | [Read note](patient-attachment-review.md#note-389b98507e9d48468d98500ed0e78ca895906a9b4f5fbad6b46df5aa876eddb3) | [JSON](DiagnosticReport-b6c039db-34f7-ef6a-3b3f-37002e965d00.json.md) |
| 24 | DocumentReference | 2017-02-20 | [History and physical note](DocumentReference-6b9d04bc-f887-b142-5f09-b0e0f070d90f.md) | [Read note](patient-attachment-review.md#note-389b98507e9d48468d98500ed0e78ca895906a9b4f5fbad6b46df5aa876eddb3) | [JSON](DocumentReference-6b9d04bc-f887-b142-5f09-b0e0f070d90f.json.md) |
| 25 | Claim | 2017-02-20 | [professional claim](Claim-324d4f70-205b-60cc-c1ba-e935897de7ef.md) | — | [JSON](Claim-324d4f70-205b-60cc-c1ba-e935897de7ef.json.md) |
| 26 | ExplanationOfBenefit | 2017-02-20 | [professional explanation of benefit](ExplanationOfBenefit-d5a38635-1611-9360-f3f9-1d96fceaec55.md) | — | [JSON](ExplanationOfBenefit-d5a38635-1611-9360-f3f9-1d96fceaec55.json.md) |
| 27 | Encounter | 2017-04-17 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-6ea5-936285139eb8.md) | — | [JSON](Encounter-324d4f70-205b-60cc-6ea5-936285139eb8.json.md) |
| 28 | Immunization | 2017-04-17 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-16ae-241e134b0576.md) | — | [JSON](Immunization-324d4f70-205b-60cc-16ae-241e134b0576.json.md) |
| 29 | DiagnosticReport | 2017-04-17 | [History and physical note](DiagnosticReport-0b9dfc64-4d1b-44dc-7339-61c56cda8e1a.md) | [Read note](patient-attachment-review.md#note-87fa0b46e554ee677386f5877af571459b1790ed6d787555c4bc13b0a3229830) | [JSON](DiagnosticReport-0b9dfc64-4d1b-44dc-7339-61c56cda8e1a.json.md) |
| 30 | DocumentReference | 2017-04-17 | [History and physical note](DocumentReference-885cc705-823a-3826-82a6-ba425d654124.md) | [Read note](patient-attachment-review.md#note-87fa0b46e554ee677386f5877af571459b1790ed6d787555c4bc13b0a3229830) | [JSON](DocumentReference-885cc705-823a-3826-82a6-ba425d654124.json.md) |
| 31 | Claim | 2017-04-17 | [professional claim](Claim-324d4f70-205b-60cc-36ed-00f83f2202f1.md) | — | [JSON](Claim-324d4f70-205b-60cc-36ed-00f83f2202f1.json.md) |
| 32 | ExplanationOfBenefit | 2017-04-17 | [professional explanation of benefit](ExplanationOfBenefit-7827663b-151e-c74e-4d71-1994cb7504ba.md) | — | [JSON](ExplanationOfBenefit-7827663b-151e-c74e-4d71-1994cb7504ba.json.md) |
| 33 | Encounter | 2018-03-05 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-6a71-2ed4bfa14ce0.md) | — | [JSON](Encounter-324d4f70-205b-60cc-6a71-2ed4bfa14ce0.json.md) |
| 34 | Procedure | 2018-03-05 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-58ec-40d72349ab5a.md) | — | [JSON](Procedure-324d4f70-205b-60cc-58ec-40d72349ab5a.json.md) |
| 35 | DiagnosticReport | 2018-03-05 | [History and physical note](DiagnosticReport-ad805677-99bb-7506-0ea0-15c0d823106c.md) | [Read note](patient-attachment-review.md#note-d2555ff7e78233df842c47144aa8b8f3017eb246527cf4ee2c288652b94b12a3) | [JSON](DiagnosticReport-ad805677-99bb-7506-0ea0-15c0d823106c.json.md) |
| 36 | DocumentReference | 2018-03-05 | [History and physical note](DocumentReference-770a1131-8061-f2b4-b3e5-3c3a7e5c3ca7.md) | [Read note](patient-attachment-review.md#note-d2555ff7e78233df842c47144aa8b8f3017eb246527cf4ee2c288652b94b12a3) | [JSON](DocumentReference-770a1131-8061-f2b4-b3e5-3c3a7e5c3ca7.json.md) |
| 37 | Claim | 2018-03-05 | [professional claim](Claim-324d4f70-205b-60cc-1de8-a9cbc4e0036a.md) | — | [JSON](Claim-324d4f70-205b-60cc-1de8-a9cbc4e0036a.json.md) |
| 38 | ExplanationOfBenefit | 2018-03-05 | [professional explanation of benefit](ExplanationOfBenefit-0d603019-569c-3dfd-bf52-0782656f0baf.md) | — | [JSON](ExplanationOfBenefit-0d603019-569c-3dfd-bf52-0782656f0baf.json.md) |
| 39 | Encounter | 2018-03-05 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-0db7-b058ebf14b84.md) | — | [JSON](Encounter-324d4f70-205b-60cc-0db7-b058ebf14b84.json.md) |
| 40 | Procedure | 2018-03-05 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-2538-a83ef5b75ab1.md) | — | [JSON](Procedure-324d4f70-205b-60cc-2538-a83ef5b75ab1.json.md) |
| 41 | DiagnosticReport | 2018-03-05 | [History and physical note](DiagnosticReport-18d9193e-e891-43e5-7fb2-7186d863937f.md) | [Read note](patient-attachment-review.md#note-d8ffb045593db07ec52407447dc61ad932b99ec3a3b943c62dc700ca45e13a6e) | [JSON](DiagnosticReport-18d9193e-e891-43e5-7fb2-7186d863937f.json.md) |
| 42 | DocumentReference | 2018-03-05 | [History and physical note](DocumentReference-1798d623-ba95-06b0-aa15-a55a8557462e.md) | [Read note](patient-attachment-review.md#note-d8ffb045593db07ec52407447dc61ad932b99ec3a3b943c62dc700ca45e13a6e) | [JSON](DocumentReference-1798d623-ba95-06b0-aa15-a55a8557462e.json.md) |
| 43 | Claim | 2018-03-05 | [professional claim](Claim-324d4f70-205b-60cc-f220-dd931dfdd2e5.md) | — | [JSON](Claim-324d4f70-205b-60cc-f220-dd931dfdd2e5.json.md) |
| 44 | ExplanationOfBenefit | 2018-03-05 | [professional explanation of benefit](ExplanationOfBenefit-0fc51de2-2205-cd09-2ee2-96d4adb2a834.md) | — | [JSON](ExplanationOfBenefit-0fc51de2-2205-cd09-2ee2-96d4adb2a834.json.md) |
| 45 | Encounter | 2018-03-05 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-af17-52591ce4bfab.md) | — | [JSON](Encounter-324d4f70-205b-60cc-af17-52591ce4bfab.json.md) |
| 46 | Procedure | 2018-03-05 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-5c6d-fa71b7a30f38.md) | — | [JSON](Procedure-324d4f70-205b-60cc-5c6d-fa71b7a30f38.json.md) |
| 47 | Procedure | 2018-03-05 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-4ef6-22f142d7d336.md) | — | [JSON](Procedure-324d4f70-205b-60cc-4ef6-22f142d7d336.json.md) |
| 48 | DiagnosticReport | 2018-03-05 | [History and physical note](DiagnosticReport-9ea36e5b-716f-7dc8-5dec-acc30cd4dee8.md) | [Read note](patient-attachment-review.md#note-bae6050640ff447b87866d058206c78abe446f3d3d8b2a75899a18c52c7965c7) | [JSON](DiagnosticReport-9ea36e5b-716f-7dc8-5dec-acc30cd4dee8.json.md) |
| 49 | DocumentReference | 2018-03-05 | [History and physical note](DocumentReference-aeb002a3-5159-8657-d9b9-009d9b4cc332.md) | [Read note](patient-attachment-review.md#note-bae6050640ff447b87866d058206c78abe446f3d3d8b2a75899a18c52c7965c7) | [JSON](DocumentReference-aeb002a3-5159-8657-d9b9-009d9b4cc332.json.md) |
| 50 | Claim | 2018-03-05 | [professional claim](Claim-324d4f70-205b-60cc-715e-56f83a1bf839.md) | — | [JSON](Claim-324d4f70-205b-60cc-715e-56f83a1bf839.json.md) |
| 51 | ExplanationOfBenefit | 2018-03-05 | [professional explanation of benefit](ExplanationOfBenefit-477e74d5-4c1b-7c04-85b9-68940575325a.md) | — | [JSON](ExplanationOfBenefit-477e74d5-4c1b-7c04-85b9-68940575325a.json.md) |
| 52 | Encounter | 2018-04-23 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-9843-105155e736bb.md) | — | [JSON](Encounter-324d4f70-205b-60cc-9843-105155e736bb.json.md) |
| 53 | Immunization | 2018-04-23 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-8d2d-8f7aecfab0af.md) | — | [JSON](Immunization-324d4f70-205b-60cc-8d2d-8f7aecfab0af.json.md) |
| 54 | DiagnosticReport | 2018-04-23 | [History and physical note](DiagnosticReport-810f2d9d-89f3-1988-1b76-06f5d1e2ebd8.md) | [Read note](patient-attachment-review.md#note-1ca0834091b82f65f82055293fa659953715f42d200cc1423ce01318a96c6881) | [JSON](DiagnosticReport-810f2d9d-89f3-1988-1b76-06f5d1e2ebd8.json.md) |
| 55 | DocumentReference | 2018-04-23 | [History and physical note](DocumentReference-0459bdb5-def8-b1d7-82ec-3a8515c37416.md) | [Read note](patient-attachment-review.md#note-1ca0834091b82f65f82055293fa659953715f42d200cc1423ce01318a96c6881) | [JSON](DocumentReference-0459bdb5-def8-b1d7-82ec-3a8515c37416.json.md) |
| 56 | Claim | 2018-04-23 | [professional claim](Claim-324d4f70-205b-60cc-5a82-eca43b90700e.md) | — | [JSON](Claim-324d4f70-205b-60cc-5a82-eca43b90700e.json.md) |
| 57 | ExplanationOfBenefit | 2018-04-23 | [professional explanation of benefit](ExplanationOfBenefit-5c061728-5ba7-2c80-75b2-f2537ad4809a.md) | — | [JSON](ExplanationOfBenefit-5c061728-5ba7-2c80-75b2-f2537ad4809a.json.md) |
| 58 | Encounter | 2019-03-17 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-65ac-50e059411094.md) | — | [JSON](Encounter-324d4f70-205b-60cc-65ac-50e059411094.json.md) |
| 59 | Procedure | 2019-03-17 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-5a2f-e1a6ea69a91a.md) | — | [JSON](Procedure-324d4f70-205b-60cc-5a2f-e1a6ea69a91a.json.md) |
| 60 | DiagnosticReport | 2019-03-17 | [History and physical note](DiagnosticReport-9d3d7489-9293-423a-5393-8685872728b4.md) | [Read note](patient-attachment-review.md#note-0d598c6eb763044e311a0e741a446640e4a8bee47b26f7d0a4de5b4bb4c4d1b0) | [JSON](DiagnosticReport-9d3d7489-9293-423a-5393-8685872728b4.json.md) |
| 61 | DocumentReference | 2019-03-17 | [History and physical note](DocumentReference-f87c4036-8850-2777-97b0-0de938e0071c.md) | [Read note](patient-attachment-review.md#note-0d598c6eb763044e311a0e741a446640e4a8bee47b26f7d0a4de5b4bb4c4d1b0) | [JSON](DocumentReference-f87c4036-8850-2777-97b0-0de938e0071c.json.md) |
| 62 | Claim | 2019-03-17 | [professional claim](Claim-324d4f70-205b-60cc-80fd-fb51401f0e6b.md) | — | [JSON](Claim-324d4f70-205b-60cc-80fd-fb51401f0e6b.json.md) |
| 63 | ExplanationOfBenefit | 2019-03-17 | [professional explanation of benefit](ExplanationOfBenefit-71769078-6471-2b8c-d6da-8352d4374127.md) | — | [JSON](ExplanationOfBenefit-71769078-6471-2b8c-d6da-8352d4374127.json.md) |
| 64 | Encounter | 2019-03-17 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-e748-241d7cdbbddd.md) | — | [JSON](Encounter-324d4f70-205b-60cc-e748-241d7cdbbddd.json.md) |
| 65 | Procedure | 2019-03-17 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-c1d4-7b24da488762.md) | — | [JSON](Procedure-324d4f70-205b-60cc-c1d4-7b24da488762.json.md) |
| 66 | DiagnosticReport | 2019-03-17 | [History and physical note](DiagnosticReport-0579b0c9-385b-3c39-b609-906dd78f09eb.md) | [Read note](patient-attachment-review.md#note-b9f317a50ebd26068cb7f9aa5e9cb0cbeec96b0dc41ed6a1daa1f95f4bb0ccc9) | [JSON](DiagnosticReport-0579b0c9-385b-3c39-b609-906dd78f09eb.json.md) |
| 67 | DocumentReference | 2019-03-17 | [History and physical note](DocumentReference-388fced2-345d-64b6-defd-6456b35a89af.md) | [Read note](patient-attachment-review.md#note-b9f317a50ebd26068cb7f9aa5e9cb0cbeec96b0dc41ed6a1daa1f95f4bb0ccc9) | [JSON](DocumentReference-388fced2-345d-64b6-defd-6456b35a89af.json.md) |
| 68 | Claim | 2019-03-17 | [professional claim](Claim-324d4f70-205b-60cc-500d-52c21db4e8d4.md) | — | [JSON](Claim-324d4f70-205b-60cc-500d-52c21db4e8d4.json.md) |
| 69 | ExplanationOfBenefit | 2019-03-17 | [professional explanation of benefit](ExplanationOfBenefit-1a3b3eb0-d10e-5688-c572-0978b6c3ac7c.md) | — | [JSON](ExplanationOfBenefit-1a3b3eb0-d10e-5688-c572-0978b6c3ac7c.json.md) |
| 70 | Encounter | 2019-03-17 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-4add-381d14c5ddf7.md) | — | [JSON](Encounter-324d4f70-205b-60cc-4add-381d14c5ddf7.json.md) |
| 71 | Procedure | 2019-03-17 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-5756-faa9406416fb.md) | — | [JSON](Procedure-324d4f70-205b-60cc-5756-faa9406416fb.json.md) |
| 72 | Procedure | 2019-03-17 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-1962-0ea00b3cda63.md) | — | [JSON](Procedure-324d4f70-205b-60cc-1962-0ea00b3cda63.json.md) |
| 73 | DiagnosticReport | 2019-03-17 | [History and physical note](DiagnosticReport-40679c3d-3c07-c049-0d5b-08e95fffa971.md) | [Read note](patient-attachment-review.md#note-fbb3e1a42e29296f707fbd774cbfb466de07158cef6a0ae344da296515e79218) | [JSON](DiagnosticReport-40679c3d-3c07-c049-0d5b-08e95fffa971.json.md) |
| 74 | DocumentReference | 2019-03-17 | [History and physical note](DocumentReference-f3c906d9-6f23-c217-b312-45410a892337.md) | [Read note](patient-attachment-review.md#note-fbb3e1a42e29296f707fbd774cbfb466de07158cef6a0ae344da296515e79218) | [JSON](DocumentReference-f3c906d9-6f23-c217-b312-45410a892337.json.md) |
| 75 | Claim | 2019-03-17 | [professional claim](Claim-324d4f70-205b-60cc-c292-39c3b263355c.md) | — | [JSON](Claim-324d4f70-205b-60cc-c292-39c3b263355c.json.md) |
| 76 | ExplanationOfBenefit | 2019-03-17 | [professional explanation of benefit](ExplanationOfBenefit-35e21a02-69ae-8a8c-0394-cbfbd713f5d7.md) | — | [JSON](ExplanationOfBenefit-35e21a02-69ae-8a8c-0394-cbfbd713f5d7.json.md) |
| 77 | Encounter | 2019-04-29 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-1179-6df0b91f7525.md) | — | [JSON](Encounter-324d4f70-205b-60cc-1179-6df0b91f7525.json.md) |
| 78 | Immunization | 2019-04-29 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-55c4-fdc38b673678.md) | — | [JSON](Immunization-324d4f70-205b-60cc-55c4-fdc38b673678.json.md) |
| 79 | DiagnosticReport | 2019-04-29 | [History and physical note](DiagnosticReport-6cb2b349-d7d7-f3e1-1151-e7178a8883c1.md) | [Read note](patient-attachment-review.md#note-fdf1c942c36f54cc0fd394dc57c66d84ffedc148fa480f3b81f9811c91d3c848) | [JSON](DiagnosticReport-6cb2b349-d7d7-f3e1-1151-e7178a8883c1.json.md) |
| 80 | DocumentReference | 2019-04-29 | [History and physical note](DocumentReference-fa4de280-88f7-e2d3-7ecc-dfa582965069.md) | [Read note](patient-attachment-review.md#note-fdf1c942c36f54cc0fd394dc57c66d84ffedc148fa480f3b81f9811c91d3c848) | [JSON](DocumentReference-fa4de280-88f7-e2d3-7ecc-dfa582965069.json.md) |
| 81 | Claim | 2019-04-29 | [professional claim](Claim-324d4f70-205b-60cc-f07b-ca9c0d01152d.md) | — | [JSON](Claim-324d4f70-205b-60cc-f07b-ca9c0d01152d.json.md) |
| 82 | ExplanationOfBenefit | 2019-04-29 | [professional explanation of benefit](ExplanationOfBenefit-b3f7ffc6-850d-66e9-60ce-6d5c14dfc5b1.md) | — | [JSON](ExplanationOfBenefit-b3f7ffc6-850d-66e9-60ce-6d5c14dfc5b1.json.md) |
| 83 | Encounter | 2020-03-27 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-d603-07e52baa590b.md) | — | [JSON](Encounter-324d4f70-205b-60cc-d603-07e52baa590b.json.md) |
| 84 | Procedure | 2020-03-27 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-fd9c-53747ed763c3.md) | — | [JSON](Procedure-324d4f70-205b-60cc-fd9c-53747ed763c3.json.md) |
| 85 | DiagnosticReport | 2020-03-27 | [History and physical note](DiagnosticReport-c61ed03c-4e13-3cc7-1c30-cc30e1f9b67e.md) | [Read note](patient-attachment-review.md#note-24eb77182559bead29021486d224a65e8509f12a17cb45001f0179241f5fa15c) | [JSON](DiagnosticReport-c61ed03c-4e13-3cc7-1c30-cc30e1f9b67e.json.md) |
| 86 | DocumentReference | 2020-03-27 | [History and physical note](DocumentReference-044ec3a5-ac5c-c5cf-381c-76563c3c6a6e.md) | [Read note](patient-attachment-review.md#note-24eb77182559bead29021486d224a65e8509f12a17cb45001f0179241f5fa15c) | [JSON](DocumentReference-044ec3a5-ac5c-c5cf-381c-76563c3c6a6e.json.md) |
| 87 | Claim | 2020-03-27 | [professional claim](Claim-324d4f70-205b-60cc-8cfc-844c633f72f8.md) | — | [JSON](Claim-324d4f70-205b-60cc-8cfc-844c633f72f8.json.md) |
| 88 | ExplanationOfBenefit | 2020-03-27 | [professional explanation of benefit](ExplanationOfBenefit-683c151d-e1d3-4aa7-8895-cb7421f30547.md) | — | [JSON](ExplanationOfBenefit-683c151d-e1d3-4aa7-8895-cb7421f30547.json.md) |
| 89 | Encounter | 2020-03-27 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-8033-ba5bdb4eee1c.md) | — | [JSON](Encounter-324d4f70-205b-60cc-8033-ba5bdb4eee1c.json.md) |
| 90 | Procedure | 2020-03-27 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-d22e-a00332260b6a.md) | — | [JSON](Procedure-324d4f70-205b-60cc-d22e-a00332260b6a.json.md) |
| 91 | DiagnosticReport | 2020-03-27 | [History and physical note](DiagnosticReport-1a43cff7-7a5b-4319-e97a-9ab9b9d9d595.md) | [Read note](patient-attachment-review.md#note-bda8b5bebb64570522475fffdd2b2a576174db233592b46d96cb873490f3bcb4) | [JSON](DiagnosticReport-1a43cff7-7a5b-4319-e97a-9ab9b9d9d595.json.md) |
| 92 | DocumentReference | 2020-03-27 | [History and physical note](DocumentReference-3684963b-420d-3f4e-2b18-7cb4f863514a.md) | [Read note](patient-attachment-review.md#note-bda8b5bebb64570522475fffdd2b2a576174db233592b46d96cb873490f3bcb4) | [JSON](DocumentReference-3684963b-420d-3f4e-2b18-7cb4f863514a.json.md) |
| 93 | Claim | 2020-03-27 | [professional claim](Claim-324d4f70-205b-60cc-7fda-a04a956dcc4e.md) | — | [JSON](Claim-324d4f70-205b-60cc-7fda-a04a956dcc4e.json.md) |
| 94 | ExplanationOfBenefit | 2020-03-27 | [professional explanation of benefit](ExplanationOfBenefit-dccd6cab-3a1d-9dad-dabe-d33607d04fae.md) | — | [JSON](ExplanationOfBenefit-dccd6cab-3a1d-9dad-dabe-d33607d04fae.json.md) |
| 95 | Encounter | 2020-03-27 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-d01e-01c162d00a1e.md) | — | [JSON](Encounter-324d4f70-205b-60cc-d01e-01c162d00a1e.json.md) |
| 96 | Procedure | 2020-03-27 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-f192-9af1d1042e24.md) | — | [JSON](Procedure-324d4f70-205b-60cc-f192-9af1d1042e24.json.md) |
| 97 | Procedure | 2020-03-27 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-a901-56495c7d7915.md) | — | [JSON](Procedure-324d4f70-205b-60cc-a901-56495c7d7915.json.md) |
| 98 | DiagnosticReport | 2020-03-27 | [History and physical note](DiagnosticReport-664240c3-5ece-5799-01a7-a1e31e179601.md) | [Read note](patient-attachment-review.md#note-672ec73d20f7aa0baccafada17cfd1557766621ff2c8e9f45123e0510a279c0a) | [JSON](DiagnosticReport-664240c3-5ece-5799-01a7-a1e31e179601.json.md) |
| 99 | DocumentReference | 2020-03-27 | [History and physical note](DocumentReference-a8a3868e-2470-68a4-f296-c3694f79669e.md) | [Read note](patient-attachment-review.md#note-672ec73d20f7aa0baccafada17cfd1557766621ff2c8e9f45123e0510a279c0a) | [JSON](DocumentReference-a8a3868e-2470-68a4-f296-c3694f79669e.json.md) |
| 100 | Claim | 2020-03-27 | [professional claim](Claim-324d4f70-205b-60cc-e24f-0300820f0d4b.md) | — | [JSON](Claim-324d4f70-205b-60cc-e24f-0300820f0d4b.json.md) |
| 101 | ExplanationOfBenefit | 2020-03-27 | [professional explanation of benefit](ExplanationOfBenefit-9d1d80e4-2e12-b01e-32ad-88d435ca0e8c.md) | — | [JSON](ExplanationOfBenefit-9d1d80e4-2e12-b01e-32ad-88d435ca0e8c.json.md) |
| 102 | Encounter | 2020-05-04 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-da21-a0ada8fdccaf.md) | — | [JSON](Encounter-324d4f70-205b-60cc-da21-a0ada8fdccaf.json.md) |
| 103 | Immunization | 2020-05-04 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-ab2b-7e1872e256ad.md) | — | [JSON](Immunization-324d4f70-205b-60cc-ab2b-7e1872e256ad.json.md) |
| 104 | DiagnosticReport | 2020-05-04 | [History and physical note](DiagnosticReport-303bebd6-0fd2-1c3d-16b5-a22c21ce10d1.md) | [Read note](patient-attachment-review.md#note-4fb6648a5f5eb9e4be947e4523c9d09a8690d9de38ff7db5fcd6ec60f55c5a95) | [JSON](DiagnosticReport-303bebd6-0fd2-1c3d-16b5-a22c21ce10d1.json.md) |
| 105 | DocumentReference | 2020-05-04 | [History and physical note](DocumentReference-6bc547ec-3734-e642-4b69-e72004e796d2.md) | [Read note](patient-attachment-review.md#note-4fb6648a5f5eb9e4be947e4523c9d09a8690d9de38ff7db5fcd6ec60f55c5a95) | [JSON](DocumentReference-6bc547ec-3734-e642-4b69-e72004e796d2.json.md) |
| 106 | Claim | 2020-05-04 | [professional claim](Claim-324d4f70-205b-60cc-324c-f8d35cb030be.md) | — | [JSON](Claim-324d4f70-205b-60cc-324c-f8d35cb030be.json.md) |
| 107 | ExplanationOfBenefit | 2020-05-04 | [professional explanation of benefit](ExplanationOfBenefit-5e57b3dd-42f7-a8f5-3982-d3f969fc42a2.md) | — | [JSON](ExplanationOfBenefit-5e57b3dd-42f7-a8f5-3982-d3f969fc42a2.json.md) |
| 108 | Encounter | 2021-02-22 | [Administration of vaccine to produce active immunity (procedure)](Encounter-324d4f70-205b-60cc-fea4-d040f20925df.md) | — | [JSON](Encounter-324d4f70-205b-60cc-fea4-d040f20925df.json.md) |
| 109 | Immunization | 2021-02-22 | [COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5mL dose or 50 mcg/0.25mL dose](Immunization-324d4f70-205b-60cc-9034-26ba188a4c3a.md) | — | [JSON](Immunization-324d4f70-205b-60cc-9034-26ba188a4c3a.json.md) |
| 110 | DiagnosticReport | 2021-02-22 | [History and physical note](DiagnosticReport-8f8a214c-6c3b-71c8-a186-15e052b5281e.md) | [Read note](patient-attachment-review.md#note-ac3757e117a3ba0554b665aff6e287135a2f40c5275371fc101918b006683193) | [JSON](DiagnosticReport-8f8a214c-6c3b-71c8-a186-15e052b5281e.json.md) |
| 111 | DocumentReference | 2021-02-22 | [History and physical note](DocumentReference-32d39940-2bed-c1cc-0086-49d00b926100.md) | [Read note](patient-attachment-review.md#note-ac3757e117a3ba0554b665aff6e287135a2f40c5275371fc101918b006683193) | [JSON](DocumentReference-32d39940-2bed-c1cc-0086-49d00b926100.json.md) |
| 112 | Claim | 2021-02-22 | [professional claim](Claim-324d4f70-205b-60cc-51b7-9b21c65312d1.md) | — | [JSON](Claim-324d4f70-205b-60cc-51b7-9b21c65312d1.json.md) |
| 113 | ExplanationOfBenefit | 2021-02-22 | [professional explanation of benefit](ExplanationOfBenefit-385fb839-1925-0168-27ec-96a6aeb53ecc.md) | — | [JSON](ExplanationOfBenefit-385fb839-1925-0168-27ec-96a6aeb53ecc.json.md) |
| 114 | Encounter | 2021-03-01 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-5ff8-97b1f4eef88d.md) | — | [JSON](Encounter-324d4f70-205b-60cc-5ff8-97b1f4eef88d.json.md) |
| 115 | Procedure | 2021-03-01 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-bb2c-7c63f78b79f2.md) | — | [JSON](Procedure-324d4f70-205b-60cc-bb2c-7c63f78b79f2.json.md) |
| 116 | DiagnosticReport | 2021-03-01 | [History and physical note](DiagnosticReport-3080623e-0093-d6f4-d6ed-f7c27f90fbed.md) | [Read note](patient-attachment-review.md#note-473b032cfb1edd6e01de8efc36556ad2526994adf1b7925494af4ae013111790) | [JSON](DiagnosticReport-3080623e-0093-d6f4-d6ed-f7c27f90fbed.json.md) |
| 117 | DocumentReference | 2021-03-01 | [History and physical note](DocumentReference-578f3c65-a224-08fb-40b7-09590ed02cf3.md) | [Read note](patient-attachment-review.md#note-473b032cfb1edd6e01de8efc36556ad2526994adf1b7925494af4ae013111790) | [JSON](DocumentReference-578f3c65-a224-08fb-40b7-09590ed02cf3.json.md) |
| 118 | Claim | 2021-03-01 | [professional claim](Claim-324d4f70-205b-60cc-c25a-cd7373ad0288.md) | — | [JSON](Claim-324d4f70-205b-60cc-c25a-cd7373ad0288.json.md) |
| 119 | ExplanationOfBenefit | 2021-03-01 | [professional explanation of benefit](ExplanationOfBenefit-ebff37a8-a34e-2f8a-f3cf-20d1461be23c.md) | — | [JSON](ExplanationOfBenefit-ebff37a8-a34e-2f8a-f3cf-20d1461be23c.json.md) |
| 120 | Encounter | 2021-03-01 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-2692-72c2133050cf.md) | — | [JSON](Encounter-324d4f70-205b-60cc-2692-72c2133050cf.json.md) |
| 121 | Procedure | 2021-03-01 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-3e41-e5b04e10d69c.md) | — | [JSON](Procedure-324d4f70-205b-60cc-3e41-e5b04e10d69c.json.md) |
| 122 | DiagnosticReport | 2021-03-01 | [History and physical note](DiagnosticReport-24fd9372-65b4-201d-7497-fa4bbdfc0fef.md) | [Read note](patient-attachment-review.md#note-8fff567ca9e2b0c965043bce05c5a4e8e4683dbdea7eb71f17344cf3690eb21d) | [JSON](DiagnosticReport-24fd9372-65b4-201d-7497-fa4bbdfc0fef.json.md) |
| 123 | DocumentReference | 2021-03-01 | [History and physical note](DocumentReference-406c76a1-9630-be4b-7feb-091e6567890d.md) | [Read note](patient-attachment-review.md#note-8fff567ca9e2b0c965043bce05c5a4e8e4683dbdea7eb71f17344cf3690eb21d) | [JSON](DocumentReference-406c76a1-9630-be4b-7feb-091e6567890d.json.md) |
| 124 | Claim | 2021-03-01 | [professional claim](Claim-324d4f70-205b-60cc-9472-8c7c3d2e45ab.md) | — | [JSON](Claim-324d4f70-205b-60cc-9472-8c7c3d2e45ab.json.md) |
| 125 | ExplanationOfBenefit | 2021-03-01 | [professional explanation of benefit](ExplanationOfBenefit-ddffdf72-76cb-6956-5b00-913323a69477.md) | — | [JSON](ExplanationOfBenefit-ddffdf72-76cb-6956-5b00-913323a69477.json.md) |
| 126 | Encounter | 2021-03-01 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-1b84-c52fb680231c.md) | — | [JSON](Encounter-324d4f70-205b-60cc-1b84-c52fb680231c.json.md) |
| 127 | Procedure | 2021-03-01 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-cc9b-9a8dac0bf429.md) | — | [JSON](Procedure-324d4f70-205b-60cc-cc9b-9a8dac0bf429.json.md) |
| 128 | Procedure | 2021-03-01 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-6608-11e9eb72b9ce.md) | — | [JSON](Procedure-324d4f70-205b-60cc-6608-11e9eb72b9ce.json.md) |
| 129 | DiagnosticReport | 2021-03-01 | [History and physical note](DiagnosticReport-1e448c14-029c-8999-97fa-e225fe911d7f.md) | [Read note](patient-attachment-review.md#note-54e6ab8978e6f3b6d04d45b1f12ad69c30e7a88cf53f2eaf00ffa5ad4325b759) | [JSON](DiagnosticReport-1e448c14-029c-8999-97fa-e225fe911d7f.json.md) |
| 130 | DocumentReference | 2021-03-01 | [History and physical note](DocumentReference-c7ab3348-9f86-63ef-6c4a-67165236f3cf.md) | [Read note](patient-attachment-review.md#note-54e6ab8978e6f3b6d04d45b1f12ad69c30e7a88cf53f2eaf00ffa5ad4325b759) | [JSON](DocumentReference-c7ab3348-9f86-63ef-6c4a-67165236f3cf.json.md) |
| 131 | Claim | 2021-03-01 | [professional claim](Claim-324d4f70-205b-60cc-4d78-41a6e431eb81.md) | — | [JSON](Claim-324d4f70-205b-60cc-4d78-41a6e431eb81.json.md) |
| 132 | ExplanationOfBenefit | 2021-03-01 | [professional explanation of benefit](ExplanationOfBenefit-0023164a-4998-e288-0fc3-5a02cf3447ec.md) | — | [JSON](ExplanationOfBenefit-0023164a-4998-e288-0fc3-5a02cf3447ec.json.md) |
| 133 | Encounter | 2021-03-22 | [Administration of vaccine to produce active immunity (procedure)](Encounter-324d4f70-205b-60cc-3b24-763d02e12997.md) | — | [JSON](Encounter-324d4f70-205b-60cc-3b24-763d02e12997.json.md) |
| 134 | Immunization | 2021-03-22 | [COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5mL dose or 50 mcg/0.25mL dose](Immunization-324d4f70-205b-60cc-9db2-3e01b33a24dd.md) | — | [JSON](Immunization-324d4f70-205b-60cc-9db2-3e01b33a24dd.json.md) |
| 135 | DiagnosticReport | 2021-03-22 | [History and physical note](DiagnosticReport-810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb.md) | [Read note](patient-attachment-review.md#note-b1d4a899eb9ebfbde6775497adcd55d3b97b267d9ad2a3bf14e7f43df1866eb3) | [JSON](DiagnosticReport-810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb.json.md) |
| 136 | DocumentReference | 2021-03-22 | [History and physical note](DocumentReference-cd6155b5-ddf2-3ae6-4bf3-d28514bcfd26.md) | [Read note](patient-attachment-review.md#note-b1d4a899eb9ebfbde6775497adcd55d3b97b267d9ad2a3bf14e7f43df1866eb3) | [JSON](DocumentReference-cd6155b5-ddf2-3ae6-4bf3-d28514bcfd26.json.md) |
| 137 | Claim | 2021-03-22 | [professional claim](Claim-324d4f70-205b-60cc-5d84-12f20bffd1a0.md) | — | [JSON](Claim-324d4f70-205b-60cc-5d84-12f20bffd1a0.json.md) |
| 138 | ExplanationOfBenefit | 2021-03-22 | [professional explanation of benefit](ExplanationOfBenefit-0ef7963b-44f0-eed0-a4f7-c994fb472fd7.md) | — | [JSON](ExplanationOfBenefit-0ef7963b-44f0-eed0-a4f7-c994fb472fd7.json.md) |
| 139 | Encounter | 2021-05-10 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-b9b0-4e978d5fbba8.md) | — | [JSON](Encounter-324d4f70-205b-60cc-b9b0-4e978d5fbba8.json.md) |
| 140 | Immunization | 2021-05-10 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-7094-d2c0c5ac0f16.md) | — | [JSON](Immunization-324d4f70-205b-60cc-7094-d2c0c5ac0f16.json.md) |
| 141 | DiagnosticReport | 2021-05-10 | [History and physical note](DiagnosticReport-353d2977-c37c-0ec0-3262-23163111933f.md) | [Read note](patient-attachment-review.md#note-fc76afbd0f54834c0b6967a26b252f03f542cf0ab3dc4651ebe8b6340863d0a9) | [JSON](DiagnosticReport-353d2977-c37c-0ec0-3262-23163111933f.json.md) |
| 142 | DocumentReference | 2021-05-10 | [History and physical note](DocumentReference-d0fcf862-c0e6-6964-7d20-f04be8b35cd1.md) | [Read note](patient-attachment-review.md#note-fc76afbd0f54834c0b6967a26b252f03f542cf0ab3dc4651ebe8b6340863d0a9) | [JSON](DocumentReference-d0fcf862-c0e6-6964-7d20-f04be8b35cd1.json.md) |
| 143 | Claim | 2021-05-10 | [professional claim](Claim-324d4f70-205b-60cc-24a8-4d3ad8b8ae01.md) | — | [JSON](Claim-324d4f70-205b-60cc-24a8-4d3ad8b8ae01.json.md) |
| 144 | ExplanationOfBenefit | 2021-05-10 | [professional explanation of benefit](ExplanationOfBenefit-0b1d6b94-0349-8896-1a58-a12f68ad9b08.md) | — | [JSON](ExplanationOfBenefit-0b1d6b94-0349-8896-1a58-a12f68ad9b08.json.md) |
| 145 | Encounter | 2022-03-25 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-6fdf-b576336a84a6.md) | — | [JSON](Encounter-324d4f70-205b-60cc-6fdf-b576336a84a6.json.md) |
| 146 | Procedure | 2022-03-25 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-003d-0101f53e3154.md) | — | [JSON](Procedure-324d4f70-205b-60cc-003d-0101f53e3154.json.md) |
| 147 | DiagnosticReport | 2022-03-25 | [History and physical note](DiagnosticReport-f95e43d9-6da2-3357-b8a7-824109079477.md) | [Read note](patient-attachment-review.md#note-d7071151241200acf2c3029d3918d20e4911d76a3041854c544044484db862a3) | [JSON](DiagnosticReport-f95e43d9-6da2-3357-b8a7-824109079477.json.md) |
| 148 | DocumentReference | 2022-03-25 | [History and physical note](DocumentReference-63c5dd79-2805-7644-8ece-db7371f8b31f.md) | [Read note](patient-attachment-review.md#note-d7071151241200acf2c3029d3918d20e4911d76a3041854c544044484db862a3) | [JSON](DocumentReference-63c5dd79-2805-7644-8ece-db7371f8b31f.json.md) |
| 149 | Claim | 2022-03-25 | [professional claim](Claim-324d4f70-205b-60cc-a761-abf04ae61cff.md) | — | [JSON](Claim-324d4f70-205b-60cc-a761-abf04ae61cff.json.md) |
| 150 | ExplanationOfBenefit | 2022-03-25 | [professional explanation of benefit](ExplanationOfBenefit-18a52e2d-fbc6-1025-ff7e-8735cd88d2d2.md) | — | [JSON](ExplanationOfBenefit-18a52e2d-fbc6-1025-ff7e-8735cd88d2d2.json.md) |
| 151 | Encounter | 2022-03-25 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-6e65-238220288f48.md) | — | [JSON](Encounter-324d4f70-205b-60cc-6e65-238220288f48.json.md) |
| 152 | Procedure | 2022-03-25 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-d167-ce53d138fb07.md) | — | [JSON](Procedure-324d4f70-205b-60cc-d167-ce53d138fb07.json.md) |
| 153 | DiagnosticReport | 2022-03-25 | [History and physical note](DiagnosticReport-b3943349-1969-b9b2-5833-6716cc1a4992.md) | [Read note](patient-attachment-review.md#note-ce929196891d491f3ff8006c391f586bf603b79a7c9339de0786e204659bab33) | [JSON](DiagnosticReport-b3943349-1969-b9b2-5833-6716cc1a4992.json.md) |
| 154 | DocumentReference | 2022-03-25 | [History and physical note](DocumentReference-61346cb7-94ff-eeb9-e5b3-69dc8e9e5c4e.md) | [Read note](patient-attachment-review.md#note-ce929196891d491f3ff8006c391f586bf603b79a7c9339de0786e204659bab33) | [JSON](DocumentReference-61346cb7-94ff-eeb9-e5b3-69dc8e9e5c4e.json.md) |
| 155 | Claim | 2022-03-25 | [professional claim](Claim-324d4f70-205b-60cc-d989-86644ae1848a.md) | — | [JSON](Claim-324d4f70-205b-60cc-d989-86644ae1848a.json.md) |
| 156 | ExplanationOfBenefit | 2022-03-25 | [professional explanation of benefit](ExplanationOfBenefit-e03f31d6-c997-3e18-ff86-81a30f32a37c.md) | — | [JSON](ExplanationOfBenefit-e03f31d6-c997-3e18-ff86-81a30f32a37c.json.md) |
| 157 | Encounter | 2022-03-25 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-e308-404db14d3249.md) | — | [JSON](Encounter-324d4f70-205b-60cc-e308-404db14d3249.json.md) |
| 158 | Procedure | 2022-03-25 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-1c64-64c037697bf3.md) | — | [JSON](Procedure-324d4f70-205b-60cc-1c64-64c037697bf3.json.md) |
| 159 | Procedure | 2022-03-25 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-4a51-7fd58c9a38b2.md) | — | [JSON](Procedure-324d4f70-205b-60cc-4a51-7fd58c9a38b2.json.md) |
| 160 | DiagnosticReport | 2022-03-25 | [History and physical note](DiagnosticReport-ac674294-09ee-54f2-9fd3-eeb801d77cbf.md) | [Read note](patient-attachment-review.md#note-b9aa8cb54ba3af818f42579dbc4abd616a019e7807521abf66a34338752332f2) | [JSON](DiagnosticReport-ac674294-09ee-54f2-9fd3-eeb801d77cbf.json.md) |
| 161 | DocumentReference | 2022-03-25 | [History and physical note](DocumentReference-39646991-afa3-7005-82a2-d12d15048fc4.md) | [Read note](patient-attachment-review.md#note-b9aa8cb54ba3af818f42579dbc4abd616a019e7807521abf66a34338752332f2) | [JSON](DocumentReference-39646991-afa3-7005-82a2-d12d15048fc4.json.md) |
| 162 | Claim | 2022-03-25 | [professional claim](Claim-324d4f70-205b-60cc-403a-3d51560b106f.md) | — | [JSON](Claim-324d4f70-205b-60cc-403a-3d51560b106f.json.md) |
| 163 | ExplanationOfBenefit | 2022-03-25 | [professional explanation of benefit](ExplanationOfBenefit-163e5f23-e6c7-e6ce-e175-29ec2556c67c.md) | — | [JSON](ExplanationOfBenefit-163e5f23-e6c7-e6ce-e175-29ec2556c67c.json.md) |
| 164 | Encounter | 2022-05-16 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-daa0-f375f040f2ca.md) | — | [JSON](Encounter-324d4f70-205b-60cc-daa0-f375f040f2ca.json.md) |
| 165 | Immunization | 2022-05-16 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-c9b8-3f36c803f63f.md) | — | [JSON](Immunization-324d4f70-205b-60cc-c9b8-3f36c803f63f.json.md) |
| 166 | DiagnosticReport | 2022-05-16 | [History and physical note](DiagnosticReport-0e5cedb9-b1f5-ca95-175a-e803a532a5c0.md) | [Read note](patient-attachment-review.md#note-4e13a0888e226e812cd96c117e606e3e7cbf4a1cab3ac44ab188af8cbfc56146) | [JSON](DiagnosticReport-0e5cedb9-b1f5-ca95-175a-e803a532a5c0.json.md) |
| 167 | DocumentReference | 2022-05-16 | [History and physical note](DocumentReference-17b38b00-d4df-7cc5-7e8c-e348c4b1cc5f.md) | [Read note](patient-attachment-review.md#note-4e13a0888e226e812cd96c117e606e3e7cbf4a1cab3ac44ab188af8cbfc56146) | [JSON](DocumentReference-17b38b00-d4df-7cc5-7e8c-e348c4b1cc5f.json.md) |
| 168 | Claim | 2022-05-16 | [professional claim](Claim-324d4f70-205b-60cc-58eb-26b259294074.md) | — | [JSON](Claim-324d4f70-205b-60cc-58eb-26b259294074.json.md) |
| 169 | ExplanationOfBenefit | 2022-05-16 | [professional explanation of benefit](ExplanationOfBenefit-4861bb45-5293-1cc3-9ea3-d13930c67679.md) | — | [JSON](ExplanationOfBenefit-4861bb45-5293-1cc3-9ea3-d13930c67679.json.md) |
| 170 | Encounter | 2023-04-10 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-f89e-b677aa848d76.md) | — | [JSON](Encounter-324d4f70-205b-60cc-f89e-b677aa848d76.json.md) |
| 171 | Procedure | 2023-04-10 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-b275-92eb37de846e.md) | — | [JSON](Procedure-324d4f70-205b-60cc-b275-92eb37de846e.json.md) |
| 172 | DiagnosticReport | 2023-04-10 | [History and physical note](DiagnosticReport-c2215eb5-e6f2-0def-40b3-db851dbcd02f.md) | [Read note](patient-attachment-review.md#note-f340b37d8d5a8eb577cc544a0b8de675150edd21472e0da1ac0103b179874e7f) | [JSON](DiagnosticReport-c2215eb5-e6f2-0def-40b3-db851dbcd02f.json.md) |
| 173 | DocumentReference | 2023-04-10 | [History and physical note](DocumentReference-eb08b96d-76c3-1c9e-411a-b5620aa99655.md) | [Read note](patient-attachment-review.md#note-f340b37d8d5a8eb577cc544a0b8de675150edd21472e0da1ac0103b179874e7f) | [JSON](DocumentReference-eb08b96d-76c3-1c9e-411a-b5620aa99655.json.md) |
| 174 | Claim | 2023-04-10 | [professional claim](Claim-324d4f70-205b-60cc-5bdf-a78105e167bf.md) | — | [JSON](Claim-324d4f70-205b-60cc-5bdf-a78105e167bf.json.md) |
| 175 | ExplanationOfBenefit | 2023-04-10 | [professional explanation of benefit](ExplanationOfBenefit-f379b045-f0a2-6edb-4bae-0eb38633294b.md) | — | [JSON](ExplanationOfBenefit-f379b045-f0a2-6edb-4bae-0eb38633294b.json.md) |
| 176 | Encounter | 2023-04-10 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-47b3-71b6fedb37cf.md) | — | [JSON](Encounter-324d4f70-205b-60cc-47b3-71b6fedb37cf.json.md) |
| 177 | Procedure | 2023-04-10 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-c3b8-2f51d4c14ab0.md) | — | [JSON](Procedure-324d4f70-205b-60cc-c3b8-2f51d4c14ab0.json.md) |
| 178 | DiagnosticReport | 2023-04-10 | [History and physical note](DiagnosticReport-a770495f-efc3-3077-1505-cddeece82a16.md) | [Read note](patient-attachment-review.md#note-bdbf71f601c85135ca0347e3cde3ab9ffca002183b4dcadd8096fcd8c2aad1a4) | [JSON](DiagnosticReport-a770495f-efc3-3077-1505-cddeece82a16.json.md) |
| 179 | DocumentReference | 2023-04-10 | [History and physical note](DocumentReference-f11e6a04-d423-7636-18eb-5d7180476e20.md) | [Read note](patient-attachment-review.md#note-bdbf71f601c85135ca0347e3cde3ab9ffca002183b4dcadd8096fcd8c2aad1a4) | [JSON](DocumentReference-f11e6a04-d423-7636-18eb-5d7180476e20.json.md) |
| 180 | Claim | 2023-04-10 | [professional claim](Claim-324d4f70-205b-60cc-ac7e-a59622bf63f2.md) | — | [JSON](Claim-324d4f70-205b-60cc-ac7e-a59622bf63f2.json.md) |
| 181 | ExplanationOfBenefit | 2023-04-10 | [professional explanation of benefit](ExplanationOfBenefit-5c290f77-b687-222e-cca2-b18e241cb2e8.md) | — | [JSON](ExplanationOfBenefit-5c290f77-b687-222e-cca2-b18e241cb2e8.json.md) |
| 182 | Encounter | 2023-04-10 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-d218-8bd9b86f704e.md) | — | [JSON](Encounter-324d4f70-205b-60cc-d218-8bd9b86f704e.json.md) |
| 183 | Procedure | 2023-04-10 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-1c88-e6cda8ec7531.md) | — | [JSON](Procedure-324d4f70-205b-60cc-1c88-e6cda8ec7531.json.md) |
| 184 | Procedure | 2023-04-10 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-4aa7-17255db300c3.md) | — | [JSON](Procedure-324d4f70-205b-60cc-4aa7-17255db300c3.json.md) |
| 185 | DiagnosticReport | 2023-04-10 | [History and physical note](DiagnosticReport-ef722d95-1656-3076-df44-7d2f7d2f88be.md) | [Read note](patient-attachment-review.md#note-479ad4ca7c410f3f8d1127a541304f8d3c60579a5a745763707a6c055d40e170) | [JSON](DiagnosticReport-ef722d95-1656-3076-df44-7d2f7d2f88be.json.md) |
| 186 | DocumentReference | 2023-04-10 | [History and physical note](DocumentReference-9e1826e7-1ee6-5615-68da-6665b163254c.md) | [Read note](patient-attachment-review.md#note-479ad4ca7c410f3f8d1127a541304f8d3c60579a5a745763707a6c055d40e170) | [JSON](DocumentReference-9e1826e7-1ee6-5615-68da-6665b163254c.json.md) |
| 187 | Claim | 2023-04-10 | [professional claim](Claim-324d4f70-205b-60cc-b87f-486a766d7690.md) | — | [JSON](Claim-324d4f70-205b-60cc-b87f-486a766d7690.json.md) |
| 188 | ExplanationOfBenefit | 2023-04-10 | [professional explanation of benefit](ExplanationOfBenefit-65c2eab5-e79f-e040-9e55-daa11e6aa89d.md) | — | [JSON](ExplanationOfBenefit-65c2eab5-e79f-e040-9e55-daa11e6aa89d.json.md) |
| 189 | Encounter | 2023-05-22 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-0162-2ce5311b5279.md) | — | [JSON](Encounter-324d4f70-205b-60cc-0162-2ce5311b5279.json.md) |
| 190 | Immunization | 2023-05-22 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-fb8e-0edef8cb8ac2.md) | — | [JSON](Immunization-324d4f70-205b-60cc-fb8e-0edef8cb8ac2.json.md) |
| 191 | DiagnosticReport | 2023-05-22 | [History and physical note](DiagnosticReport-1346baf8-318e-1f54-5b36-8d47cbf4f8ac.md) | [Read note](patient-attachment-review.md#note-6e4c0ef219523844fcdd710a202f8c74599602bbbb8e25b1accf227694a780e8) | [JSON](DiagnosticReport-1346baf8-318e-1f54-5b36-8d47cbf4f8ac.json.md) |
| 192 | DocumentReference | 2023-05-22 | [History and physical note](DocumentReference-cb143d49-a165-3b39-01de-ff891ff7b809.md) | [Read note](patient-attachment-review.md#note-6e4c0ef219523844fcdd710a202f8c74599602bbbb8e25b1accf227694a780e8) | [JSON](DocumentReference-cb143d49-a165-3b39-01de-ff891ff7b809.json.md) |
| 193 | Claim | 2023-05-22 | [professional claim](Claim-324d4f70-205b-60cc-f3af-f8e08dd81174.md) | — | [JSON](Claim-324d4f70-205b-60cc-f3af-f8e08dd81174.json.md) |
| 194 | ExplanationOfBenefit | 2023-05-22 | [professional explanation of benefit](ExplanationOfBenefit-1e2e662e-7c14-60b9-77e4-bc7180db296c.md) | — | [JSON](ExplanationOfBenefit-1e2e662e-7c14-60b9-77e4-bc7180db296c.json.md) |
| 195 | Encounter | 2024-04-17 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-9d5c-9755ae6ec44b.md) | — | [JSON](Encounter-324d4f70-205b-60cc-9d5c-9755ae6ec44b.json.md) |
| 196 | Procedure | 2024-04-17 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-a7d9-31c7aace7e53.md) | — | [JSON](Procedure-324d4f70-205b-60cc-a7d9-31c7aace7e53.json.md) |
| 197 | DiagnosticReport | 2024-04-17 | [History and physical note](DiagnosticReport-a77df40e-86a5-5115-a578-3e01c3807c1e.md) | [Read note](patient-attachment-review.md#note-f92ec82467c7cb9bfeeae41309477cd738bc59e5230cb21f369469a5e5e85852) | [JSON](DiagnosticReport-a77df40e-86a5-5115-a578-3e01c3807c1e.json.md) |
| 198 | DocumentReference | 2024-04-17 | [History and physical note](DocumentReference-e51ade29-614f-a989-be73-2619339f43f0.md) | [Read note](patient-attachment-review.md#note-f92ec82467c7cb9bfeeae41309477cd738bc59e5230cb21f369469a5e5e85852) | [JSON](DocumentReference-e51ade29-614f-a989-be73-2619339f43f0.json.md) |
| 199 | Claim | 2024-04-18 | [professional claim](Claim-324d4f70-205b-60cc-d8d9-4789ddde2599.md) | — | [JSON](Claim-324d4f70-205b-60cc-d8d9-4789ddde2599.json.md) |
| 200 | ExplanationOfBenefit | 2024-04-18 | [professional explanation of benefit](ExplanationOfBenefit-e280dd4c-ddf5-b03e-046d-cfcc63a28b6a.md) | — | [JSON](ExplanationOfBenefit-e280dd4c-ddf5-b03e-046d-cfcc63a28b6a.json.md) |
| 201 | Encounter | 2024-04-18 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-9671-6809a100f0ff.md) | — | [JSON](Encounter-324d4f70-205b-60cc-9671-6809a100f0ff.json.md) |
| 202 | Procedure | 2024-04-18 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-53c4-cfdf2b5dd320.md) | — | [JSON](Procedure-324d4f70-205b-60cc-53c4-cfdf2b5dd320.json.md) |
| 203 | DiagnosticReport | 2024-04-18 | [History and physical note](DiagnosticReport-61ae1cb3-c6f7-d331-e62d-19d8c09640c6.md) | [Read note](patient-attachment-review.md#note-cef9d2680ad1becd56f8d3f2875e8a8e2a876c3a7e237391085430e391012343) | [JSON](DiagnosticReport-61ae1cb3-c6f7-d331-e62d-19d8c09640c6.json.md) |
| 204 | DocumentReference | 2024-04-18 | [History and physical note](DocumentReference-ac2ef1fb-a79e-75d2-9f9b-9e1f9f879d9f.md) | [Read note](patient-attachment-review.md#note-cef9d2680ad1becd56f8d3f2875e8a8e2a876c3a7e237391085430e391012343) | [JSON](DocumentReference-ac2ef1fb-a79e-75d2-9f9b-9e1f9f879d9f.json.md) |
| 205 | Claim | 2024-04-18 | [professional claim](Claim-324d4f70-205b-60cc-35e0-61c760c27bcc.md) | — | [JSON](Claim-324d4f70-205b-60cc-35e0-61c760c27bcc.json.md) |
| 206 | ExplanationOfBenefit | 2024-04-18 | [professional explanation of benefit](ExplanationOfBenefit-4f30932e-24cc-b82b-e4c1-89a87fe2d698.md) | — | [JSON](ExplanationOfBenefit-4f30932e-24cc-b82b-e4c1-89a87fe2d698.json.md) |
| 207 | Encounter | 2024-04-18 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-406d-3b0c7ff097ca.md) | — | [JSON](Encounter-324d4f70-205b-60cc-406d-3b0c7ff097ca.json.md) |
| 208 | Procedure | 2024-04-18 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-f89c-1abb9feabaee.md) | — | [JSON](Procedure-324d4f70-205b-60cc-f89c-1abb9feabaee.json.md) |
| 209 | Procedure | 2024-04-18 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-15e5-0fac43d29b6d.md) | — | [JSON](Procedure-324d4f70-205b-60cc-15e5-0fac43d29b6d.json.md) |
| 210 | DiagnosticReport | 2024-04-18 | [History and physical note](DiagnosticReport-c729ea8a-2179-f0c8-8969-691c9e492793.md) | [Read note](patient-attachment-review.md#note-e7e5b929d6784de0b0243a9937dbbf4907763b525f13b30b700e74c2ff7b1c2f) | [JSON](DiagnosticReport-c729ea8a-2179-f0c8-8969-691c9e492793.json.md) |
| 211 | DocumentReference | 2024-04-18 | [History and physical note](DocumentReference-3e3dd483-8ab0-bcd9-b7f4-2a9586a550bf.md) | [Read note](patient-attachment-review.md#note-e7e5b929d6784de0b0243a9937dbbf4907763b525f13b30b700e74c2ff7b1c2f) | [JSON](DocumentReference-3e3dd483-8ab0-bcd9-b7f4-2a9586a550bf.json.md) |
| 212 | Claim | 2024-04-18 | [professional claim](Claim-324d4f70-205b-60cc-d72e-353b774455cf.md) | — | [JSON](Claim-324d4f70-205b-60cc-d72e-353b774455cf.json.md) |
| 213 | ExplanationOfBenefit | 2024-04-18 | [professional explanation of benefit](ExplanationOfBenefit-b0ea08e2-af5a-a47f-1e7f-99d92a5bddd6.md) | — | [JSON](ExplanationOfBenefit-b0ea08e2-af5a-a47f-1e7f-99d92a5bddd6.json.md) |
| 214 | Encounter | 2024-05-27 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-3fde-27be9c1c7826.md) | — | [JSON](Encounter-324d4f70-205b-60cc-3fde-27be9c1c7826.json.md) |
| 215 | Immunization | 2024-05-27 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-cf00-62e8f31e53f8.md) | — | [JSON](Immunization-324d4f70-205b-60cc-cf00-62e8f31e53f8.json.md) |
| 216 | Immunization | 2024-05-27 | [Td (adult), 5 Lf tetanus toxoid, preservative free, adsorbed](Immunization-324d4f70-205b-60cc-56b1-5917b91995a7.md) | — | [JSON](Immunization-324d4f70-205b-60cc-56b1-5917b91995a7.json.md) |
| 217 | DiagnosticReport | 2024-05-27 | [History and physical note](DiagnosticReport-e9d0e8d6-9a35-e32c-294f-7b53696cadef.md) | [Read note](patient-attachment-review.md#note-b84b1cda08e444408548d1c9285d0fa62791471bcb6e73315d9d0fe59d03c78e) | [JSON](DiagnosticReport-e9d0e8d6-9a35-e32c-294f-7b53696cadef.json.md) |
| 218 | DocumentReference | 2024-05-27 | [History and physical note](DocumentReference-a3325c89-e3b2-823a-5988-6e85d84668b4.md) | [Read note](patient-attachment-review.md#note-b84b1cda08e444408548d1c9285d0fa62791471bcb6e73315d9d0fe59d03c78e) | [JSON](DocumentReference-a3325c89-e3b2-823a-5988-6e85d84668b4.json.md) |
| 219 | Claim | 2024-05-27 | [professional claim](Claim-324d4f70-205b-60cc-fe0f-215c3c52d84c.md) | — | [JSON](Claim-324d4f70-205b-60cc-fe0f-215c3c52d84c.json.md) |
| 220 | ExplanationOfBenefit | 2024-05-27 | [professional explanation of benefit](ExplanationOfBenefit-891d499d-3d50-9810-7cb6-fcd09706ee54.md) | — | [JSON](ExplanationOfBenefit-891d499d-3d50-9810-7cb6-fcd09706ee54.json.md) |
| 221 | Encounter | 2025-03-14 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-c53c-b3838c180ebd.md) | — | [JSON](Encounter-324d4f70-205b-60cc-c53c-b3838c180ebd.json.md) |
| 222 | Procedure | 2025-03-14 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-e7e7-eeab8432491c.md) | — | [JSON](Procedure-324d4f70-205b-60cc-e7e7-eeab8432491c.json.md) |
| 223 | DiagnosticReport | 2025-03-14 | [History and physical note](DiagnosticReport-c3520393-d01a-7dce-f71f-b6445ffa226d.md) | [Read note](patient-attachment-review.md#note-3d45c5a420df39d962310b2b1170fd0b20798335c53432451d0816daa1d60289) | [JSON](DiagnosticReport-c3520393-d01a-7dce-f71f-b6445ffa226d.json.md) |
| 224 | DocumentReference | 2025-03-14 | [History and physical note](DocumentReference-ab096977-c407-80df-a82e-6316319d055e.md) | [Read note](patient-attachment-review.md#note-3d45c5a420df39d962310b2b1170fd0b20798335c53432451d0816daa1d60289) | [JSON](DocumentReference-ab096977-c407-80df-a82e-6316319d055e.json.md) |
| 225 | Claim | 2025-03-14 | [professional claim](Claim-324d4f70-205b-60cc-fb7a-ec524eb0db28.md) | — | [JSON](Claim-324d4f70-205b-60cc-fb7a-ec524eb0db28.json.md) |
| 226 | ExplanationOfBenefit | 2025-03-14 | [professional explanation of benefit](ExplanationOfBenefit-2d9f1ccf-b761-0146-34e0-76860da5afa4.md) | — | [JSON](ExplanationOfBenefit-2d9f1ccf-b761-0146-34e0-76860da5afa4.json.md) |
| 227 | Encounter | 2025-03-14 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-55f7-f9f4976b1da5.md) | — | [JSON](Encounter-324d4f70-205b-60cc-55f7-f9f4976b1da5.json.md) |
| 228 | Procedure | 2025-03-14 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-96a9-d91d739652da.md) | — | [JSON](Procedure-324d4f70-205b-60cc-96a9-d91d739652da.json.md) |
| 229 | DiagnosticReport | 2025-03-14 | [History and physical note](DiagnosticReport-297f9c08-541e-c4a5-962b-c0003d469198.md) | [Read note](patient-attachment-review.md#note-ac72963eefd4bc4d451aa633b1dd52d489719e6e36005ce1cb032f43cabe8c4a) | [JSON](DiagnosticReport-297f9c08-541e-c4a5-962b-c0003d469198.json.md) |
| 230 | DocumentReference | 2025-03-14 | [History and physical note](DocumentReference-b2f97ed6-d697-f867-f161-1a3c37b7b7b0.md) | [Read note](patient-attachment-review.md#note-ac72963eefd4bc4d451aa633b1dd52d489719e6e36005ce1cb032f43cabe8c4a) | [JSON](DocumentReference-b2f97ed6-d697-f867-f161-1a3c37b7b7b0.json.md) |
| 231 | Claim | 2025-03-14 | [professional claim](Claim-324d4f70-205b-60cc-81ae-b206c7842f06.md) | — | [JSON](Claim-324d4f70-205b-60cc-81ae-b206c7842f06.json.md) |
| 232 | ExplanationOfBenefit | 2025-03-14 | [professional explanation of benefit](ExplanationOfBenefit-034e73d7-b3e2-6cc5-8e1c-2689d95581dc.md) | — | [JSON](ExplanationOfBenefit-034e73d7-b3e2-6cc5-8e1c-2689d95581dc.json.md) |
| 233 | Encounter | 2025-03-14 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-f442-d49d506f10a7.md) | — | [JSON](Encounter-324d4f70-205b-60cc-f442-d49d506f10a7.json.md) |
| 234 | Procedure | 2025-03-14 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-279b-886aa2782723.md) | — | [JSON](Procedure-324d4f70-205b-60cc-279b-886aa2782723.json.md) |
| 235 | Procedure | 2025-03-14 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-f846-d4397fc18ba4.md) | — | [JSON](Procedure-324d4f70-205b-60cc-f846-d4397fc18ba4.json.md) |
| 236 | DiagnosticReport | 2025-03-14 | [History and physical note](DiagnosticReport-3a68c8ad-8605-c3c4-4366-c2f779429eef.md) | [Read note](patient-attachment-review.md#note-80f7e62d5a928d034c95215fd0adf93c02b7ba26b29732ca6077128f081ff1dd) | [JSON](DiagnosticReport-3a68c8ad-8605-c3c4-4366-c2f779429eef.json.md) |
| 237 | DocumentReference | 2025-03-14 | [History and physical note](DocumentReference-98fc4c29-33b7-1b65-ffd5-a47123896aff.md) | [Read note](patient-attachment-review.md#note-80f7e62d5a928d034c95215fd0adf93c02b7ba26b29732ca6077128f081ff1dd) | [JSON](DocumentReference-98fc4c29-33b7-1b65-ffd5-a47123896aff.json.md) |
| 238 | Claim | 2025-03-14 | [professional claim](Claim-324d4f70-205b-60cc-2051-e8ee0a6b654f.md) | — | [JSON](Claim-324d4f70-205b-60cc-2051-e8ee0a6b654f.json.md) |
| 239 | ExplanationOfBenefit | 2025-03-14 | [professional explanation of benefit](ExplanationOfBenefit-8709b501-0255-bd34-b3e4-e02359880198.md) | — | [JSON](ExplanationOfBenefit-8709b501-0255-bd34-b3e4-e02359880198.json.md) |
| 240 | Encounter | 2025-06-02 | [General examination of patient (procedure)](Encounter-324d4f70-205b-60cc-ea9d-c861c301dc37.md) | — | [JSON](Encounter-324d4f70-205b-60cc-ea9d-c861c301dc37.json.md) |
| 241 | Immunization | 2025-06-02 | [Influenza, split virus, trivalent, PF](Immunization-324d4f70-205b-60cc-0ffb-080f18161ad7.md) | — | [JSON](Immunization-324d4f70-205b-60cc-0ffb-080f18161ad7.json.md) |
| 242 | DiagnosticReport | 2025-06-02 | [History and physical note](DiagnosticReport-8a6b74b5-e231-2ecf-08fd-f18518fbf10f.md) | [Read note](patient-attachment-review.md#note-2aac78ebd6b1aca78872c03c5bf577f9cd8ae94729502e76f3e7fe1e2a2048d9) | [JSON](DiagnosticReport-8a6b74b5-e231-2ecf-08fd-f18518fbf10f.json.md) |
| 243 | DocumentReference | 2025-06-02 | [History and physical note](DocumentReference-128537af-c773-1cb5-6897-33a45b59966b.md) | [Read note](patient-attachment-review.md#note-2aac78ebd6b1aca78872c03c5bf577f9cd8ae94729502e76f3e7fe1e2a2048d9) | [JSON](DocumentReference-128537af-c773-1cb5-6897-33a45b59966b.json.md) |
| 244 | Claim | 2025-06-02 | [professional claim](Claim-324d4f70-205b-60cc-6b1e-13ab57e5fded.md) | — | [JSON](Claim-324d4f70-205b-60cc-6b1e-13ab57e5fded.json.md) |
| 245 | ExplanationOfBenefit | 2025-06-02 | [professional explanation of benefit](ExplanationOfBenefit-880c798b-353e-3f48-3a83-47720e9752d2.md) | — | [JSON](ExplanationOfBenefit-880c798b-353e-3f48-3a83-47720e9752d2.json.md) |
| 246 | Encounter | 2026-04-01 | [Postoperative follow-up visit (procedure)](Encounter-324d4f70-205b-60cc-e77a-de35e12d61c2.md) | — | [JSON](Encounter-324d4f70-205b-60cc-e77a-de35e12d61c2.json.md) |
| 247 | Procedure | 2026-04-01 | [Physical examination, complete (procedure)](Procedure-324d4f70-205b-60cc-bcea-2e77475b36da.md) | — | [JSON](Procedure-324d4f70-205b-60cc-bcea-2e77475b36da.json.md) |
| 248 | DiagnosticReport | 2026-04-01 | [History and physical note](DiagnosticReport-c4e9b8f6-3605-b8d7-cde7-b34029429402.md) | [Read note](patient-attachment-review.md#note-74be4ae1c8ce3371946ec63746a2d2a1f63e2b327fe3c08b97bcb6e67fbdd165) | [JSON](DiagnosticReport-c4e9b8f6-3605-b8d7-cde7-b34029429402.json.md) |
| 249 | DocumentReference | 2026-04-01 | [History and physical note](DocumentReference-98aa1bed-3b39-60e5-ff83-74352b0bb07f.md) | [Read note](patient-attachment-review.md#note-74be4ae1c8ce3371946ec63746a2d2a1f63e2b327fe3c08b97bcb6e67fbdd165) | [JSON](DocumentReference-98aa1bed-3b39-60e5-ff83-74352b0bb07f.json.md) |
| 250 | Claim | 2026-04-01 | [professional claim](Claim-324d4f70-205b-60cc-70db-c23708019e5e.md) | — | [JSON](Claim-324d4f70-205b-60cc-70db-c23708019e5e.json.md) |
| 251 | ExplanationOfBenefit | 2026-04-01 | [professional explanation of benefit](ExplanationOfBenefit-70686202-c601-8e2f-e11b-ceaf514b753a.md) | — | [JSON](ExplanationOfBenefit-70686202-c601-8e2f-e11b-ceaf514b753a.json.md) |
| 252 | Encounter | 2026-04-01 | [Screening surveillance (regime/therapy)](Encounter-324d4f70-205b-60cc-f6ec-9182270fc784.md) | — | [JSON](Encounter-324d4f70-205b-60cc-f6ec-9182270fc784.json.md) |
| 253 | Procedure | 2026-04-01 | [Mammography (procedure)](Procedure-324d4f70-205b-60cc-976f-e37e8b0f6171.md) | — | [JSON](Procedure-324d4f70-205b-60cc-976f-e37e8b0f6171.json.md) |
| 254 | DiagnosticReport | 2026-04-01 | [History and physical note](DiagnosticReport-7bf61bd2-84bf-b775-6f32-f6fd8dbdb1bf.md) | [Read note](patient-attachment-review.md#note-d53d52feac8e2ba453ccbc605649c47baac27bad338875c3c2a94aa9abc0b201) | [JSON](DiagnosticReport-7bf61bd2-84bf-b775-6f32-f6fd8dbdb1bf.json.md) |
| 255 | DocumentReference | 2026-04-01 | [History and physical note](DocumentReference-eb2d5b15-167c-278e-daff-aaaf7d557fd6.md) | [Read note](patient-attachment-review.md#note-d53d52feac8e2ba453ccbc605649c47baac27bad338875c3c2a94aa9abc0b201) | [JSON](DocumentReference-eb2d5b15-167c-278e-daff-aaaf7d557fd6.json.md) |
| 256 | Claim | 2026-04-01 | [professional claim](Claim-324d4f70-205b-60cc-0297-a5a1bd87d1f0.md) | — | [JSON](Claim-324d4f70-205b-60cc-0297-a5a1bd87d1f0.json.md) |
| 257 | ExplanationOfBenefit | 2026-04-01 | [professional explanation of benefit](ExplanationOfBenefit-19c02e32-9639-794a-7e1a-7db80fef14af.md) | — | [JSON](ExplanationOfBenefit-19c02e32-9639-794a-7e1a-7db80fef14af.json.md) |
| 258 | Encounter | 2026-04-01 | [Gynecology service (qualifier value)](Encounter-324d4f70-205b-60cc-95ce-922e94744be4.md) | — | [JSON](Encounter-324d4f70-205b-60cc-95ce-922e94744be4.json.md) |
| 259 | Procedure | 2026-04-01 | [Manual pelvic examination (procedure)](Procedure-324d4f70-205b-60cc-57cb-2e4d766f0fbf.md) | — | [JSON](Procedure-324d4f70-205b-60cc-57cb-2e4d766f0fbf.json.md) |
| 260 | Procedure | 2026-04-01 | [Cytopathology procedure, preparation of smear, genital source (procedure)](Procedure-324d4f70-205b-60cc-f790-a0746ae2fee0.md) | — | [JSON](Procedure-324d4f70-205b-60cc-f790-a0746ae2fee0.json.md) |
| 261 | DiagnosticReport | 2026-04-01 | [History and physical note](DiagnosticReport-d217b1a2-6e82-9345-84c8-41821321c713.md) | [Read note](patient-attachment-review.md#note-549472b95bc44776f5963f5a4a56e46a68df32931b04bcbf8c5e59f5dd143794) | [JSON](DiagnosticReport-d217b1a2-6e82-9345-84c8-41821321c713.json.md) |
| 262 | DocumentReference | 2026-04-01 | [History and physical note](DocumentReference-07fff275-f553-ea8f-019e-600b79d2e7b4.md) | [Read note](patient-attachment-review.md#note-549472b95bc44776f5963f5a4a56e46a68df32931b04bcbf8c5e59f5dd143794) | [JSON](DocumentReference-07fff275-f553-ea8f-019e-600b79d2e7b4.json.md) |
| 263 | Claim | 2026-04-01 | [professional claim](Claim-324d4f70-205b-60cc-3eca-e327cc5deb09.md) | — | [JSON](Claim-324d4f70-205b-60cc-3eca-e327cc5deb09.json.md) |
| 264 | ExplanationOfBenefit | 2026-04-01 | [professional explanation of benefit](ExplanationOfBenefit-8a98d15f-89fb-3c68-e0de-765a88c9961e.md) | — | [JSON](ExplanationOfBenefit-8a98d15f-89fb-3c68-e0de-765a88c9961e.json.md) |
| 265 | Provenance | 2026-04-27 | [Authorship and transmission record](Provenance-6992255d-3a3e-7e1b-04f7-84eef418d151.md) | — | [JSON](Provenance-6992255d-3a3e-7e1b-04f7-84eef418d151.json.md) |

No resources match these filters. Try another description or resource type.

### Related Pages

* [Breast Cancer PA](breast-cancer-pa.md) — Use-case data requirements and gaps
* [Data Requirements](data-requirements.md) — Patient context used during CRD evaluation
* [Regimen Modeling](regimen-model.md) — Regimen and patient-specific order representation
* [Downloads](downloads.md) — IG packages and example downloads

