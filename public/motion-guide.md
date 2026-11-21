# Motion

The [complete Badge specification](/motion-spec-badge.json) shows how to write a concrete specification without confusing a test plan with observed results. [Host exceptions](/motion-host-exceptions.json) supplement the component inventory: they preserve native completion events and unit conversions, not exemptions from the rules.

Choose motion by function: feedback, enter, exit, replace, selection, resize, identity, presentation, data, or activity. The `/#/motion` page shows interactive examples and their specifications. `/#/foundations?section=motion` retains the previous entry point.

## Authority and scope

This is RAMS policy: a synthesis and adaptation of primary sources, with decisions specific to this system. The earlier principles had the same status; they were not a formal standard published by the source libraries. Code provenance is retained in legal documentation and source records; it does not determine design authority.

`scripts/motion-guidelines.mjs` is the editable source for rules, references, specifications, and acceptance criteria. `/motion.json` publishes this information under `guidelines` as an additive extension to schema 1. The UI and agents must read the same contract. `tokens.json/componentExtensions.details.motionTS` remains the only source of values. The 160/240 ms timings and 35/140 ms limits are RAMS decisions, not external requirements; there is no general rule that everything must animate for at least 500 ms.

The policy applies to components, variants, compositions, previews, portable recipes, wrappers, portals, CSS, and imperative or chart engines. Sharing tokens is necessary, but does not by itself show that a transition is coordinated correctly. A guide example does not verify the rest of the catalog either.

## Sources and decisions

The sources were consulted on October 26, 2026. Each rule publishes `sourceIds`; an empty list identifies an integration decision made for this project, without external attribution. RAMS rules are normative within this project; the sources retain their original scope.

