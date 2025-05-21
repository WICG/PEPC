# The < permission > element - Seamless user control of powerful capabilities


## tl;dr
Permissions on the web, despite their success in enabling powerful features, remain a significant source of user annoyance, friction, and abuse, leading to unintended grants or denials of critical capabilities. The proposed **`<permission>` element** introduces a clear and consistent entry point for users' control over an origin's access to powerful features [1](https://w3c.github.io/permissions/#dfn-powerful-feature). Users' interaction with this element carries a **high degree of intent**, as the user agent controls the element's content and constrains its presentation to promote legibility and comprehension. The intentional nature of this interaction and developers' ability to place it in context gives user agents flexibility to make better decisions about any subsequent browser UI, ultimately reducing frustration for web developers and users alike by making unintentional grants or denials less likely. 


 <div style="display: flex;">
  <img src="images/New_HTML_permission_element.png" style="height: 250px; margin-right: 15px; object-fit: contain;">
  <img src="images/Browser_permission_prompt.png" style="height: 250px; margin-right: 15px; object-fit: contain;">
  <img src="images/pepc_secondaryUI_animated.gif" style="height: 250px; object-fit: contain;">
  <p style="margin-top: 5px;"><em>Image 1: The < permission > element introduces a browser-controlled HTML element (with content and styling constraints) (left) that users click with clear intent to trigger such prompts (middle, right).</em> </p>
</div>
 

## Table of Contents
<!-- TOC start -->

- [The Core User Problem](#problem)
- [Solution: The `<permission>` Element](#solution)
- [Goals of The `<permission>` Element](#goals-non-goals)
- [Understanding The `<permission>` Element](#understanding)
- [Technical Specifications](#tech-specs)
- [Designing the Permission UI](#design)
- [Security and Abuse Mitigation](#security-abuse)
   * [Safety Measures](#safety)
   * [Annoyance Mitigation](#annoyance)
   * [Fallbacks When Constraints Are Not Met](#fallback)
- [Developer Integration and Best Practices](#best-practice) 
- [Priming & Pre-Prompts](#priming)
- [Results from the OT](#OT-results)
- [Future of Permissions &Strategic Evolution](#future)
- [Privacy](#privacy)
- [Appendix: FAQ Section](#faq)


<!-- TOC end -->

<a name="problem"></a>
<!-- TOC --><a name="problem"></a>
## The Core User Problem

The current implementation of [permissions on the web](https://www.w3.org/TR/permissions/#intro) causes significant problems for users. While permissions are crucial to the web, enabling powerful capabilities (like camera or microphone access) while safeguarding user privacy and security by delegating sensitive decisions to users, this model frequently falters in practice, leading to **frustration and perceived issues for users**.
A prime example is video conferencing, where widespread "microphone not working" issues are often due to permission states rather than technical faults. These problems are compounded by the multi-layered nature of permissions (web origin, user agent, system level) and varying troubleshooting steps across platforms.
A lens through which to view these failures is _false positives_ and _false negatives_: If a user ends up in the state they intended — be it permission granted (true positive) or denied (true negative) — all is well, and the browser has done its job. But if a permission is granted without the user intending it (false positive, e.g., as a result of a "dark pattern" on the page), or if it a permission is denied without intent (false negative, e.g., camera not working in video conference), the browser has failed its user.

| | Camera working on site | Camera not working on site (site or OS permission missing) |
|---|---|---|
| **Intent to use camera on site** | True positive: Intent correctly captured. | False negative: User intended to use camera but permission is blocked (Site/OS) or they changed their mind. Solution: Clear intent by clicking the `<permission>` element to show the prompt again. |
| **No intent to use camera on site** | False positive: Permission granted without user intent. Solution: `<permission>` element requires explicit user click on clearly labeled button to show prompt. | True negative: Intent correctly captured. |


Users frequently encounter several challenges with current permission models:
- **Limited Impact of Existing Mitigations:** Current spam and abuse mitigation approaches have an architectural upper bound on user protection because the model relies on the website to choose when to trigger the prompt rather than capturing a reliable signal of user intent. This is evident in metrics where most user interactions on permission prompts are negative.
- **Contextual Blindness:** User agents currently lack semantic understanding of events in the content area prior to a permission request, limiting their ability to provide better, more contextual prompts. This often leads to prompts that can "come out of nowhere," correlated poorly with user expectations.
- **Difficulty in Recovery from Denials:** While existing "permanent deny" policies on site or OS level reduce spam, they make it difficult for users to change their minds later, requiring them to navigate complex browser or system settings. This backfires when a user genuinely wants to re-enable a feature but struggles to do so, leading to a worse experience.

<table style="width: 100%; border: none;">
  <tr style="border: none;">
    <td style="width: 40%; text-align: center; border: none;"> <img src="images/image3.png" style="height: 350px; object-fit: contain;">
    </td>
   <td style="width: 20%; border: none;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
    <td style="width: 40%; text-align: center; border: none;"> <img src="images/permission_os_blocked.png" style="height: 350px; object-fit: contain;">
    </td>
  </tr>
</table>
<p> <em>Image 2: These images illustrate a common user challenge: previously denied permissions. On the left, a user had blocked camera and microphone access, but now clearly intends to re-enable them by clicking an "unmute" button. Similarly, the right shows a user who had denied location access, but now expresses strong intent to use it by clicking a "use my current location" button. In both cases, because the user agent lacks insight into these in-content interactions, it's compelled to respect the previous denial. This leaves users struggling to navigate complex browser or OS settings, especially in stressful scenarios like an important presentation or finding a nearby store.</em> </p>

- **Accessibility Challenges with Current Approaches:** Current JavaScript-triggered permission UIs can present issues for screen readers and magnification users. Native HTML elements like the `<permission>` element are accessible by default.
 
Therefore, a more confident signal of user intent is key to making web permissions work better for users, which the `<permission>` element aims to achieve.

<!-- TOC --><a name="solution"></a>
## Solution: The `<permission>` Element

The semantic `<permission>` HTML element will serve as an in-content entry point for permission requests, appearing and functioning much like any other HTML button [Image A]. The crucial difference is that a click on this button will trigger a permission request for which the user agent can have high confidence that it was user-initiated [Image C]. To achieve a strong signal of user intent, user agents require [user activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation) to let a script trigger a permission prompt.

The `<permission>` element comes with browser-controlled content and styling constraints to prevent manipulation and ensure its integrity. This design unifies permission control by offering a clear, consistent, in-page access point for managing permissions in both the browser and the OS.

User agents can combine the element with a louder, more opinionated design to emphasize the critical decision moment. Other user agents can tailor this experience to their needs while relying on the strong user signal the element provides. For instance, Chrome is doing an implementation that combines this semantic HTML element [Image A] with a full-page modal confirmation UI [Image B,C] that applies a scrim to obscure underlying site content during the critical decision moment. Regardless of the specifics, the `<permission>` element makes manipulation and "change blindness" more difficult. Browsers maintain strict control over the content presented to the user, ensuring it aligns with their understanding of user intent. This approach significantly enhances user intent capture, improving accessibility, security, and user-friendliness for both users and developers. The element also includes appropriate safeguards to protect users from common spam and abuse patterns such as clickjacking.



<table style="width: 100%; border: none;">
  <tr style="border: none;">
    <td style="width: 40%; text-align: center; border: none;"> <img src="images/image5.png" style="height: 400px; object-fit: contain;">
    </td>
    <td style="width: 20%; border: none;"> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
    <td style="width: 40%; text-align: center; border: none;"> <img src="images/image5.png" style="height: 400px; object-fit: contain;">
    </td>
  </tr>
</table>
<p> <em>Image 3: Implementation example: A video conferencing site providing a "Use microfone" button and a search site a "Use precise location" button, that triggers a microfone or geolocation permission request. </em> </p>



<!-- TOC --><a name="goals-non-goals"></a>
## Goals of The `<permission>` Element

The primary goals of the `<permission>` element are:
- More Confident and Robust Capture of User Intent: The element's design provides a strong signal of user intent, allowing user agents to make more informed decisions about presenting permission requests. This is achieved by requiring a user click on a dedicated button with an actionable message (e.g., 'use camera') in context and at the time of need, providing a more accurate capture of intentionality compared to general user gestures or mere page loads.
- Reducing False Positives and False Negatives: The `<permission>` element specifically aims to reduce both false positives (unintended grants) and false negatives (unintended blocks), thereby driving down the number of prompts users encounter. 
- Mitigating OS-level and Site-level Permission Regret: A significant user problem is regretting a denial, especially when it's persistent or at the OS level, making it hard to revert. The `<permission>` element provides a clear, consistent way for users to revisit and manage their permission decisions upon clear intent, facilitating necessary changes when user intent evolves
- Better Context: The `<permission>` element allows developers to integrate permission requests into the user journey at the UX design stage, ensuring clearer context for the user. The affordance to grant permission is in-context, making it easier for legitimate use cases to explain what is being asked and why.

<!-- TOC --><a name="understanding"></a>
## Understanding the `<permission>` element

The `<permission>` element is designed to be straightforward for developers to integrate into web pages like any regular button while offering robust browser control for security and user experience. For example:

```html
<style>
  permission {
    background-color: lightgray;
    color: black;
    border-radius: 10px;
  }
</style>
<permission type="geolocation"></permission>
```

<img src="images/image9.png">


<!-- TOC --><a name="tech-specs"></a>
## Technical Specification
- **Parsing Model**: The `<permission>` element's contents will be ignored by default and instead the user agent will render its own contents. This ensures its content and appearance are strictly controlled by the user agent.
- **Attributes**: The element supports several attributes to define its behavior:
  - `type`: Specifies which permission the element applies to (e.g., "microphone", "geolocation", "camera"). It can also be a space-separated list for grouped permissions if the user agent supports such grouping (e.g., microphone and camera requests are commonly grouped).
preciselocation: A boolean (true/false) specific to the geolocation permission type.
  - `sysex`: A boolean (true/false) specific to the MIDI permission type.
  - `pantiltzoom`: A boolean (true/false) specific to the camera permission type.
  - `lang`: The global lang attribute has a specific purpose here. Since the element's content is set by the user agent, this attribute indicates the desired language for the text. The user agent will attempt to provide the text in that language if possible. Note that this only determines the language of the HTML element, not the permission confirmation UI itself, which will use the user agent's primary language settings.
- **CSS Pseudo-classes**:
  - `:granted:` This pseudo-class is applied when the relevant permission is granted (either previously or during the current session). Sites can style the `<permission>` element differently in this state (e.g., to indicate "Location shared").
- **Fallback contents**:
The `<permission>` element’s contents can be used as a fallback in case the user agent does not support the `<permission>` element. User agents that support the `<permission>` element will ignore the contents and instead render its own. There is one exception to this: if the provided `type` attribute value is not supported, the browser will stop providing its own content and instead use the site-provided fallback content inside the `<permission>` element (if it exists).


<!-- TOC --><a name="design"></a>
## Designing The Permission UI

After a user clicks the `<permission>` element, a browser-controlled confirmation UI is presented to confirm their decision and potentially allow configuration. User agents have flexibility in designing this UI, but certain considerations apply:
- **Standard UI**: Since the user agent has a strong signal of the user's intent and current focus, it can use this to improve the general UX without risking interrupting the user. This confirmation UI can make use of the `<permission>` element's position on the page to position itself on the screen. It can also be brought more into attention by the user agent, for instance, by applying a gray filter over the site content area. The confirmation UI should also have an obvious way for the user to change their mind.
<img src="images/image16.png" width="300" alt="Description of image16">


- **UI for Administrator-Blocked Permissions:** There are many user agents that offer mechanisms for permission granting that involve some sort of administrator or management system, which the user cannot override. In such scenarios, the `<permission>` element text itself should not change (as it can be used as a potential fingerprinting bit). Instead, the confirmation UI should clearly communicate this situation to the user (e.g., "Your administrator has blocked camera on example.com").
<img src="images/image16.png" width="300" alt="Description of image17">

- **UI When Permission is Already Granted*:* When the permission is already granted and the user clicks the `<permission>` element, a traditional permission prompt does not make much sense. Instead, the UI can be used for other reasonable purposes, such as allowing the user to easily change their previous decision (e.g., "You have allowed camera on example.com," with options to "Continue allowing" or "Don't allow camera"). While the primary goal of The `<permission>` element is not to encourage sites to revert previously granted permissions, its design includes defined behavior for such cases for completeness. This capability could offer potential incentives for sites, such as enhancing site reputation and trust by demonstrating commitment to user privacy and control, boosting user engagement and retention by reducing frustration, and even increasing initial grant rates if users know they can easily revert later.
<img src="images/image16.png" width="300" alt="Description of image19">

- **UI When Request is Otherwise Blocked:** User agents implement many mechanisms to prevent permission requests, such as permanent denies (explicit or implicit), duration-based denies, heuristics, blocklists, or ML-based automatic blocks. Each of these mechanisms should be carefully weighed against the strong signal sent by the user clicking the `<permission>` element. This strong signal might override some of these mechanisms entirely (e.g., heuristics or ML models might not apply to `<permission>` element-triggered prompts) or lead to a compromise. For example, if a site is in a "deny" state but the user clicks the `<permission>` element, the confirmation UI could appear as: "You previously didn't allow camera on example.com" with options like "Continue not allowing" and "Allow once”. In such a case, offering "Allow once" instead of a permanent "Allow" is a deliberate choice to be on the safe side, given the user previously denied the permission. If the user then clicks the `<permission>` element again on the next visit, they would see the standard browser prompt for a full "Allow" decision.
<img src="images/image16.png" width="300" alt="Description of image18">

- **Flexibility and Future UI Considerations:** The `<permission>` element proposal does not prescribe any particular prompt UI or exact text to browsers. This flexibility allows user agents to optimize their native prompt display for specific platforms and user expectations, including handling internationalization and cultural differences, a task browsers already manage for existing prompts. Despite these UI and linguistic variations, the `<permission>` element ensures consistent, browser-controlled content and semantic meaning during the critical decision moment. Future considerations for The `<permission>` element's visual design include evolving from text-only (status quo) to 'Icon + Text' and potentially 'Icon only' displays. It's noted that in-call controls are not a primary use case for the `<permission>` element in the near future. For certain low-risk capabilities, a future design evolution could allow skipping the secondary confirmation UI entirely, while high-risk capabilities like camera and microphone would retain it. Recognizing that embedding the `<permission>` element within UI increases design challenges, including potential layout issues arising from browser variations, the proposal aims for a consistent semantic meaning and user intent capture rather than dictating a uniform device-independent UI across all browsers.
  
- **Browser UI vs. Site UI Distinction:** A common pattern is to show centered permission prompts, such UI can be highly disruptive if the user is not expecting or initiating it. Moving a prompt to the center of the page without a clear, user-initiated intent, but rather developer initiated risks giving users the feeling they are being forced to make a decision. The goal of the `<permission>` element is for users to achieve their desired outcome with only relevant permission prompts. The `<permission>` element ensures the permission decision UI itself remains under strict browser control, preventing manipulative or misleading framing within the prompt. However, it's also acknowledged that the distinction between browser UI and site UI might not matter as much to users as it does to browser engineers.


<!-- TOC --><a name="security-abuse"></a>
## Security and Abuse Mitigation
The goal of user agents is to ensure that the `<permission>` element is not trivial to abuse. This involves addressing two primary types of abuse: safety (preventing unintended grants via manipulative UIs) and user annoyance (preventing repeated, unwanted prompts). These are addressed by the "Confirmation UI" and by constraints on the `<permission>` element respectively.

<!-- TOC --><a name="safety"></a>
### Security and Abuse Mitigation
The safety of the `<permission>` element hinges on the presence of a browser-generated "Confirmation UI" that confirms the user's decision to grant the permission. This UI is strictly better than existing non-modal permission prompts implemented by most browsers because it:
- Is generated by the browser, with the only inputs accepted from the website being the requested permission types.
- Is modal, requiring explicit dismissal or decision for the user journey to continue.
- Obscures website content with a semi-opaque and blurred scrim, preventing the site from manipulating the user's decision-making or obfuscating the modal content.
These strict constraints make the `<permission>` element minimally as safe (and arguably safer) than existing non-modal UI.

<!-- TOC --><a name="annoyance"></a>
### Annoyance Mitigation
Mitigating annoyance by ensuring user intent is more complex than ensuring safety, but equally important. Without mitigating annoyance, it wouldn't be reasonable to impose the safer, but more disruptive, modal confirmation UI. Sites could use techniques to annoy users by repeatedly triggering modals. The `<permission>` element handles this through:
- **Browser-Controlled Text:** The text on the `<permission>` element cannot be set by the site. Instead, the user agent sets it to something comprehensive (e.g., "Use location" for geolocation), preventing misleading text like "Click here to proceed".
- **Strict Styling Constraints:** The style of the `<permission>` element is verified, validated, and overridden by the user agent as needed. This prevents obscuring the element's purpose (e.g., by setting the same text and button colors). The following CSS properties have special rules applied to them:
  - `color`, `background-color`: Must have a contrast ratio of at least 3 for legible text; alpha must be 1.
  - `font-size`, `zoom`: Must be within the equivalent of 'small' and 'xxxlarge'.
  - `border-width`: Values over 1em are corrected to 1em.
  - `outline-offset`: Negative values are corrected to 0.
  - `margin (all)`: Values under 4px are corrected to 4px to help prevent false positives for occlusion detection.
  - `font-weight`: Values under 200 are corrected to 200.
  - `font-style`: Values other than 'normal' and 'italic' are corrected to 'normal'.
  - `word-spacing`: Values over 0.5em are corrected to 0.5em; values under 0 are corrected to 0.
  - `display`: Values other than 'inline-block' and 'none' are corrected to 'inline-block'.
  - `letter-spacing`: Values over 0.2em are corrected to 0.2em; values under -0.05em are corrected to -0.05em.
  - `min-height`: Defaults to 1em, taking the maximum of default and provided values.
  - `max-height`: Defaults to 3em, taking the minimum of default and provided values.
  - `min-width`: Defaults to 'fit-content', taking the maximum of default and provided values.
  - `max-width`: Defaults to 3*'fit-content', taking the minimum, with exceptions for elements with a border meeting specific criteria.
  - `padding-top`: Takes effect only if height is 'auto'; values over 1em are corrected to 1em, and padding-bottom is set to padding-top's value.
  - `padding-left`: Takes effect only if width is 'auto'; values over 5em are corrected to 5em, and padding-right is set to padding-left's value, with exceptions for elements with a border.
  - `cursor:` Defaults to 'pointer'; 'not-allowed' is also valid, others are corrected to 'pointer'.
- **Occlusion Detection:** The user agent verifies that the `<permission>` element has been visible for a short time (e.g., 500ms) before a click is registered. User agents implementing IntersectionObserverV2 can leverage it internally for this.
- **Movement Detection:** The user agent ensures the `<permission>` element has not been recently moved (e.g., in the past 500ms) to prevent sites from moving it under the user's cursor to trick them into clicking.
- **Recent DOM Insertion Detection:** Similarly, the user agent ensures the `<permission>` element has not been recently inserted into the DOM (e.g., in the past 500ms).
- **Element Quantity Limit:** To prevent sites from "tile-covering" their content with `<permission>` elements, there is a limit of at most two `<permission>` elements per permission type, per page.
- **Subframe Usage Conditions:** While usage in subframes is allowed, several security constraints are enforced to prevent clickjacking attacks where a malicious site embeds a legitimate site that uses a `<permission>` element:
  - Permission Policy must first allow the permission in the subframe.
  - The frame-ancestors Content Security Policy (CSP) directive must be explicitly declared if a document using the `<permission>` element is embedded cross-origin (to the top-level frame). This ensures permissions cannot be obtained by a bad actor via an embedded site without explicit opt-in.
- **Synthetic Click Events Ignored:** Click events which are simulated by the site (e.g., via the click() JavaScript function) are not considered valid user-initiated interactions. This ensures genuine user intent for triggering the permission flow.


### Fallbacks When Constraints Are Not Met
If the integrity of the `<permission>` element click is not assured (e.g., due to styling issues, occlusion, or recent movement), user agents have several approaches to consider:
- **Trigger Legacy Flow**: The click could trigger the equivalent JavaScript API's legacy permission flow (as if it was triggered by the equivalent JS API). This is suitable for non-self-correcting issues like styling problems or occlusion.
- **Do Nothing**: The click could simply do nothing. This is appropriate if the failing check will self-correct (e.g., after a short cooldown if the element has recently moved).
