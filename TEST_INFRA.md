# E2E Test Infra: Tarefus Pricing & Guide Strategy

## Test Philosophy
- Opaque-box, requirement-driven, zero-side-effect testing.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Interaction + Real-World Workload Simulation.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Plan Pricing & Seat Limits (Equipe, Crescimento, Escala) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Monthly vs Annual Billing Toggle (Discounts & Installments) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Interactive Savings Calculator (3 to 35+ seats, USD math) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Feature Comparison Matrix & FAQ Accordion | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | 12 Strategic Guide Articles Catalog Completeness | ORIGINAL_REQUEST §R3 | 12 | 5 | ✓ | ✓ |
| 6 | Guide Search & Category Filters | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 7 | Guide Article Viewer (TOC, Callouts, Related Articles, CTAs) | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | Public Routing & App/Help Center Navigation Links | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 9 | Responsive Design & Light/Dark Theme Integration | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Runner**: `npx tsx <test_file>` providing instant (<50ms) execution with zero config bloat.
- **Test Files**:
  - `tests/pricing_unit.test.ts`: Tiers 1-2 unit and boundary tests for pricing and savings math.
  - `tests/guide_catalog.test.ts`: Tiers 1-2 tests for 12 articles schema, TOC, search and filtering.
  - `tests/routing_theme_integration.test.ts`: Tier 3 cross-feature and routing tests.
  - `tests/adversarial_e2e_suite.test.ts`: Tier 4 & 5 adversarial fuzzing, boundary stress, and negative edge cases.
- **Pass/Fail Semantics**: All test suites must exit with code 0 and report 0 failed assertions.

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥ 45 test assertions verifying happy paths across all features in isolation.
- **Tier 2 (Boundary & Corner Cases)**: ≥ 45 test assertions covering seat limits (3, 5, 6, 15, 16, 35, 36, 100), empty search, special characters, non-existent slugs.
- **Tier 3 (Cross-Feature Combinations)**: Verification of billing toggle + calculator interactions, search + category filters combination, theme toggle across all public pages.
- **Tier 4 (Real-World Application Scenarios)**: Realistic end-to-end user navigation flows from landing -> calculator -> trial CTA, and landing -> search article -> TOC reading -> related article click.
- **Tier 5 (Adversarial Coverage Hardening)**: White-box challenger fuzzing on mathematical rounding, injection protection, and state transitions.
