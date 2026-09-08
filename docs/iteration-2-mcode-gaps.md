# Breast Cancer Prior Authorization Data Requirements: mCODE Mapping and Gaps

## Purpose

This working matrix identifies breast cancer prior authorization (PA) data requirements and maps them to likely mCODE / FHIR representations. The intent is to distinguish:

- Data elements already well supported by mCODE.
- Data elements supported by mCODE but requiring PA-specific constraints.
- Data elements that likely require new profiles, extensions, or DTR capture patterns.

This matrix is intended to support the oncology CRD/CDS Hooks extension pattern in which:

```text
RequestGroup           = ordered anti-cancer regimen instance (CDS Hooks payload) — MVP
PlanDefinition         = canonical reusable regimen definition (nice-to-have; not required for MVP)
Library.dataRequirement = required patient context
DataRequirement        = individual computable requirement
Questionnaire          = DTR collection instrument
Bundle / FHIR API      = actual patient data
```

---

## Important note on staging

Staging should not be treated as simply “missing” from mCODE.

mCODE supports AJCC/TNM-based staging through cancer stage and TNM-specific profiles. In particular, mCODE includes a TNM Stage Group profile for the overall AJCC stage group, and its TNM staging method value set is used in `Observation.method` for both the stage group and the separate T, N, and M category observations.

The gap for breast cancer PA is therefore not basic representation. The gap is PA-specific profiling:

- Whether **clinical stage** or **pathologic stage** is required.
- Whether the **AJCC stage group** is sufficient.
- Whether separate **T, N, and M categories** are required.
- Which **AJCC edition / staging method** is acceptable.
- Whether staging must represent **current disease state** versus historical diagnosis stage.
- How the staging observation is linked to the primary breast cancer condition and evidence source.

Recommended classification:

```text
mCODE coverage: Strong foundation
Gap: PA-specific cardinality, clinical vs pathologic stage, TNM component requirements, AJCC edition/method, currentness
Action: Define breast cancer PA staging requirements in the DataRequirement Library
```

---

## Breast Cancer PA Data Requirements Matrix

