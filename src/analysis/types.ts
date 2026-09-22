import type { PersonaResult as SchemaPersonaResult } from "../schema/personaSchema";

export type PersonaResult = SchemaPersonaResult;

export type Field =
  PersonaResult["persona"]["jobTitle"][number];

export type Evidence =
  NonNullable<Field["evidence"]>[number];

export type FieldStatus = Field["status"];

export type Confidence = Field["confidence"];

export type Gap = PersonaResult["gaps"][number];

export type Conflict = PersonaResult["conflicts"][number];