| Primary source | What it contributes and does not claim |
| --- | --- |
| [Carbon: overview](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) and [choreography](https://www.carbondesignsystem.com/building-blocks/foundations/motion/choreography) | Principles for purpose, continuity, and sequencing. RAMS does not adopt its values or all of its trajectory constraints. |
| [Fluent 2: motion](https://fluent2.microsoft.design/motion) | Criteria for purpose, size, distance, and coordination. It does not specify RAMS tokens. |
| [WCAG 2.2 SC 2.3.3, AAA](https://www.w3.org/TR/WCAG22/#animation-from-interactions) and [WAI explanation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | The criterion allows disabling interaction-triggered motion except when essential; the explanation is informative. Adopting this policy does not certify the product at AAA level. |
| [WCAG 2.2 SC 2.2.2, A](https://www.w3.org/TR/WCAG22/#pause-stop-hide) and [WAI explanation](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | When moving, blinking, or scrolling information starts automatically, continues beyond five seconds, and accompanies other content, let users pause, stop, or hide it unless essential. Automatic information updates alongside other content need one of those controls or a frequency control, unless essential; there is no five-second threshold. |
| [WAI APG: modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Focus and keyboard pattern for modal dialogs. It does not require an animation curve. |
| [Motion: accessibility](https://motion.dev/docs/react-accessibility) and [layout](https://motion.dev/docs/react-layout-animations) | Engine capabilities and limits. They do not set an aesthetic standard or replace review of the installed version and its consumers. |

## Required specification for people and agents

Before implementing or changing a transition, describe these fields. The value `none` requires a reason; omitting a field does not show that it is inapplicable. A component without animation can retain and document that decision.

| Contract field | What to specify |
| --- | --- |
| `trigger` | Exact event, human/system/data origin, condition, and repetition. |
| `states` | Initial state, functional destination, visual end state; applicable empty, loading, error, and cancellation cases. |
| `object` | Object identity, component, slot/selector, and composition. |
| `properties` | Each property, start, destination, and unit; how it derives from layout. |
| `role` | Role chosen by purpose and token references, without copying literals. |
| `geometry` | Who measures and animates; relationship to ancestors, clipping, and scrolling. |
| `sequence` | Dependencies, start time for parts, maximum count, and wait limit. |
| `interruption` | What happens on new input, to old callbacks, and on unmount. |
| `reducedMotion` | Result when reduced motion is enabled on load and during the transition, for each engine. |
| `focus` | Focus, keyboard behavior, accessible states, exiting elements, and modal background. |
| `repetition` | Start, end, persistent pause, static alternative, and evaluation of automatic updates. |
| `evidence` | Check IDs, consumer/version, environment, expected and observed results, and status. |

For example, in a disclosure: pointer or keyboard activation changes `closed` to `open`; the container owns `height: 0 → auto` with `resize`; the trigger retains focus and updates `aria-expanded` immediately; closed content is no longer operable. There is no stagger or repetition. A second activation retargets to the latest destination. With reduced motion, apply the final height without waiting. The specification must cite the actual paths and record tests for open-close-open, keyboard use, long content, and changing the preference midway through the transition. Do not report these tests as run until you have observed them.

## Acceptance rules

`MUST` is required to accept a RAMS change; `SHOULD` is a strong recommendation whose deviation requires a reason and evidence. Severity describes impact: `critical` affects operation, information, focus, control, or reduced-motion support; `major` affects contract, consistency, geometry, or evidence; `advisory` requires contextual review. These labels are not WCAG levels.

| ID | Level | Required outcome |
| --- | --- | --- |
| RAMS-M01 | MUST | Complete specification for each transition and an identifiable owner. |
| RAMS-M02 | MUST | Role chosen by function and identity. |
| RAMS-M03 | MUST | Shared values, correct units, and exact exceptions. |
| RAMS-M04 | MUST | Declared properties; reading and operation remain usable. |
| RAMS-M05 | MUST | One owner for each geometric change and reviewed continuity. |
| RAMS-M06 | MUST | Bounded sequences, including for long lists and text. |
| RAMS-M07 | MUST | Latest intent takes effect; no stale callbacks. |
| RAMS-M08 | MUST | Immediate reduced-motion behavior on load and during animation in every engine. |
| RAMS-M09 | MUST | Focus, keyboard behavior, and semantics match the functional state. |
| RAMS-M10 | MUST | Repetition is justified, can end, and can be controlled as applicable. |
| RAMS-M11 | MUST | Data and results are available without waiting for the effect. |
| RAMS-M12 | SHOULD | Subtle motion for frequent tasks; justified emphasis. |
| RAMS-M13 | MUST | Evidence per consumer, without extrapolating coverage. |

The full normative text and each observable procedure are in `/motion.json → guidelines.rules[].acceptance`. `guidelines.roles` explains when to use and avoid each role, recommended properties, the reduced-motion alternative, and invariants. `guidelines.verification` defines the record format and scenarios. An agent must cite the applicable ID, implement the transition, and run its checks; it must not turn this table into a checklist marked complete by default.

## Source and consumption

The only editable source for durations, curves, springs, and sequences is `tokens.json/componentExtensions.details.motionTS`. Run `npm run tokens` to generate `src/variants/motion-tokens.ts`, CSS aliases in `src/variants/foundations.css`, and `/motion.json`. Do not edit those outputs. The contract uses the local `rams-motion` schema, version 1; it does not claim DTCG or MCP compatibility.

Import `src/variants/foundations.css` and then `src/baseline/motion.css`, along with the theme and other foundations. Retain `src/variants/motion-policy.ts` and its tokens. Both core and variant-core include this integration in the registry. Original components remain intact: CSS applies roles through their data slots, including in portals. Dependencies that animate data with JavaScript need their own reduced-motion props; CSS does not control that interpolation.

```tsx
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motion } from "motion/react";
export default function MotionExample() {
  const reduced = Boolean(useReducedMotion());
  return <motion.div initial={reduced ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={motionTransition("enter", reduced)} />;
}
```

`motionTransition` resolves the role and returns zero duration when reduced motion is active. `motionDelay` bounds cumulative wait time. The portable `use-motion-preference` hook subscribes to system preference changes during the session; do not assume a same-named hook in any engine version rerenders when that preference changes. For imperative animation, `observeReducedMotion` also reports preference changes and returns a cleanup function; cancel the controller and apply the final value when the preference changes. `createMotionTransaction` cancels registered controllers and invalidates callbacks from previous interactions. Include the hook and runtime in the portable recipe.

## Orchestration

In a morph using `layout`, the engine interpolates with scale. Reading content needs compensation (`layout="position"` on the Motion child) to retain its proportions. Pass the numeric radius from `useShapeRadius("panel")` to the animated node through `style.borderRadius`: a radius defined only in CSS does not enable the engine’s scale correction. Retain the shape role; do not copy its value in pixels. Verify text and effective horizontal/vertical radii halfway through the transition and in reverse; correct endpoints do not prove the transition is correct.

Update state and accept the next input without waiting for decoration. Assign one owner to each geometric change. Do not fade an ancestor containing a shared-layout object in motion. Do not combine smooth scrolling and morph in the same navigation. Bound item stagger by `sequence.maxStagger`; text presentation uses `sequence.textBudget`. These are wait limits before starting, not universal limits on total duration. Handoff offsets belong to the sequence and are removed with reduced motion.

Controls use feedback; surfaces use enter/exit; indicators use selection; disclosures use resize; shared objects use morph. Visual springs are not business timers. Do not defer a confirmation, result, or numeric value until an animation completes. Retain focus and keyboard navigation; disable interaction with exiting content.

## Reduced motion and repetition

Respect `prefers-reduced-motion` on load and during interaction. Remove translation, blur, stagger, decorative autoplay, and smooth scrolling. Show the final state and retain progress or activity information. RAMS chooses zero duration, including for opacity, for this alternative; merely shortening the same trajectory is insufficient. MotionConfig with reducedMotion="user" is an additional safeguard; it does not replace component, imperative-animation, or CSS branches. The local preference on the examples page affects only those samples; it does not simulate or override the system preference.

Repeated activity needs a real state and a static alternative. Samples start explicitly; rotating content must offer pause or start paused. AnnouncementBar starts without autoplay; enabling autoPlay also shows its pause controls. Marquee retains its pause control. Clocks and data continue updating when decorative motion is disabled.

## Exceptions and maintenance

`public/motion-exceptions.json` lists specific retained properties: physical parameters/derivations and continuous mark travel. Each entry includes a file, property, evidence, and reason; there are no permissions by folder or wildcard. This numeric inventory does not establish a design exception, essentiality, or visual review. Business wait times (toast, tooltip, debounce, hold, clock) are not decorative durations and are retained. Do not add isolated numbers: resolve the role or document a specific exception.

Record a policy deviation alongside the consumer specification using `guidelines.exceptions.requiredDeviationFields`: rule, exact scope, reason, considered alternative, reduced motion, focus/input, evidence, reviewer, date, and revisit condition. Its status starts as `proposed`; do not mark it `accepted` without review. A local deviation does not redefine WCAG or remove a critical failure. Activity can be considered essential only because of its function or information, not aesthetic preference. Changing the consumer or review condition invalidates any extrapolation of the permission.

`scripts/component-motion.json` records reproducible adaptations after component-review. Before/after hashes detect unexpected changes. `tests/motion-contracts.test.mjs` checks value parity, direct-number closure against exceptions, portability, interruption, and replay of changes; it does not certify visual quality. Also verify filters, pagination, reader/return behavior, gestures, final values, pause, focus, themes, and actual sizes. Limitations of external libraries require specific validation, not a generic promise.

Record each check as `pass`, `fail`, `not-tested`, or `not-applicable`, with a reason. Include version, browser/viewport, theme/density/preference, steps, expected and observed results, and evidence. Complete fields and scenarios are in `guidelines.verification`; automated checks cover only what they actually inspect. A report that did not observe every consumer must name its sample and outstanding limits. Published specifications and cases are instructions, not QA results.

## Integration charts

The three original Recharts examples retain their bytes. `npm run registry`, through `scripts/motion-chart-previews.mjs`, generates host adapters that apply `useChartMotion()` to each Bar, Area, and Line. Use this hook when integrating your own series: it passes `isAnimationActive`, `animationDuration`, `animationBegin`, and `animationEasing`. The data role uses ease-out because Recharts accepts named curves rather than Motion’s tuple; this is an explicit engine adaptation. When reduced motion is enabled, the series stops interpolating and shows its final values. The Drawer preview applies the same hook to its bars. Code and recipes show the adapter alongside its original source.

The native Accordion uses the resize role in both states: the visual duration of the smooth spring and a CSS `linear()` curve that approximates its settling. In browsers without `linear()`, it uses the standard curve as a fallback. This is a visual CSS approximation, not a simulation of physical velocity. The adapter takes precedence over the original utilities without modifying their files.
