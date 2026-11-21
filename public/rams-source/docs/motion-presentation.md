# Presentation and identity

These optional recipes compose owned RAMS primitives. Install motion-progress, motion-skeleton, motion-badge, motion-empty-state, motion-avatar or motion-avatar-group with tools/install.mjs. Use its returned packages; Motion13.4.0 and CSS Modules are required, and Progress/Empty State use LucideReact1.47.0. React19.2.4 with Vite is the verified consumer.

Progress accepts value, max, label and showValue. Value and max use the same units; the native progress element carries the target information, while a decorative bar and percent follow it. Missing values start at zero; nonfinite input falls back to zero and an invalid maximum to 100. Label the actual task and derive its value from that task.

Skeleton accepts lines, avatar, label and optional children/loading. Without children it stays a labelled placeholder. With children, loading switches between placeholder and content. Decorative blocks are hidden from assistive technology. The pulse is finite and stops for reduced motion.

Badge keeps tone, size and optional icon while its content changes. Keep a complete text label; color and animation supplement it. EmptyState takes title, description, optional icon/action and a region label. Replace it when content exists, and preserve the action's keyboard destination if that replacement removes its focused button.

Avatar accepts name, optional src, size and online/offline status. Native RAMS image/fallback parts handle loading and failed artwork. Initials remain available without an image. The existing optical sizes are 28/36/48/88 px (sm/md/lg/xl); these preserve supplied circular geometry while adjacent descriptions use fluid type. Marks may identify resources as well as people.

AvatarGroup takes members, max, size and label. Name the collection, keep member names stable, and offer the full collection when an overflow count is shown. max controls visible slots; it does not remove member records. Group size accepts sm/md/lg.

Workshop marks and cover drawings are original SVG artwork. No portrait, outside image or personal logo is required. Adapted widgets retain ARC's MIT notice in licenses/ARC-LICENSE.txt and NOTICE.md; primitives/examples have their separate RAMS attribution. Default public semantic accents are neutral unless consumers supply roles such as --rams-success; meaningful labels/icons remain necessary.
