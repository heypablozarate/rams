import { useId, useMemo } from 'react';
import { foundationRoles } from './foundation-roles';

export function ColorPalette({ colors, brandColor }: { colors: Record<string, string>; brandColor: string }) {
  const id = useId();
  const byId = new Map<string, (typeof foundationRoles)[number]>(foundationRoles.map(role => [role.id, role]));
  const brandHex = useMemo(() => {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) return '';
    context.fillStyle = brandColor;
    context.fillRect(0, 0, 1, 1);
    return '#' + [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('').toUpperCase();
  }, [brandColor]);
  return <section data-color-palette aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="text-xl font-semibold">Color roles</h2>
    <p className="mt-2 text-sm text-muted-foreground">
      Choose a role by its function and use it with its text or surface pairing. Roles that share a color can be customized independently.
    </p>
    <div className="mt-3 flex flex-wrap gap-4 text-sm">
      <a className="underline" href="/foundations-guide.md">Customize colors</a>
      <a className="underline" href="/design-system.json">Role reference · JSON</a>
    </div>
    <p className="mt-3 text-sm font-medium">{foundationRoles.length} semantic roles</p>
    <div data-color-grid className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
      {foundationRoles.map(role => <div key={role.id} data-color-role-card data-role-id={role.id} className="flex items-start gap-3 rounded-xl [border-width:var(--rams-detail-primitive-border-width)] p-3">
        <span data-color-swatch aria-hidden="true" className="size-10 shrink-0 rounded-md [border-width:var(--rams-detail-primitive-border-width)]" style={{ background: role.id === 'brand' ? 'var(--rams-brand-accent)' : `var(--${role.id})` }} />
        <div data-color-body className="min-w-0">
          <h3 data-color-name className="break-words text-sm font-semibold">{role.name}</h3>
          {role.id === 'brand' && <p data-color-value className="mt-1 font-mono text-sm">{brandHex}</p>}
          <p className="mt-1 break-words text-sm text-muted-foreground">{role.description}</p>
          {role.id !== 'brand' && <p data-color-value className="mt-2 break-words font-mono text-xs">{`--${role.id}`}</p>}
          {role.pairWith && <p className="mt-1 break-words text-xs text-muted-foreground">Paired with: {byId.get(role.pairWith)!.name}</p>}
          <p data-color-value className="mt-1 break-words font-mono text-xs text-muted-foreground">{role.id === 'brand' ? brandColor : colors[role.id]}</p>
        </div>
      </div>)}
    </div>
  </section>;
}
