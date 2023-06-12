# Page Embedded Permission Control (PEPC)

## Problem statement

People browsing the web today often encounter capability control UX flows that do not follow usable security best practices:

 



1. The user lacks the **context** of why a permission is being requested — Web-facing APIs for permission-gated capabilities are not designed in ways that encourage developers to consider the user experience or whether the user has an understanding of how the granted permission will be used.

	



2. Poorly timed permission requests **interrupt** the user — Permission requests are often displayed at page load, or when the user is doing something else. For example, Chrome telemetry shows that only about a third of location requests are preceded by a user gesture within 5 seconds.
3. Permission requests are often outside the user’s **focus** of attention — Common browser implementations of permission UI will statically position dialogs around the top of the browser window, which is often not where the user’s attention is focused.
4. Permission requests are currently triggered implicitly by the site trying to use a capability. This means that **interaction design** considerations are easily overlooked during product design phases.

From the user agents’ point of view, all of these problems are a symptom of the web permission model being designed to rely on “developer-push” — the developer _pushes_ the permission request onto the user. The user agent is not able to infer user intent with any degree of confidence, even if the developer follows best practices.

A model designed with user-pull in mind would solve these issues. If a user decides when they wish to initiate a permission request it ensures that:



1. The user understands the purpose of the permission, or at least has enough **context** to feel comfortable engaging in an activity that uses this permission.
2. The user’s current flow or task is related to granting this permission and as such it’s unlikely that the permission request could be **interruptive**.
3. The user agent can ensure the subsequent UI is placed near the current **focus** of attention of the user. This is because the user has just interacted with some piece of UI to request the permission which means their focus is likely in the area.
4. As a page element, permission requests become part of the purview of the **interaction design**; therefore more consideration will be given to the permission request placement and timing.


## Proposal

In order to achieve a user-pull permission request model:



1. It needs to be a UI element that the user understands the purpose of, and is not interruptive.
2. It needs to be configurable by the developer such that the developer can pick which permission it applies to and integrate it in their page. 

_We propose adding a new HTML element to the platform which will be used to provide an in-context entry point to a user-initiated permission request and recovery flow._

When the user clicks on this element they will be prompted to confirm that they wish to grant this permission. Event handlers are provided, allowing the site to react to the user’s decision. 

A dedicated HTML element would provide the following advantages:



1. Users will be able to decide if they wish the site to access certain capabilities, and they can decide this at their leisure (the decision moment relies on user-pull rather than developer-push).
2. Developers have a simple-to-integrate element with best-practice UX built-in. As this element is a visual component, developers are incentivized to think about how permission requesting fits into their site’s layout and flow.
3. User agents have a strong signal for user intent and will be able to create confirmation UX that fits the user’s current context.
4. During interaction design, the control can be represented in mocks and put into HTML. This simplifies implementation.

We propose the name of “Page Embedded Permission Control” which can be abbreviated as PEPC.


## Goals & non-goals

The goal of this proposal is to provide a definition of a Page Embedded Permission Control (PEPC) as a means to improve the permission request and recovery experience.

It is also a goal to provide security considerations and a set of useful non-normative design options to user agents.

A long-term goal is also for PEPC to become the default solution that sites use by providing a higher quality experience for the user and simplified developer ergonomics; the existing JS-based APIs only being used when an element-type solution does not fit.

It is not a goal of this proposal to define the exact permission request experience this element should provide nor an exhaustive list of security mitigations.


## Design considerations


### Design Requirements

The PEPC should be similar in appearance and behavior to a regular HTML button. 

The site should be able to specify which permission this element refers to and should be able to install relevant event handlers to listen to permission flow-related events.

The site can position this element on the page similarly to any other HTML element.

When the user clicks on this element, the user agent initiates a permission request flow in which the user is given the option to grant the relevant capability/feature.

The user agent has the opportunity to validate and overwrite the style and contents of the PEPC to be able to enforce security rules and validations.


### Definition

