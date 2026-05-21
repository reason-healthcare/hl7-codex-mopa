# Product

## Register

product

## Users

Oncology developers and clinical staff running demos of the OGCA workflow. Primary context: a clinician or developer at a workstation, stepping through an oncology prior-authorization scenario — order entry, CDS guidance, PA submission. They need the clinical workflow to feel real enough that demo audiences trust the interactions without being distracted by the UI itself.

## Product Purpose

Reference implementation of the Oncology Guideline-Compliant Authorization (OGCA) workflow across six actors: EHR, CDS SMART App, CRD Service, DTR Client, PAS Service, and Payer Backend. The EHR app specifically simulates a clinical order-entry surface that integrates CDS Hooks guidance and prior-authorization submission. Success means a developer or clinician can demo the full workflow without the UI getting in the way.

## Brand Personality

Institutional, familiar, honest. Three words: clinical, trustworthy, neutral. No delight for its own sake — every affordance earns its place by reducing cognitive load during a complex clinical workflow.

## Anti-references

- Not a SaaS startup product (no gradients, hero metrics, or marketing patterns)
- Not a React admin template (no Ant Design or MUI clichés)
- Not Epic-green or Cerner-blue as a literal clone — neutral institutional palette, not a specific vendor's brand
- Not dark mode — clinicians at workstations in lit rooms during business hours

## Design Principles

1. **Workflow over chrome.** Every visual element should accelerate the clinical task, not decorate it. If it doesn't help the user decide or act, remove it.
2. **Consistency signals trustworthiness.** CDS guidance from remote systems must look consistent and clearly attributed — a clinician needs to know at a glance that a card came from an external system, what it says, and what to do about it.
3. **Hierarchy through restraint.** Use scale, weight, and whitespace to create clear reading order. Avoid color as the only differentiator.
4. **Reference quality.** This is a demo artifact. It should look convincing enough that audiences focus on the OGCA workflow, not the UI. Aim for the visual quality of a good EHR training environment.
5. **Accessible by default.** Sufficient contrast, keyboard-navigable interactions, no color-only status indicators. Target WCAG 2.1 AA.

## Accessibility & Inclusion

WCAG 2.1 AA target. CDS indicator colors (info/warning/critical) must pair color with icon or text label — never color alone. Sufficient contrast on all interactive elements.
