# features/classification

Utilities for parsing, validating, normalizing, and formatting classification markings.

Classification enforcement can be enabled or disabled. When disabled, items use the unrestricted classification. Classification levels are ordered from less restrictive to more restrictive by their numeric level.

## Responsibilities

- Parse classification strings into structured display data
- Normalize classification strings according to level, required token, group, and subgroup rules
- Determine whether a user classification can access a classification marking
- Combine classifications into the most restrictive valid classification
- Format classification levels and components for short and long displays

## Classification Components

- **Levels** define the restriction order. Higher numeric values are more restrictive.
- **Required tokens** require a user to have every token included in a classification.
- **Groups** require a user to belong to at least one selected group.
- **Subgroups** require a user to belong to at least one selected subgroup.
- **Auto-selected groups** are added when a classification contains a group.
- **Required groups** add their associated group when selected.
- **Limited groups** restrict a subgroup to its associated group.
- **Solitary display names** provide an alternate marking when a group is selected alone.
- **Hidden entries** remain available in the definition but are omitted from classification picker options.

## Key Files

- `classification.models.ts` — Classification types and default values
- `classification.utils.ts` — Classification parsing, validation, normalization, and access utilities
- `classification.utils.test.ts` — Unit tests for classification utilities
