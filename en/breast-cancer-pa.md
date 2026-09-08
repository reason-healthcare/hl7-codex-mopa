# Use Case 1: Breast Cancer PA - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Use Case 1: Breast Cancer PA

### Context

This page defines **Use Case 1** — the first concrete instantiation of the MOPA data requirements pattern for a specific cancer type. It serves as the template for subsequent use cases (lung, colorectal, hematologic malignancies, and others). Each future use case follows the same structure: a cancer-specific set of data requirements with mCODE coverage assessment, gap analysis, and recommended profiles.

### Scope

This use case covers systemic anti-cancer therapy authorization for breast cancer, including:

* Early-stage (adjuvant and neoadjuvant) chemotherapy and targeted therapy
* Metastatic breast cancer systemic therapy (all lines)
* HER2-directed therapy, endocrine therapy, CDK4/6 inhibitors, PARP inhibitors, immunotherapy (PD-L1+), and antibody-drug conjugates

### Important Note on Staging

mCODE supports AJCC/TNM-based staging through cancer stage and TNM-specific profiles. The gap for breast cancer PA is **not** basic staging representation. The gap is PA-specific profiling:

* Whether **clinical stage** or **pathologic stage** is required
* Whether the **AJCC stage group** is sufficient or T/N/M components are needed
* Which **AJCC edition / staging method** is acceptable
* How staging is linked to the primary breast cancer condition and evidence source
* How to distinguish **current disease state** from historical diagnosis stage

### Breast Cancer PA Data Requirements

The breast cancer PA use case targets SNOMED CT code `254837009 "Malignant tumor of breast"`.

#### Required data categories

| | | | | |
| :--- | :--- | :--- | :--- | :--- |
| **Diagnosis** | Primary breast cancer condition | `mcode-primary-cancer-condition` | Strong | Add breast cancer value set binding and laterality expectation |
| **Staging** | AJCC TNM stage group | `mcode-tnm-stage-group` | Strong foundation | Constrain to clinical or pathologic stage; specify accepted AJCC edition |
| **Staging** | T / N / M categories | `mcode-tnm-primary-tumor-category`,`mcode-tnm-regional-nodes-category`,`mcode-tnm-distant-metastases-category` | Strong foundation | Require when stage group alone is insufficient for authorization logic |
| **Biomarkers** | ER status | `mcode-tumor-marker-test` | Strong foundation | Bind to breast-specific ER value set; normalize positive/negative/percent |
| **Biomarkers** | PR status | `mcode-tumor-marker-test` | Strong foundation | Same as ER |
| **Biomarkers** | HER2 status | `mcode-tumor-marker-test` | Strong foundation | Distinguish IHC vs ISH/FISH; consider HER2-low profile |
| **Disease status** | Current disease status / progression | `mcode-cancer-disease-status` | Strong foundation | Require evidence date and prior treatment association |
| **Regimen** | Ordered anti-cancer regimen | `AntiCancerRegimenRequestGroup` | **New — defined in this IG** | MVP artifact;`instantiatesCanonical`→ PlanDefinition |
| **Performance** | ECOG performance status | `mcode-ecog-performance-status` | Strong | Conditional — add lookback period guidance |
| **Therapy history** | Prior systemic therapy | mCODE cancer-related medication profiles | Strong for events | Add class-based value sets for HER2-directed, endocrine, CDK4/6, taxane, anthracycline |
| **Therapy context** | Line of therapy | Profiled Da Vinci CRD`ext-request-category` | CRD context expansion proposed; mCODE order semantics need guidance | Carry`lineOfTherapy`on RequestGroup with the required`TreatmentLineVS`binding |
| **Therapy context** | Treatment setting / intent | Da Vinci CRD`ext-request-category` | CRD context expansion proposed | Carry the patient-specific category on`AntiCancerRegimenRequestGroup` |
| **Genomics** | BRCA1/2 status | `mcode-genomic-variant`,`mcode-genomics-report` | Partial | Require germline vs somatic distinction; conditional for PARP inhibitor authorization |
| **Exceptions** | Contraindication / intolerance | `AllergyIntolerance`,`Condition` | Partial | Define exception profile with reference to avoided drug/regimen |
| **Exceptions** | Exception documentation | DTR`QuestionnaireResponse` | Generic | Drive from DTR when structured evidence is unavailable |

### Priority Gaps

| | | |
| :--- | :--- | :--- |
| Regimen as first-class object | Oncology PA is regimen-centered, not drug-order-centered | `AntiCancerRegimenRequestGroup`(MVP) +`AntiCancerRegimenPlanDefinition` |
| Line of therapy | Required for metastatic sequencing and payer policy | `RequestGroup.extension:category/lineOfTherapy`, profiled from the CRD Request Category and bound to`TreatmentLineVS` |
| Treatment setting | Most breast cancer logic branches by setting | Patient-specific CRD`ext-request-category`on RequestGroup |
| Staging constraints | PA needs clinical vs pathologic stage, T/N/M, AJCC edition | Breast cancer PA staging guidance |
| Biomarker normalization | ER/PR/HER2 observations need PA-ready normalized values | Breast-specific value sets and result normalization rules |
| Exception documentation | Needed when guideline-concordant care requires exception | DTR`QuestionnaireResponse`+ structured exception/contraindication profile |

### See Also

* [Regimen Modeling](regimen-model.md) — `RequestGroup` and `PlanDefinition` profiles
* [Data Requirements](data-requirements.md) — Oncology data categories queried during CRD evaluation
* [Da Vinci Gap Proposals](davinci-gap-proposals.md) — CRD, DTR, and PAS backlog items
* [mCODE Gap Proposals](mcode-gap-proposals.md) — data model backlog items
* [mCODE STU4](http://hl7.org/fhir/us/mcode) — mCODE profiles referenced throughout

