# Date and time controls

Calendar keeps a month grid visible for a weekday sign-off schedule. Its controlled example starts on November 12, 2026 and permits weekdays from November 2 through December 4, so moving between the two months does not silently alter the selected date.

DatePicker chooses a delivery date in November 9–20, 2026. Weekends and the November 12 calibration date are unavailable. Choosing or clearing a date updates the adjacent controlled result; no delivery order is created. When the picker shows “Scroll for more dates,” scroll horizontally or move through dates with the arrow keys.

TimePicker uses local workshop time in 24-hour format. A 30-minute step gives 48 choices from 00:00 through 23:30, initially 14:30. The example does not impose business hours or perform timezone conversion.

DateRangePicker distinguishes its draft from the applied window. Proof week is November 9–13; Press week is November 16–20. Apply commits the draft; Cancel preserves the applied result. This example shows one month with November 2–27 bounds.

These are sample workshop schedules. Calendar cells and time options keep their composite keyboard semantics; standalone opening, navigation and commit actions consume the shared Button. Choose the persistent grid or a compact picker according to the space and precision needed by the workflow.