IDL:

    [Exposed=Window]
    interface HTMLPermissionElement : HTMLElement {
      [HTMLConstructor] constructor();
    
      [CEReactions] attribute DOMString allow;
    
      // Special event handler IDL attributes that only apply to Permission element objects 
      attribute EventHandler onResolved;
      attribute EventHandler onDismissed;
    };

A new css selector will be added which applies to PEPC elements and can be used to target css when the user permission is granted:

    :allowed

The PEPC is not allowed to have any child elements or contents.

The following event handler content attributes may be specified on the PEPC:



*   `onResolved` (triggered when the permission flow has been invoked from this element and the user made a decision).
*   `onDismissed` (triggered when the permission flow has been invoked from this element and the user has dismissed it without making a decision).

The `allow` attribute should be a name that identifies the feature the site wants to use. In exceptional cases, when the user agent supports permissions that can be requested together (a common example is camera and microphone), the `allow` attribute could also be a list of space-separated features. The `allow` attribute name has been chosen to reuse the familiar [iframe allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attributes) attribute as per the [reuse guidelines](https://www.w3.org/TR/design-principles/#attribute-reuse).

Whenever the PEPC’s content attributes or contents changes, the user agent should first validate and filter the new value:



*   If needed, the user agent can overwrite the new value to match defined security constraints. For example: if the site specifies a text or contents to be displayed, the user agent might want to override it to ensure the text is not misleading to the user.
*   The user agent should run a validation algorithm, even if they are unable to correct the issue. In such cases the PEPC should be [marked as invalid](#marking-the-pepc-as-invalid). 

Additionally whenever the PEPC’s content attributes or contents changes the PEPC should be [marked as invalid briefly](#marking-the-pepc-as-invalid-briefly), regardless of the actual change.


### Example usage

A site might embed a PEPC by using this HTML:

    <permission
      allow='microphone camera'
      style='background-color:blue, 
             color: white, 
             font-size: 14px'/>

## Security

The user agent rendered confirmation UI after the user clicks on the PEPC is what makes the PEPC ultimately secure. User agents should take proper care to ensure this confirmation UI is at least as secure as their current permission prompt flow.

The security measures outlined below are therefore focused on reducing user annoyance through site misuse of the PEPC and to reduce the risk of brute force attacks on user attention by repeatedly tricking users into clicking on the PEPC in the hopes of gaining an Accept response. On their own they are not sufficient to preclude the need for a secondary confirmation step UI.


### Marking the PEPC as invalid

In certain situations the user agent should mark the PEPC as invalid. This means that the user agent can no longer maintain reasonable confidence in the user’s intent to click the PEPC, if such an action happens.

There are a variety of scenarios when this might happen, so this list is **not at all exhaustive**:



*   The PEPC has just moved, which could mean it has just landed under the user’s cursor and their intent was to click on something else.
*   The PEPC’s content is misleading the user into thinking that clicking the PEPC does something else.
*   The PEPC’s color scheme makes the text unreadable.
*   The PEPC is partially or fully covered by another element.

It is recommended that user agents either prevent these situations where possible (e.g. by not allowing the contents of the PEPC to be set by the site). If correcting the situation is impossible the user agent should mark the PEPC as invalid. 

While the PEPC is invalid the user agent should **not** treat user action with high confidence. It is recommended that either:



1. The user agent does not handle the user action at all

OR



2. The user agent falls back on the non-PEPC permission flow

Even after an element becomes valid from an invalid state there should be a short cooldown (&lt;1 second) during which the element is still treated as invalid. This is to prevent attackers which are trying to bypass this mitigation by making the PEPC valid immediately before the user clicks on it.


### Marking the PEPC as invalid briefly

There are situations when the PEPC transitions from a valid state to a valid state. However this transition can still change the meaning of the PEPC and therefore be used to change the purpose of the PEPC immediately before the user clicks on it.

For example: the site could change the permission type of the PEPC to make it affect a different permission right as it’s about to be clicked.

When this happens the user agent should handle this as if the PEPC has been 

[marked as invalid](#marking-the-pepc-as-invalid) and then became valid again, which ensures a short cooldown is added before the user’s interactions with the PEPC are to be treated with high confidence again. Whether to represent the cooldown period visually is an implementation decision for the user agent.


### Locking the PEPC style and contents

User agents should lock down the styling of the PEPC in regards to the color, size, border, rounding, contents, icon, etc. of the PEPC.

This provides protection against some of the clickjacking and social engineering attacks that bad actors might use to trick the user into click the element:


<table>
  <tr>
   <td style="background-color: null"><strong>Attack description</strong>
   </td>
   <td style="background-color: null"><strong>Recommended mitigation</strong>
   </td>
  </tr>
  <tr>
   <td style="background-color: null">A transparent PEPC is put over some other UI that is likely to be clicked by the user.
   </td>
   <td style="background-color: null">PEPC opacity should be set to 1 always.
   </td>
  </tr>
  <tr>
   <td style="background-color: null">Site misrepresents the PEPC by setting the text/icon to mislead.
   </td>
   <td style="background-color: null">PEPC text and icon should be fixed based on the browser locale and permission type
   </td>
  </tr>
  <tr>
   <td style="background-color: null">Site uses a large PEPC intentionally to attract attention, occupying a large portion of the screen.
   </td>
   <td style="background-color: null">PEPC size should be limited either based on the window size or just simply a decided value
   </td>
  </tr>
  <tr>
   <td style="background-color: null">Site uses a very small PEPC to potentially disguise it as part of the UI (e.g. as the right-top X close button that many UI elements have)
   </td>
   <td style="background-color: null">PEPC size should be limited to ensure a minimum font size fits.
   </td>
  </tr>
  <tr>
   <td style="background-color: null">Site uses a small text font to hide the purpose of the element
   </td>
   <td style="background-color: null">PEPC font size should have a minimum value that ensures it’s readable.
   </td>
  </tr>
  <tr>
   <td style="background-color: null">Site uses custom text and background colors that do not meet color contrast accessibility requirements
   </td>
   <td style="background-color: null">Reset text and background colors to default if the combination does not meet WCAG AA color contrast standards (4.5:1)
   </td>
  </tr>
</table>


In these cases the user agent should overwrite the site-provided values or 

[mark the PEPC as invalid](#marking-the-pepc-as-invalid) until the situation is resolved. In either case, developers should be provided with ample context (e.g. via console logs) to ensure they understand the issue.


### Prevent user interactions when the PEPC was recently obscured

If the PEPC has been covered partially or entirely, or it has not been shown in its entirety for any reason then the PEPC should be [marked as invalid](#marking-the-pepc-as-invalid), until it is fully visible.


### Prevent user interactions when the PEPC has recently moved

If the PEPC has recently moved then the PEPC should be [marked as invalid](#marking-the-pepc-as-invalid). A move would be anything that changes the PEPC’s absolute screen coordinates. This can include but is not limited to:



*   The site changing the PEPC’s position
*   Scrolling
*   Window drag-move
*   Layout changes


### Prevent user interactions when the PEPC has been recently created

As the PEPC is constructed it should be 

[marked as invalid briefly](#marking-the-pepc-as-invalid-briefly) to ensure it’s not maliciously being created by the site under the user’s cursor.


### One PEPC per permission type per page

To prevent sites from tile-covering their site with PEPCs, there should be a limit of at most one PEPC per permission type, per page.


### Conditions for usage in subframes

Subframe usage will be allowed but several security constraints need to be enforced:



*   Permission Policy should be first checked to ensure that the permission is allowed in the subframe.
*   A valid `X-Frame-Options` header or a `frame-ancestors` CSP policy needs to be set.


### Custom cursors

Custom cursors should be disabled when the cursor is hovering over the PEPC because they can have a potentially misleading hitpoint.


### Synthetic click events

Click events which are simulated by the site (e.g. via the `click()` function) should not be handled by the user agent.


## Privacy


### Exposing user information bits

Extreme care needs to be taken to ensure that information is limited to what a site needs to know. Information that can be already determined (for example via the Permissions API) is fine to be exposed via the PEPC. Other sensitive information should not be.

_Example:_ Many user agents provide a way for an admin to manage certain permissions on behalf of the user. In such cases the user agent might decide to have the PEPC text reflect this state, perhaps by setting the PEPC text to “Admin blocked”. This would however provide information to the site that they would otherwise not be privy to, namely that the user’s settings are partially controlled by an administrator.


## Non-normative user agent’s design options


### Confirmation UI

We recommend that user agents implement a permission decision/confirmation flow that makes use of the fact that there is some reasonable confidence in the user’s intent when the PEPC was clicked.

Some non-normative but strongly recommended ideas for user agents to consider:



*   The confirmation UI can be positioned near the PEPC to be within the user focus.
*   The confirmation UI should be very clear about the permission that is being requested and by whom.
*   The confirmation UI should not be able to be covered by any other UI under the user agent’s control.
*   To mitigate some social engineering attempts by the site, the confirmation UI should be clearly in the foreground and top-priority. To achieve this effect something like a semi-transparent gray filter can be applied over the whole site while the confirmation UI is being displayed.


### Using the PEPC as an in-content anchor

Since the PEPC has a clearly defined purpose, user agents might make use of its in-page position to present the user with an appropriate permission decision flow in or around that position. 

It is entirely dependent on the details of the user agent’s permission flow UI but it is an option worth considering for common permission requests UI.


### Using the PEPC as a permission status surface

The PEPC should **not** be seen as a replacement for current status indicators as it can be hidden by the site at will.


## Alternatives considered


### Extending an existing element

Instead of adding a new element, existing HTML elements can be augmented to provide the same result. The immediate candidates are the input and button elements which could have new properties added to achieve the same functionality.

This could be an example of how this would look like:

Disadvantages:



1. Backwards-compatibility and interoperability: old versions and user agents that don’t implement the permission element will still render and create a “button” element that does not do anything. This is a worse experience than simply not creating the control in the first place.
2. Flexibility: this document generally imagines the HTML control as a button, but future extensions of this element could instead use some different type of UI like a checkbox, a link, a radio etc.
3. More complex implementation of a PEPC polyfill library.


### No platform changes

Sites could replicate most of this behavior currently by using a button that triggers the permission request. Developers could be actively encouraged to use this pattern via articles, communications etc.

Disadvantages:



1. There is no way for the user agent to identify that a button is specifically for permission requests which means there is no way to ensure the permission request is displayed near the user’s focus.
2. It requires user experience design and consideration from the site’s side. There are many ways to get this wrong and provide a suboptimal user experience.


### Providing a declarative JS API

A declarative JS API could be used to mark a particular element as the PEPC of the page (and provide the necessary initialization configuration).

Disadvantages:



1. This does not solve the problem of permissions not really being brought into focus in the interaction design process. The PEPC remains in the purview of the web developer.
2. The possibility of dynamically selecting which element is the PEPC complicates the verification and constraints we recommend as part of security. It is more robust for the same element to either always be a PEPC or not.
3. Backwards-compatibility and interoperability: developers need to always be careful to manually remove their HTML button that they planned to declare as a PECP if the user agent does not implement the PEPC API, otherwise their site will simply contain a button that does nothing.


### Extending the Permissions API

A somewhat similar experience could be achieved by extending the Permission API to allow sites to specify a specific HTML element as an anchor when requesting a permission. This could be done by adding a request() function to the [permissions interface](https://www.w3.org/TR/permissions/#permissions-interface).

Disadvantages:



1. There is no guarantee that the user’s focus is around the specified element.
2. This model is not user-push and therefore is not good at ensuring that the user has the necessary context and would not feel interrupted by the permission request.


## Extending the PEPC in the future


### PEPC for additional user agent settings, such as App settings

Some user agents support installable web apps with additional user features such as Run on OS Login. In the future PEPC could be used to allow sites to embed App settings relevant to installed web app behavior. 


### Not “just” a button

This current proposal assumes an HTML element similar to a button. In the future user agents might also provide the PEPC in the form of a link, a checkbox or some new bespoke UI, based on in particular which permission is being requested. There is a lot of flexibility in designing future versions that better fit some more niche type of permissions.

