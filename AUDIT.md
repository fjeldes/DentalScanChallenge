# DentalScan UX & Technical Audit

## User Experience (UX) Observations
During a real-world test run, I discovered key friction points that disrupt the patient journey:

1. **Form Localization & Native Inputs:** The initial intake form failed to detect and format my international (Chilean) phone number. Furthermore, the built-in native HTML date-picker felt clunky. Implementing custom, localized input components is essential to prevent international users from dropping off early.
2. **Camera Mirroring & Visual Guides:** The front-facing camera naturally exhibits a "mirror effect" (left vs. right), which makes following pure text instructions highly confusing. Adding a visual overlay (like an oval guide) acts as an indispensable anchor, showing the patient exactly how to intuitively position their head.
3. **Auto-Capture Pacing:** The original 5-view sequence triggered captures back-to-back instantaneously. This rushed the patient. Introducing staggered pauses (2.5 seconds) between the shots allows patients to comfortably process and adjust to their next step.
4. **Auditory Cues for Lateral Views:** When instructed to "Turn Left" or "Right," patients must look away from the screen, making it impossible to know if they succeeded. Synthesized audio feedback (like a beep countdown) removes screen-checking anxiety, letting them focus solely on posing correctly.

## Mobile Camera Stability Challenges
Automating facial tracking via `getUserMedia` presents severe hardware constraints:

1. **Focus Hunting & Proximity:** Mobile sensors struggle to maintain focus inside the dark oral cavity. The camera will constantly trigger auto-focus, causing blurry captures even if the alignment heuristics declare the user "stable."
2. **Computational Limits:** Analyzing 60fps video bottlenecks slower CPUs and overheats the browser. Stability algorithms must be debounced and relaxed to support older hardware.
3. **Macro-Tremors vs. Strictness:** Slight hand tremors inevitably introduce motion blur. If tracking bounding boxes are too strict, patients will be locked out from completing the scan. We must balance algorithmic strictness with the physical time lenses need to settle.