| PA / guideline decision data element | Why it matters for breast cancer PA | Likely mCODE / FHIR representation | mCODE coverage | Gap / issue | Recommended modeling action |
|---|---|---|---|---|---|
| Patient identity / demographics | Required for authorization matching and benefit processing | `Patient`, likely US Core Patient; mCODE Cancer Patient profile may apply | Strong | mCODE is not the payer identity layer | Use US Core Patient for exchange; reference mCODE Cancer Patient where oncology context is needed |
| Primary breast cancer diagnosis | Establishes the condition being treated | `Condition` conforming to `mcode-primary-cancer-condition` | Strong | Need breast-specific coding constraints and laterality expectations | Require `mcode-primary-cancer-condition`; bind diagnosis to breast cancer value set; add laterality expectation |
| Histology / morphology | Treatment and guideline pathways differ by invasive carcinoma, DCIS, special histologies, etc. | mCODE disease characterization patterns; possibly `Condition` / `Observation` depending implementation | Partial | No single breast PA-ready profile for histology + morphology + receptor subtype | Add breast cancer diagnosis detail slice or companion Observation requirements |
| Laterality | Breast cancer staging, surgery, radiation, recurrence, and site-specific therapy may depend on side | Could be body site / laterality extension on condition or related observation | Partial | Often inconsistently represented | Require laterality for breast primary cancer condition unless not applicable |
| AJCC TNM stage group | Determines broad disease setting, such as early-stage, locally advanced, metastatic | `Observation` conforming to mCODE TNM Stage Group / Cancer Stage profiles; `Observation.method` indicates AJCC edition | Strong foundation | PA profile must specify whether clinical or pathologic stage group is required, acceptable AJCC edition, and lookback/currentness | Require TNM stage group when stage group is sufficient for authorization logic; constrain method to accepted AJCC editions |
| Clinical stage group | Needed before definitive surgery, especially neoadjuvant therapy | mCODE TNM clinical stage group Observation | Strong foundation | Must distinguish from pathologic stage | Add explicit DataRequirement for clinical stage group in neoadjuvant/preoperative contexts |
| Pathologic stage group | Needed after surgery, especially adjuvant treatment | mCODE TNM pathologic stage group Observation | Strong foundation | Must distinguish from clinical stage and tie to surgery/pathology date | Add explicit DataRequirement for pathologic stage group in adjuvant/postoperative contexts |
| T category | Tumor size/extent; may affect adjuvant/neoadjuvant treatment selection | mCODE TNM primary tumor category Observation | Strong foundation | Stage group alone may hide decision-relevant tumor details | Require T category where regimen/policy depends on tumor size or extent |
| N category | Nodal involvement; central to breast cancer adjuvant/neoadjuvant decisions | mCODE TNM regional nodes category Observation | Strong foundation | Stage group alone may not be sufficient for node-positive logic | Require N category where nodal status affects regimen eligibility |
| M category | Distant metastasis; distinguishes metastatic disease | mCODE TNM distant metastases category Observation | Strong foundation | PA may need current metastatic status, not just historical staging | Require M category or disease status for metastatic-regimen evaluation |
| Staging method / AJCC edition | Ensures stage is interpreted correctly | `Observation.method` using mCODE TNM staging method value set | Strong foundation | PA profile must declare accepted staging system/edition | Require `Observation.method`; specify accepted AJCC edition(s) or allow latest available |
| Stage timing / currentness | PA decisions need current disease context | `Observation.effective[x]`, links to condition | Partial | Need workflow-specific recency rules | Add data-requirement guidance for current vs historical stage |
| Link from stage to cancer condition | Ensures stage applies to the breast cancer being treated | `Observation.focus` / related references depending profile | Strong foundation | Must be required in PA profile | Require association to the primary cancer condition |
| Metastatic status / stage IV | Determines metastatic regimen pathways and drug sequencing | TNM stage group, M category, disease status, metastatic condition/site patterns | Strong foundation | Need clear current metastatic disease representation | Require current disease setting and, where relevant, metastatic site evidence |
| Disease status / progression | Many metastatic PA rules require progression, recurrence, stable disease, or response | `mcode-cancer-disease-status` | Strong foundation | Need evidence date, prior treatment association, and “progressed on X” semantics | Use disease status plus prior therapy linkage; define progression-after-therapy profile/extension if needed |
| Recurrence status | Distinguishes new primary, recurrence, and progression | Disease status, condition history, observation | Partial | No single clean recurrence model for PA | Add breast cancer recurrence status requirement where regimen depends on recurrence |
| Treatment setting | Adjuvant, neoadjuvant, metastatic, recurrent, maintenance | Da Vinci CRD `ext-request-category` | CRD RequestGroup context expansion proposed | Intent and treatment setting are patient-specific ordering context, not canonical regimen properties | Carry patient-specific treatment setting / intent on RequestGroup through repeated CRD categories |
| Line of therapy | Central for metastatic treatment sequencing and PA | Profiled Da Vinci CRD category on `RequestGroup` | Weak / missing in mCODE order semantics | mCODE treatment events do not compute or declare line of therapy directly | Use the `lineOfTherapy` category slice, with a required `TreatmentLineVS` binding, for order-level classification |
| Ordered anti-cancer regimen (instance) | PA should evaluate the coordinated regimen, not isolated drugs | `RequestGroup` (`instantiatesCanonical` → `PlanDefinition` regimen definition) | Missing in mCODE | mCODE has treatment resources but no first-class ordered regimen profile | Create `AntiCancerRegimenRequestGroup` as the CDS Hooks payload; `RequestGroup.instantiatesCanonical` references `AntiCancerRegimenPlanDefinition` |
| Regimen definition *(nice-to-have; not MVP)* | Canonical, reusable protocol backing the ordered instance | `PlanDefinition` with `type = order-set` | Missing in mCODE | No first-class mCODE regimen/order-set definition profile; `RequestGroup.instantiatesCanonical` SHOULD reference it when available | Create `AntiCancerRegimenPlanDefinition`; referenced from `RequestGroup.instantiatesCanonical` — deferred post-MVP |
| Regimen component medications | Needed for drug-specific coverage and regimen completeness | `mcode-cancer-related-medication-request`; later `MedicationAdministration` or `MedicationStatement` | Strong for individual medication requests | Individual meds do not by themselves express coordinated regimen logic | Link component orders to regimen actions; include component `MedicationRequest`s at `order-sign` when available |
| Supportive medications | May be included in order set but not always part of anti-cancer regimen PA | MedicationRequest, potentially non-mCODE | Partial | Need to distinguish anti-cancer therapy components from supportive care | Add component role on regimen action: anti-cancer, supportive, premedication, rescue, monitoring |
| ER status | Core biomarker for endocrine and systemic therapy decisions | `mcode-tumor-marker-test` using LOINC/code filters | Strong foundation | Need breast-specific value set and result normalization | Require ER Observation using tumor marker test profile or breast-specific value set; normalize positive/negative/percent |
| PR status | Core biomarker for hormone receptor classification | `mcode-tumor-marker-test` | Strong foundation | Same as ER | Require PR Observation with breast-specific value set/result normalization |
| HER2 status | Determines HER2-targeted therapy eligibility | `mcode-tumor-marker-test`; mCODE examples include HER2 tissue interpretation | Strong foundation | Need to distinguish IHC, ISH/FISH, equivocal, low, positive/negative; HER2-low may matter for certain metastatic regimens | Require HER2 Observation with method, interpretation, and result value; consider HER2-low extension/profile |
| Triple-negative status | Determines chemotherapy/immunotherapy pathways | Derived from ER-/PR-/HER2- | Derived, not direct | Not usually a source datum; should be computable from ER/PR/HER2 | Do not require as primary data; define computable classification from receptor results |
| Hormone receptor status | Determines endocrine therapy pathways | Derived from ER/PR | Derived, not direct | Needs consistent derivation rule | Compute HR+ / HR- from ER and PR requirements |
| Ki-67 | May be used in selected early breast cancer risk decisions | Tumor marker test Observation | Partial | Guideline use is context-specific and not universal | Include as conditional DataRequirement for specific regimens/pathways only |
| Genomic recurrence score | Used in selected HR+/HER2- early breast cancer adjuvant decisions | Genomics report / genomic variant / tumor marker or lab Observation depending assay | Partial | mCODE genomics may support structure, but commercial assay results need specific profiles/value sets | Add conditional requirement for Oncotype DX/MammaPrint/etc. where PA or guideline logic depends on it |
| BRCA1/BRCA2 status | Relevant for PARP inhibitors and hereditary-risk-driven therapy | `mcode-genomic-variant`, `mcode-genomics-report` | Partial to strong foundation | Need germline vs somatic distinction and pathogenicity normalization | Require genomics report/variant profile with germline/somatic context where relevant |
| PIK3CA mutation | Relevant for selected HR+/HER2- metastatic therapy | Genomic variant / genomics report | Partial | Requires specific value set and test context | Add conditional DataRequirement for metastatic HR+/HER2- targeted therapy |
| ESR1 mutation | Relevant to some endocrine therapy selection in metastatic HR+/HER2- disease | Genomic variant / genomics report | Partial | Emerging/therapy-specific; depends on current policy | Add conditional metastatic breast cancer biomarker requirement |
| PD-L1 status | Relevant for immunotherapy in selected triple-negative breast cancer | Tumor marker / lab Observation | Partial | Assay, scoring method, and threshold matter | Add conditional profile/value set for TNBC immunotherapy authorization |
| MSI/MMR / TMB / NTRK | Tumor-agnostic or selected therapy eligibility | Genomics report / tumor marker / lab Observation | Partial | Not breast-specific but relevant for certain drugs | Include only for tumor-agnostic targeted/immunotherapy PA |
| Menopausal status | Affects endocrine therapy choices in HR+ disease | Could be Observation, Condition, or clinical status; not clearly mCODE-specific | Weak | Not a clean mCODE breast cancer element | Define menopausal status Observation/profile or use US Core Observation with required value set |
| Pregnancy status | Safety and treatment selection consideration | US Core Observation / Condition | Outside mCODE | More general clinical/safety requirement than oncology-specific | Use US Core where needed for chemotherapy/radiation safety workflows |
| ECOG performance status | Determines fitness for chemotherapy and many regimen criteria | `mcode-ecog-performance-status`; mCODE also supports other performance assessments | Strong | May not be universally required; timing matters | Conditional DataRequirement with acceptable lookback period when regimen/policy requires it |
| Karnofsky performance status | Alternative performance status | mCODE assessment profiles | Strong foundation | Same as ECOG | Allow ECOG or Karnofsky depending policy |
| Comorbidities / contraindications | Medical necessity exceptions and drug safety | `Condition`, `AllergyIntolerance`, `Observation`, `MedicationStatement` | Generic FHIR / US Core, not mCODE-specific | PA policies often need specific contraindications, e.g., cardiac dysfunction for HER2 therapy | Define regimen-specific contraindication DataRequirements using US Core/mCODE as applicable |
| Cardiac function / LVEF | Required for some HER2-targeted regimens | Observation / DiagnosticReport; not core mCODE-specific | Partial / outside mCODE | Need echo/MUGA result profile and timing | Add conditional DataRequirement for LVEF with lookback period |
| Baseline labs | Required for chemotherapy safety and dosing | Observation / DiagnosticReport, usually US Core lab | Outside mCODE | Not oncology-specific but often PA/payer safety requirement | Use US Core lab profiles with regimen-specific DataRequirements |
| Prior surgery | Determines adjuvant/neoadjuvant/postoperative context | `Procedure`, possibly mCODE cancer-related surgical procedure if available in version | Partial | Need breast-specific surgery type, date, margins, nodes | Use mCODE/US Core Procedure; add breast surgery value sets and pathology details where required |
| Prior radiation therapy | Determines treatment history and sequencing | mCODE radiation treatment profiles where available | Partial to strong foundation | Need site, intent, dates, dose/fractions if relevant | Use mCODE radiation treatment profiles; add conditional requirements |
| Prior systemic therapy | Needed for line of therapy and sequencing | `mcode-cancer-related-medication-statement`, `MedicationAdministration`, `MedicationRequest` | Strong for events | mCODE does not summarize “prior regimen” or “progressed on regimen” cleanly | Require prior medication events; add regimen history summary/profile for PA |
| Prior HER2 therapy | Required for many metastatic HER2+ sequencing rules | Cancer-related medication resources | Partial | Need class-based and regimen-based prior therapy logic | Add value sets for HER2-directed agents and link to disease progression/status |
| Prior endocrine therapy | Required for HR+ metastatic sequencing | Cancer-related medication resources | Partial | Need duration, intolerance, progression while on therapy | Add DataRequirement for prior endocrine medication history and reason stopped |
| Prior CDK4/6 inhibitor | Required for some HR+/HER2- metastatic sequencing | Cancer-related medication resources | Partial | Need medication class grouping and line context | Add class value set and prior-therapy requirement |
| Prior taxane / anthracycline / platinum | Common chemotherapy sequencing and eligibility factor | Cancer-related medication resources | Partial | Class-based chemotherapy exposure not standardized as a PA summary | Add class value sets and prior therapy summarization |
| Reason for regimen selection / medical necessity | Needed when regimen is non-standard or exception-based | Could be `ServiceRequest.reasonCode`, `MedicationRequest.reasonCode`, `CarePlan`, `DocumentReference` | Weak | Not standardized for guideline exception logic | Define exception/medical-necessity profile or require DTR QuestionnaireResponse |
| Contraindication / intolerance to preferred therapy | Supports exception approvals | `AllergyIntolerance`, `Condition`, `Observation`, `MedicationStatement.statusReason` | Partial | Need explicit link to avoided regimen/drug | Add exception profile with reference to drug/regimen and evidence |
| Patient preference / shared decision | May justify therapy variation | `Consent`, `QuestionnaireResponse`, note | Weak / outside mCODE | Not computable in most EHRs | Capture through DTR QuestionnaireResponse when required |
| Clinical note / unstructured evidence | Often contains line of therapy, progression, rationale | `DocumentReference` | Generic FHIR | Hard to compute; may be needed as fallback | Allow DTR attachment or DocumentReference as fallback, but prioritize discrete DataRequirements |
| Current disease burden / measurable disease | Needed for metastatic response/progression criteria | Imaging reports, Observations, disease status | Partial | mCODE does not fully model RECIST-style measurable disease for PA | Use disease status initially; define advanced imaging/response profile later |
| Pathology report | Source evidence for diagnosis, biomarkers, histology | `DiagnosticReport`, `Observation`, `DocumentReference` | Partial via observations | Full report is often unstructured | Require discrete Observations where possible; allow DocumentReference fallback |
| Imaging evidence | Supports staging/progression/metastasis | `DiagnosticReport`, `ImagingStudy`, `Observation`, `DocumentReference` | Generic FHIR / partial mCODE | Structured progression evidence is limited | Use disease status plus source references; allow imaging report DocumentReference |
| Planned treatment dates / cycle | Needed for authorization period and units | Regimen `PlanDefinition`, component requests | Weak in mCODE regimen sense | No first-class regimen schedule profile | Add cycle/schedule elements to regimen `PlanDefinition` or action timing |
| Dose / route / frequency | Needed for drug authorization | `MedicationRequest.dosageInstruction`; ActivityDefinition/PlanDefinition action | Strong at medication level | Regimen-level schedule aggregation missing | Require component orders at `order-sign`; use regimen action timing for order-set intent |
| Requested drug units / quantity | Needed for PA and billing | `MedicationRequest.dispenseRequest`, dosage, duration | Partial | Oncology dosing often body-surface-area/weight based | Add dosing basis requirements when payer requires units |
| Height / weight / BSA | Needed for dosing validation | US Core vitals / Observation | Outside mCODE | BSA often calculated, not stored | Use US Core vital signs; optionally add calculated BSA Observation |
| Coverage / benefit context | Determines PA route but not clinical guideline concordance | Coverage, Claim/PA artifacts, PAS | Outside mCODE | Not a clinical mCODE concern | Keep outside mCODE; part of CRD/PAS layer |
| Prior authorization outcome linkage | Needed for audit and workflow | Task, ClaimResponse, CommunicationRequest, PAS artifacts | Outside mCODE | Not oncology clinical data | Model in PAS/CRD workflow, not mCODE |

