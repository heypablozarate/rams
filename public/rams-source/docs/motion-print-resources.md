# Local proof files

`motion-file-upload` selects files through a keyboard-operable picker or a drop target. Set `accept` and `maxSize` to the accepted formats and byte limit. Invalid files stay visible with their error and can be removed. `value` and `onValueChange` allow the caller to own selection. Without `onUpload`, rows represent local selection only; no transfer or persistence is claimed.

For an actual transfer, provide `onUpload(file, { onProgress, signal })`. Resolve only after the work completes, reject to show failure, and respect its abort signal when a file is removed or the component unmounts. Progress reports are clamped from 0 to 100 and cannot move backward. Retry uses the same supplied callback; RAMS does not supply a storage service.

The original sample creates a valid SVG cover-rule study and a text trim checklist in browser memory. These are fictional print-review files, not production-ready press specifications. No external photos or portraits are included.

`motion-chat-thread` owns object URLs for attachments it creates when appending uncontrolled local messages and revokes those URLs when the thread unmounts. Pending image previews belong to the composer and are released when removed, sent or unmounted. URLs passed in caller-controlled/default message data remain owned by the caller. A local message state is not server delivery.
