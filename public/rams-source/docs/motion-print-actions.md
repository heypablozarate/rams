# Local print-room actions

Read each item's exact props and dependencies in `rams.json` before composing it. Import `styles.css` once; these examples use local state and original worksheet content.

- `motion-hold-to-confirm`: marks a sample proof after a 900 ms fill from rest. Early release rewinds; repressing while it rewinds resumes the current progress. Reset the controlled confirmed value to return to the initial state.
- `motion-confirm-morph`: asks before removing one visible proof note. Confirm removes the actual local item; Undo restores its exact previous text. The sample disables question/result timeouts and does not imitate a network request.
- `motion-shortcut-recorder`: records a normalized physical-key chord. It stores a local value; it does not register an operating-system binding. Preserve clear/reset and Escape behavior.
- `motion-expanding-search`: filters four manifest entries by title, metadata and keywords. Group headings organize results but are not searched. Selection returns the actual item rather than navigating or contacting a service.
- `motion-file-dropzone`: accepts SVG/PNG MIME types and two rows, with a 64 KiB size check. Oversized matching files remain failed rows and consume a slot until removed. Without `onUpload`, valid rows are local selections, not uploaded files.
- `motion-reactions`: maintains fictional local acknowledgment counts and the viewer's reacted state. Reset restores the original counts; no people, accounts or shared service are implied.

Keep consequences next to their action, preserve complete labels at enlarged text sizes, and retain keyboard focus through local state changes. File type/size checks do not establish artwork safety or print readiness.
