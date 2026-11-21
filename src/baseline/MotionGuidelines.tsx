import { RamsName, RamsText } from "../brand/RamsName";
import guidelines from "./motion-guidelines.json";

export function MotionProvenance() {
  return <section className="motion-policy-panel" aria-labelledby="motion-basis-title">
    <div className="space-y-3">
      <h2 id="motion-basis-title" className="font-medium">Basis and decisions by <RamsName /></h2>
      <p className="text-sm text-muted-foreground">These guidelines combine recommendations from Carbon and Fluent, W3C accessibility requirements, and documentation for the Motion engine. Role selection, timings, and exact limits are decisions by <RamsName />; those sources do not set the numeric values.</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {guidelines.sources.filter(source => ["carbon-overview", "carbon-choreography", "fluent-motion", "wcag-233", "wcag-222", "motion-accessibility"].includes(source.id)).map(source => <a key={source.id} href={source.url} className="underline"><RamsText>{source.title}</RamsText></a>)}
      </div>
    </div>
  </section>;
}

export function MotionGuidelines() {
  return <>
    <section className="space-y-4" aria-labelledby="motion-spec-title">
      <h2 id="motion-spec-title" className="text-xl font-semibold">Specify the microinteraction</h2>
      <p className="text-muted-foreground">Before implementation, describe the trigger, the functional change, and its visual response. Each specification must address these fields. When something does not apply, write <code>none</code> and explain why.</p>
      <p><a className="underline" href="/motion-spec-badge.json">View a complete specification: Badge state change</a></p>
      <dl className="motion-spec-fields">{guidelines.specification.requiredFields.map(field => <div key={field.name}><dt><code>{field.name}</code></dt><dd><RamsText>{field.description}</RamsText></dd></div>)}</dl>
    </section>
    <section className="space-y-4" aria-labelledby="motion-role-use-title">
      <h2 id="motion-role-use-title" className="text-xl font-semibold">Apply the role in context</h2>
      <p className="text-muted-foreground">Sharing a duration does not make two interactions equivalent. The role describes the meaning; context determines which element changes and what must remain stable.</p>
      <div className="motion-rule-list">{guidelines.roles.map(role => <details key={role.name} className="motion-rule"><summary><code>{role.name}</code><span><RamsText>{role.when}</RamsText></span></summary><div className="motion-rule-body"><p><RamsText>{role.behavior}</RamsText></p><p><strong>Properties: </strong><RamsText>{role.properties.join("; ")}</RamsText>.</p><p><strong>Avoid: </strong><RamsText>{role.whenNot}</RamsText></p><p><strong>With reduced motion: </strong><RamsText>{role.reduced}</RamsText></p><ul>{role.invariants.map(item => <li key={item}><RamsText>{item}</RamsText></li>)}</ul></div></details>)}</div>
    </section>
    <section className="space-y-4" aria-labelledby="motion-rules-title">
      <h2 id="motion-rules-title" className="text-xl font-semibold">Implementation and acceptance rules</h2>
      <p className="text-muted-foreground"><strong>MUST</strong> indicates a mandatory requirement from <RamsName />. <strong>SHOULD</strong> allows a justified alternative. These apply to components, previews, compositions, portals, and portable code; using tokens alone does not prove that an animation is properly implemented.</p>
      <div className="motion-rule-list">{guidelines.rules.map(rule => <details className="motion-rule" key={rule.id}><summary><span className="motion-rule-id">{rule.id} · {rule.level}</span><strong><RamsText>{rule.title}</RamsText></strong></summary><div className="motion-rule-body">
        <p><RamsText>{rule.requirement}</RamsText></p><p className="text-muted-foreground"><RamsText>{rule.rationale}</RamsText></p>
        <h3 className="font-medium">How to verify</h3><ol>{rule.acceptance.map(check => <li key={check.id}><code>{check.id}</code> <RamsText>{check.instruction}</RamsText><p className="text-muted-foreground">Expected result: <RamsText>{check.expected}</RamsText></p></li>)}</ol>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{rule.sourceIds.map(id => {const source=guidelines.sources.find(item=>item.id===id);return source ? <a className="underline" key={id} href={source.url}><RamsText>{source.title}</RamsText></a> : null;})}{rule.sourceIds.length===0 && <p className="text-sm text-muted-foreground">Decision by <RamsName />.</p>}</div>
      </div></details>)}</div>
    </section>
    <section className="motion-policy-panel"><div className="space-y-3"><h2 className="font-medium">Evidence, exceptions, and scope</h2><p className="text-sm text-muted-foreground">Each verification records the consumer, version, environment, steps, observed result, and evidence. Use pass, fail, not-tested, or not-applicable with a reason. A static test does not replace visual review or turn a pending test into a passing one.</p><p className="text-sm text-muted-foreground">Numeric exceptions identify specific expressions; they are not permission to ignore interaction, focus, or accessibility. Every deviation needs a scope, rule, reason, alternative, review, and reevaluation condition. This system does not declare full WCAG conformance.</p></div></section>
  </>;
}
