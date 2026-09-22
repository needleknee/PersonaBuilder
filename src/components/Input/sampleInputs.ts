// Verbatim sample texts from plan.md's "Test Inputs" section (lines ~635-736).
// Text is copied exactly, including original line breaks.

export type SampleId = "sparse" | "rich" | "conflicting";

export type SampleInput = {
  id: SampleId;
  label: string;
  text: string;
};

export const SAMPLE_INPUTS: SampleInput[] = [
  {
    id: "sparse",
    label: "Sparse Input",
    text: `We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets,
and hate long sales calls.`,
  },
  {
    id: "rich",
    label: "Rich Interview Input",
    text: `Jordan leads demand generation at a growing software company and is responsible for launching campaigns with a small team.

Last month, their current planning tool forced them to copy customer insights manually into every campaign brief, which delayed a product launch.

Jordan almost rejected our product because the first demo looked difficult to configure.

They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief without additional research or a long onboarding project.`,
  },
  {
    id: "conflicting",
    label: "Conflicting Input",
    text: `Sales:
Our ideal customer is an enterprise marketing organization with a formal procurement process and multiple regional teams.

Growth:
Our ideal customer is a small or mid-size business with a lean marketing team that can buy and adopt tools quickly.`,
  },
];