---

## Priority gaps to address first

| Gap | Why it is high priority | Proposed artifact |
|---|---|---|
| Regimen/order-set as a first-class object | Oncology PA is regimen-centered, not only drug-order-centered | `AntiCancerRegimenPlanDefinition` profile with `type = order-set` |
| Treatment setting | Most breast cancer logic branches by adjuvant, neoadjuvant, metastatic, recurrent, maintenance | Da Vinci CRD `ext-request-category` on RequestGroup (`category 0..* MS`) |
| Line of therapy | Required for metastatic sequencing and payer policy | `RequestGroup.extension:category/lineOfTherapy`, profiled from the Da Vinci CRD Request Category and bound to `TreatmentLineVS` |
| Prior therapy summary | PA needs “prior HER2 therapy,” “prior CDK4/6,” “progressed on endocrine therapy,” etc. | Prior therapy DataRequirements plus optional `OncologyPriorTherapySummary` |
| Staging constraints | mCODE supports AJCC/TNM, but PA needs clear rules for stage group vs T/N/M, clinical vs pathologic, AJCC edition, and currentness | Breast cancer PA staging slice in `Library.dataRequirement[]` |
| Biomarker normalization | ER/PR/HER2 exist as observations, but PA needs normalized values | Breast-specific value sets and result normalization rules |
| Exception documentation | Needed when a regimen is appropriate despite missing/failed preferred criteria | DTR QuestionnaireResponse plus exception/contraindication profile |
| Data requirements publication | Need cancer-specific, reusable requirements for CRD and DTR | `Library.dataRequirement[]` profile, e.g. `BreastCancerPADataRequirementsLibrary` |

