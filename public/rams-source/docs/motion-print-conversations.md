# Print-room conversations

`motion-chat-thread` groups messages in time order and offers a composer and message reactions. Supply participant IDs, an explicit current user and messages with their real timestamps. Use `messages` for controlled data or `defaultMessages` for a local list; uncontrolled sends append locally. Connect delivery and receipt state in the consuming application. The text-only print-room example disables attachments.

`motion-comment-thread` groups review notes with replies, reactions, owner edit/delete actions, mentions and a resolved summary. `comments` and `resolved` can be controlled independently. Pass actual author permissions/data when connecting a service; local sample authors are generic desk labels.

Keep the chat in a bounded, scrollable region with the composer reachable. Comments can grow in the page flow. Preserve keyboard names, focus after actions, readable text enlargement and an equivalent reduced-motion state. These components do not provide a messaging backend or authentication.

Read `rams.json` for exact files/packages and import the shared styles once. Preserve the ARC license and verify the completed composition in its host application.
