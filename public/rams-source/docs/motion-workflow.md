# Print-room workflow examples

Install each exact item from `rams.json` and import its relative module. Import `styles.css` once. The examples use local data and English labels; no workshop service is connected.

- `motion-usage-meter`: three paper categories total 11.7 kg against a 16 kg allocation. The keyboard legend highlights or pins a category; labels and amounts identify the segments independently of color.
- `motion-onboarding-checklist`: four booklet setup tasks with paper stock initially complete. Check/uncheck tasks, open their descriptions, and hide/show the checklist. Completion records local interaction only.
- `motion-timeline`: four fixed worksheet events on September 18, 2026, with explicit Buenos Aires time and a fixed reference time. Details open in place; no activity feed or authorship is implied.
- `motion-stepper`: a controlled four-stage booklet sequence. Back/Continue own the current index, and completed steps can be revisited. Completion is navigation state, not print-job execution.
- `motion-countdown`: illustrative November 20, 2026 at 09:00 in `America/Argentina/Buenos_Aires`. Device time drives the timer. Supply a trusted clock if the real application requires it; this sample is not a booking.
- `motion-password-strength`: local length, mixed-case, number and symbol rules. It does not implement server policy or account creation. Use sample text rather than a real credential.

Keep complete labels and browser text enlargement. Preserve the component's keyboard and focus behavior, reduced-motion preference, accessible values, and visible state boundaries. Inspect the exported props before adding application-specific behavior.