---

## Suggested `Library.dataRequirement[]` categories for breast cancer

| Requirement group | DataRequirement type | Profile / filter direction |
|---|---|---|
| Primary cancer condition | `Condition` | `mcode-primary-cancer-condition`; breast cancer value set |
| AJCC TNM stage group | `Observation` | `mcode-tnm-stage-group`; require clinical/pathologic stage group as applicable |
| TNM component categories | `Observation` | `mcode-tnm-primary-tumor-category`, `mcode-tnm-regional-nodes-category`, `mcode-tnm-distant-metastases-category` where decision logic requires T/N/M detail |
| Cancer staging method | `Observation.method` | mCODE TNM staging method value set; specify accepted AJCC edition(s) |
| ER status | `Observation` | `mcode-tumor-marker-test`; ER value set |
| PR status | `Observation` | `mcode-tumor-marker-test`; PR value set |
| HER2 status | `Observation` | `mcode-tumor-marker-test`; HER2 value set, method/interpretation |
| Disease status | `Observation` | `mcode-cancer-disease-status`; especially metastatic/progression contexts |
| Performance status | `Observation` | `mcode-ecog-performance-status` or Karnofsky alternative |
| Prior cancer therapy | `MedicationStatement`, `MedicationAdministration`, `MedicationRequest` | mCODE cancer-related medication profiles |
| Ordered regimen | `RequestGroup` | New `AntiCancerRegimenRequestGroup` |
| Line of therapy | `RequestGroup.extension:category/lineOfTherapy` | Profiled Da Vinci CRD `ext-request-category`, with a required `TreatmentLineVS` binding |
| Treatment setting | `RequestGroup.extension:category` | Da Vinci CRD `ext-request-category` |
| Genomics, conditional | `DiagnosticReport`, `Observation` | mCODE genomics report / genomic variant where applicable |
| Exception evidence | `QuestionnaireResponse`, `DocumentReference`, `Condition`, `AllergyIntolerance` | DTR-driven fallback and structured exception profile |

---

## Example staging `DataRequirement` entries

### AJCC TNM stage group

```json
{
  "type": "Observation",
  "profile": [
    "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-stage-group"
  ],
  "codeFilter": [
    {
      "path": "method",
      "valueSet": "http://hl7.org/fhir/us/mcode/ValueSet/mcode-tnm-staging-method-vs"
    }
  ]
}
```

### TNM component categories

```json
[
  {
    "type": "Observation",
    "profile": [
      "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-primary-tumor-category"
    ]
  },
  {
    "type": "Observation",
    "profile": [
      "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-regional-nodes-category"
    ]
  },
  {
    "type": "Observation",
    "profile": [
      "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-distant-metastases-category"
    ]
  }
]
```

---

## Summary

mCODE can represent many of the underlying clinical facts needed for breast cancer PA, including primary cancer condition, tumor marker tests, TNM stage group, T/N/M categories, disease status, performance status, genomics, and cancer-related treatment events.

The missing layer is not a wholesale replacement for mCODE. The missing layer is a breast cancer PA-specific `DataRequirement` package that specifies:

1. Which mCODE / US Core elements are required.
2. Which requirements are conditional by treatment setting.
3. When stage group is sufficient versus when T/N/M components are required.
4. How to distinguish clinical and pathologic staging.
5. Which biomarker results must be normalized.
6. How to represent line of therapy, treatment setting, regimen identity, and exception documentation.

This supports a reusable CRD/DTR pattern:

```text
CRD evaluates whether the required patient context is present.
DTR collects or prepopulates missing patient context.
PAS submits the authorization package when PA is still required.
```

---

## References

- mCODE TNM Stage Group Profile: https://build.fhir.org/ig/HL7/fhir-mCODE-ig/StructureDefinition-mcode-tnm-stage-group.html
- mCODE TNM Staging Method Value Set: https://build.fhir.org/ig/HL7/fhir-mCODE-ig/ValueSet-mcode-tnm-staging-method-vs.html
- mCODE Disease Characterization: https://build.fhir.org/ig/HL7/fhir-mCODE-ig/group-disease.html
- mCODE Tumor Marker Test Profile: https://build.fhir.org/ig/HL7/fhir-mCODE-ig/StructureDefinition-mcode-tumor-marker-test.html
- mCODE Artifacts Summary: https://build.fhir.org/ig/HL7/fhir-mCODE-ig/artifacts.html
