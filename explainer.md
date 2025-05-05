# Page Embedded Permission Control (<permission> element)

## tl;dr

We propose a semantic permission element with browser-controlled content and styling constraints that ensures a very high level of confidence concerning user intent to make a permission decision on site or OS level. The <permission> element unifies permission control by providing a clear, consistent, in-page point of access to manage permissions in both the browser & the OS.
We believe this solves user problems related to accessibility, context, regret, and more.
By combining a semantic HTML permission element (Image A) with a full-page modal confirmation UI (Image B, C) that applies a scrim to obscure underlying site content during the critical decision moment (making manipulation and change blindness more difficult), and by ensuring that browsers control the content in front of the user (Image A), the <permission> element enhances user intent capture, offering improved accessibility, security, and user-friendliness for both users and developers. Styling constraints are necessary to protect the browser-controlled content from being altered or removed by the site, ensuring that the content presented to users aligns with the browser's understanding of their intent. This offers a significantly better user experience than current permission flows through enhanced accessibility, security, and user-friendliness for both users and developers.

 <div style="display: flex;">
  <img src="images/New_HTML_permission_element.png" style="height: 250px; margin-right: 15px; object-fit: contain;">
  <img src="images/Browser_permission_prompt.png" style="height: 250px; margin-right: 15px; object-fit: contain;">
  <img src="images/pepc_secondaryUI_animated.gif" style="height: 250px; object-fit: contain;">
  <p style="margin-top: 5px;">A. New HTML Permission Element B. Browser permission prompt C. Combined</p>
</div>
 

## Table of Contents
<!-- TOC start -->

- [Introduction](#introduction)
- [Proposal](#proposal)
- [Goals & non-goals](#goals-non-goals)
- [Adoption ](#adoption)
- [Developer trials](#developer-trials)
- [Design considerations](#design-considerations)
   * [HTML element](#html-element)
      + [Usage](#usage)
      + [Restrictions](#restrictions)
      + [the <permission> element attributes](#pepc-attributes)
   * [Permission UI](#permission-ui)
      + [Standard UI](#standard-ui)
      + [UI when the user can't change the permission](#ui-when-the-user-cant-change-the-permission)
      + [UI when there is a mechanism that would block the request](#ui-when-there-is-a-mechanism-that-would-block-the-request)
      + [UI when the permission is already granted](#ui-when-the-permission-is-already-granted)
   * [Complexity ](#complexity)
   * [Implementor portability, internationalization & upkeep](#implementor-portability-internationalization-upkeep)
   * [Fallback solutions](#fallback-solutions)
- [Security](#security)
   * [Threat model](#threat-model)
      + [Safety](#safety)
      + [Annoyance](#annoyance)
   * [Fallbacks when constraints are not met](#fallbacks-when-constraints-are-not-met)
   * [Locking the <permission> element style](#locking-the-pepc-style)
   * [One the <permission> element per permission type per page](#one-pepc-per-permission-type-per-page)
   * [Conditions for usage in subframes](#conditions-for-usage-in-subframes)
   * [Synthetic click events](#synthetic-click-events)
- [Privacy](#privacy)
   * [Exposing user information bits](#exposing-user-information-bits)
- [Status quo elaboration](#status-quo-elaboration)
   * [Permission prompts UX evaluation](#permission-prompts-ux-evaluation)
   * [User Agent abuse mitigations](#user-agent-abuse-mitigations)
- [Alternatives considered](#alternatives-considered)
   * [No platform changes](#no-platform-changes)
   * [Improve existing usage triggered permission request journey](#improve-existing-usage-triggered-permission-request-journey)
   * [Separate this into two proposals, (1) improved user intent signal and (2) permission prompt improvements](#separate-this-into-two-proposals-1-improved-user-intent-signal-and-2-permission-prompt-improvements)
   * [Extending an existing element](#extending-an-existing-element)
   * [Providing a registration JS API](#providing-a-registration-js-api)
   * [Extending the Permissions API to provide an anchor point](#extending-the-permissions-api-to-provide-an-anchor-point)
   * [Allowing recovery via the regular permission flow](#allowing-recovery-via-the-regular-permission-flow)
   * [Implementing an origin based permission allow list registry](#implementing-an-origin-based-permission-allow-list-registry)
- [Extending the <permission> element in the future](#extending-the-pepc-in-the-future)
   * [The <permission> element for additional user agent settings](#pepc-for-additional-user-agent-settings)
   * [Not "just" a button](#not-just-a-button)

<!-- TOC end -->

<a name="introduction"></a>
<!-- TOC --><a name="introduction"></a>
## Introduction

When making decisions about whether or not to expose particularly powerful
capabilities to a given website, user agents generally
[pass the question on to users](#permission-prompts-ux-evaluation).
Historically, this began as a fairly direct passthrough: a site would ask for
some capability and the user agent immediately prompts asking users to make a
decision for the request.

Spam and abuse have forced user agents to take a more opinionated approach to
protect users' security, privacy, and attention. A number of preconditions and
mitigation measures have evolved, ranging from straightforward
[user activation requirements](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation),
permanent "block" policies, or
[complex heuristics](https://blog.google/products/chrome/building-a-more-helpful-browser-with-machine-learning/).
However these measures have limited effect
[as indicated by metrics](#user-agent-abuse-mitigations).

Challenges with the status quo include:

1.  **Insufficiency of existing mitigations**: The present day permissions spam
    and abuse mitigation approach has an architectural upper bound on user
    protection because the model relies on the website to choose when to trigger
    the permission request prompt rather than capturing a reliable signal of
    user intent. Requiring a user gesture to
    [request permission to use a powerful feature](https://www.w3.org/TR/permissions/#dfn-request-permission-to-use)
    (or similar) does not solve this problem as there are many ways of tricking
    a user into providing a so called
    "[activation triggering input event](https://html.spec.whatwg.org/#activation-triggering-input-event)"
    (i.e., a user gesture, such as clicking the mouse or pressing a key) .

1.  **Context**: Ideally, a site's developer will request access as part of a
    contextual flow that helps users understand what's being asked for and why,
    enabling quick and confident responses. Often, however, permission requests
    are correlated poorly with user expectations, up to and including prompts
    that can come out of nowhere (see example 1). This places a burden on user
    agents' presentation of the request. The user agent has no semantic
    understanding of events taking place in the content area prior to the
    permission request. User agents could make better decisions and provide
    better prompts if they could make well-founded assumptions about the nature
    of the user's interaction in the content area, and the user's intent. At the
    moment user agents are limited to trying to make use of potentially ambigous
    signals such as the time elapsed between page load and the permission
    request.

    ![](images/image1.png) \
    *Example 1. A notification permission prompt on a news site (contents
    blurred), shown after the user has clicked on the empty area next to the
    article content. The user finds this prompt interruptive as they had no
    interest in subscribing to notifications, and they will likely struggle to
    understand why the prompt was shown to begin with.*

1.  **Location**: In the ideal case above, users will interact with something on
    a site that triggers a prompt. In less ideal cases, the user might not have
    interacted with anything at all, or they may have interacted with an element
    that was unrelated to the request. Given this uncertainty, user agents rely
    on common placement of the permission prompt, usually in the top-left of the
    page. Even in the best case, this has the unfortunate effect of shifting the
    point to which users need to pay attention from the thing they clicked on to
    some distant part of the user agent's UI (see example 2). User agents could
    make better decisions and provide better prompts if they could make
    well-founded assumptions about the nature of the user's interaction in the
    content area, and the user's current area of focus. In effect, we think
    there is a benefit to semantic markup for permissions.

    ![](images/image2.png) \
    *Example 2. An example where the permission prompt is far away from the
    user's current area of focus. The permission prompt was triggered because
    the user has just clicked on the crosshair icon in the bottom right, but the
    prompt is easy to miss since it's on the opposite side of the page.*

1.  **Regret**: Given the challenges of permission annoyance and abuse, it is
    reasonable for user agents to suppress a site's future requests for the same
    capability when the first request is blocked. That said, our research shows
    that users can and do change their minds for good reasons. When they change
    their mind, the site can no longer offer an interface in web content and the
    user must search for the appropriate user agent surface. Our research shows
    that users often fail when trying to do so (see example 3). In these cases,
    the user agent's desire to protect the user backfires, and makes the user's
    experience worse as the site will not work as the user wants. User agents
    can help users recover from a permission regret state if they can make
    well-founded assumptions about the nature of the user's intent and
    interaction with web content.

    ![](images/image3.png) \
    *Example 3. An example where the user previously blocked camera and
    microphone access, but has now just expressed a strong intention to
    re-enable them by clicking the unmute buttons. Because the user agent has no
    insight into this interaction in the content area, it is compelled to
    respect the user's previous decision. Especially in a stressful scenario
    such as an important presentation, users will struggle to navigate the
    settings surfaces to change the permission decision.*

1.  <a name="accessibility"></a>**Accessibility**: Permission UI for a
    capability is triggered through the direct use of the capability. Typically
    JavaScript invokes permission UI, presenting an issue for both screen
    readers and magnification users.

    Script attached to an existing DOM element is not interpreted by the screen
    reader. If the DOM element was not accessibility tested and does not provide
    sufficient explanation to its function, there is no way for a screen reader
    user to know that the purpose of that element is to initiate access to a
    capability. Current permissions can be accessible if properly implemented
    and tested, the <permission> element is *accessible by default*.

    Magnification users also struggle with the status quo. A page cannot detect
    if a user is using OS level magnification tools (WAI for privacy reasons). A
    user in a magnified state can easily miss the permission prompt if it falls
    outside of their magnified viewport, and pages cannot assist these users.
    With the <permission> element, the scrim and a contextually localized prompt greatly increase
    the chance that the magnification user will observe the permission request
    after interacting with the element.

Optimizing the trade-off between usability and interruptions hit practical
limits because, fundamentally, user agents
[still lack any understanding of the](#permission-prompts-ux-evaluation)
semantics of user interactions in the content area (i.e. the web page), and
consequently lack insight into the user's present context and task they are
trying to accomplish.

To improve upon the status quo, user agents need to be able to extract
trustworthy signals from the content about the user's task and intent, so they
can be more opinionated and confident in their communication to users regarding
capability access. This is especially important if user agents want to safely
enable users to change their minds while still *respecting user's earlier
permanent block decisions*.

<!-- TOC --><a name="proposal"></a>
## Proposal

*Summary: We propose a new HTML element to the web platform which will be used
to provide an in-content entry point to permission requests. This HTML element
will look like a button and be used just like any other HTML element. The key
difference is that clicking this button will trigger a permission request for
which the user agent can have good confidence that it was user-initiated. The
element will have appropriate safeguards to protect users from common spam and
abuse patterns such as click jacking.* *We propose the name "Page Embedded
Permission Control" which can be abbreviated as the <permission> element.*

To extract a strong signal of user intent, we believe that user agents require
verification of the user interaction step that happened in the content area
directly before the developer triggers the showing of the permission prompt.

We propose to achieve this through introducing a `<permission>` element: a
semantic and semi-trusted UI element that the developer can embed into the
content area. At its simplest, the element takes the shape of a button whose
[appearance](#locking-the-pepc-style) and [behavior](#restrictions) are
materially [controlled](#security) by the user agent, to the extent that is
necessary to ensure interaction with this element is a strong indication of user
intent to use a certain capability.

Developers who follow best practices often implement similar permission flows
today, either as part of their onboarding experience, or as a permanently
displayed affordance on their UI. These developers invite the user to click on a
button to indicate interest, and see grant rates as high as 95% in the
permission prompts that follow. For these developers, the permission element
will be a drop-in replacement that is straightforward to adopt and easy to
polyfill on browsers which do not support the <permission> element. Here are some real-life
examples:

![](images/image4.png) \
*Example 4: A video-conferencing site. Clicking on the "Enable camera" button
triggers a camera permission request.*

![](images/image5.png) \
*Example 5: A search site. Clicking on "Use precise location" triggers a
geolocation permission request.*

![](images/image6.png) \
*Example 6: A messaging site, clicking on the "Enable Desktop Notifications"
button triggers a push notifications permission request.*

We believe that enshrining such a user-initiated approach in standards can
contribute to consistently better permission request flows across the web. This
is because the permission element offers the following compelling advantages to
users and developers alike:

-   It is **non-interruptive**: it is static, small, and contained in the
    content area on the same z-level.
-   It is **discoverable**: it can be placed by the developer within the user's
    focus of attention; with the locality making it easier to find and more
    convenient to interact with.
-   It provides more **contextual information**: it has a visual manifestation
    as opposed to being a procedural API, requiring developers to think about
    integrating it into the user journey at UX design time, as opposed to being
    left as an afterthought during implementation, resulting in knock-on effects
    relating to clearer context.
-   It allows users to **revert** a previous "deny" decision if they have
    changed their mind and are now interested in the feature that the site
    provides.
-   It is more **accessible**. The <permission> element can have standard, localized, screen
    reader announcements that make the purpose of the element comprehensible and
    consistent across websites. The scrim and a contextually localized prompt
    greatly increase the chance that a magnification user will observe the
    permission request after interacting with the element.

Example usage:

```html
<style>
  permission {
    background-color: blue;
    color: white;
    border-radius: 10px;
  }
</style>

<permission
  onpromptdismiss="showContextInfo()"
  type="microphone"
></permission>

<script>
  function showContextInfo() {
    // Provide some additional information since the     .
    // user has just dismissed the permission prompt     .
    // without making a decision.
  }
  navigator.permissions
    .query({ name: 'microphone' })
    .then((permissionStatus) => {
      permissionStatus.onchange = () => {
        // Run the check when the status changes.
        if (permissionStatus.state === 'granted') startUsingMic();
      };
      // Run the initial check.
      if (permissionStatus.state === 'granted') startUsingMic();
    });
</script>
```

<img src="images/image7.png" width="">

A sample user agent implementation given as an example. The permission element
is a button whose text is controlled by the user agent. It can be styled by the
developer to a degree, including limited control over colors and border styling.
Clicking the permission element shows a permission prompt (owner by the user
agent).

<img src="images/image8.png" width="">

<!-- TOC --><a name="goals-non-goals"></a>
## Goals & non-goals

The goal of this proposal is to provide a definition of a Page Embedded
Permission Control (<permission> element) as a means to improve the permission request flow and
to provide a list of security considerations and design options that user agents
should consider.

The <permission> element should both integrate seamlessly with the site but also not be easily
abusable by the site. The <permission> element should provide a strong signal of the user's
intent to start using some permission-gated feature and therefore allow user
agents to make more informed decisions about how to present permission requests
to the user.

In the long-run the <permission> element should become the default solution that sites use to
interact with permission-gated capabilities since it provides a higher quality
experience for the user and simplified developer ergonomics; the existing
JS-only APIs can still be used when an in-page element solution does not fit the
particular use case.

<!-- TOC --><a name="adoption"></a>
## Adoption 

The <permission> element does not to replace existing permission journeys to benefit a large 
fraction of the users who interact with permission gated capabilities. A relatively small number of sites account for a large
fraction of permission requests with real world benefit, for example : 

* Workplace collaboration & social sites requiring Camera/microphone access, such as popular video conferencing and chat apps with voice and/or video functions
* eCommerce sites with store locators

We hope to establish through [developer trials](#developer-trials) whether the <permission> element sufficiently addresses user problems and meets developer needs to gain the traction needed to justify support for this feature. 

<!-- TOC --><a name="developer-trials"></a>
## Developer trials

We have done laboratory user experience testing of the user problems & solution
described in this document. However, we would like to validate whether we have
properly described the user problems and the appropriateness of the solution
with a developer trial of a minimally implemented version of the feature for a
subset of most frequently used permission types.

<!-- TOC --><a name="design-considerations"></a>
## Design considerations

<!-- TOC --><a name="html-element"></a>
### HTML element

<!-- TOC --><a name="usage"></a>
#### Usage

The <permission> element should be easy to integrate into the site and therefore it should be
styleable via CSS like any regular button. For example:

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

Since the <permission> element content is controlled by the user agent, and it should have no
child elements, the parsing model will not include content or the end tag
(similarly to the
[input element](https://html.spec.whatwg.org/multipage/input.html#the-input-element)
parsing model).

When the relevant permission is granted (either previously if the user agent's
permission model allows for it, or during the current session), the text should
change to something informational in order to convey this (e.g. "Location
shared" for a geolocation <permission> element). The user agent should also provide a different
type of UI that allows the user to change their decision. Also, a site might
wish to style the <permission> element differently in the granted state so a CSS pseudo-class
":granted" will be supported.

Example usage:

```html
<style>
  permission {
    background-color: lightgray;
    color: black;
    border-radius: 10px;
  }
  permission:granted {
    background-color: white;
    color: blue;
  }
</style>
<permission type="geolocation"></permission>
```

<img src="images/image10.png"> \
"not granted" state

<img src="images/image11.png"> \
"granted" state

It is not particularly useful to distinguish between different types of "not
granted" states (e.g. a state of `prompt` vs `denied`) as the goal is to provide
the user with a way forward to grant the required permission to the site,
regardless of what permission state they currently find themselves in. Therefore
only a `:granted` CSS pseudo-class is proposed.

Sites may wish to modify the appearance (or hide) the <permission> element when it fails
validation. Therefore a `:invalid` CSS pseudo-class is also proposed. The
invalid pseudo-class is applied when the element's validation status changes
because of 'style' 'type_count' or 'illegal_subframe' reasons. The style should
not be set when the element is not valid for transient reasons.
NOTE: this section is no longer correct. Update when the design of CSS
pseudo-classes is complete.

The <permission> element should be used in parallel with the Permissions API which already
provides the necessary support to allow a site to respond to permission status
changes. This is the encouraged pattern because it ensures that the site will
also respond to permission status changes that are not caused by direct
interaction with the <permission> element (for example, user agents generally allow users to
control permissions on various UI surfaces that are entirely separate from the
site's rendering area). Therefore events specific to the <permission> element will only deal
with the user's actions on the Permission UI, and specifically with the user
closing it either by dismissing it or by taking some other action on it that
causes it to close (e.g. they accept it). This allows sites to respond to this
event by providing more context to potentially help the user make a decision.
These two events will be added to
[GlobalEventHandlers](https://html.spec.whatwg.org/#globaleventhandlers) and can
only target `permission` HTML elements. They do not bubble and are not
cancelable.

-   `onpromptdismiss` - raised when the permission UI triggered by the <permission> element has
    been dismissed by the user (for example via clicking the 'x' button or
    clicking outside the prompt).
-   `onpromptaction` - raised when the permission UI triggered by the <permission> element has
    been resolved by the user taking some action on the prompt itself. Note that
    this does not necessarily mean the permission state has changed, the user
    might have taken an action that maintains the status quo (such as an action
    that continues allowing a permission on a
    [previously granted](#ui-when-the-permission-is-already-granted) type of
    UI).
-   `onvalidationstatuschange` - raised when the <permission> element switches from being
    "valid" to "invalid". The <permission> element is considered "valid" when the user agent
    trusts the integrity of the signal if the user were to click on it, and
    "invalid" otherwise. There are many reasons for which an element can become
    "invalid" as detailed in the [Security](#security) section, but to enumerate
    a few: element style is invalid, element is covered, element has recently
    moved, element has changed size, element is not fully visible in the
    viewport, etc.
-   The following two attributes are added to the `permission`
    object which are related to the validation status:
    -   `boolean isValid` - indicates whether the status has transitioned to
        "valid" or not.
    -   `string invalidReason` - indicating the reason why the status is "invalid" (or
        "" if it's valid), and can be one of the following values:
        1. ["recently_attached"](#annoyance): the element has just been attached
        to the DOM,
        1. ["type_invalid"](#pepc-attributes): the `type` attribute does not
        have a supported value,
        1. ["illegal_subframe"](#conditions-for-usage-in-subframes): conditions
        for usage in a subframe are not met,
        1. ["unsuccessful_registration"](#one-pepc-per-permission-type-per-page):
        the allowed limit of permission elements is exceeded,
        1. ["intersection_changed"](#annoyance): the element has recently moved
        (either by layout changes or scrolling),
        1. ["intersection_out_of_viewport_or_clipped"](#annoyance): the element
        is not currently fully in the viewport of its frame,
        1. ["intersection_occluded_or_distorted"](#annoyance): the element is
        currently covered by some other element,
        1. ["style_invalid"](#locking-the-pepc-style): the element's style does
        not pass validation.

Example usage:

```html
<permission type="geolocation" onpromptdismiss="showLocationWarning()"></permission>
<script>
  // Called when the <permission> element-triggered permission flow has been canceled by the user
  // without a decision being made.

  function showLocationWarning() {
    // Here the site could, for example, provide additional context next to the
    // <permission> element such as "feature X will not work without location".
    …
  }

  // Use the permissions API to check when "feature X" can start being used.

  navigator.permissions.query({name: "geolocation"})
    .then((permissionStatus) => {
      permissionStatus.onchange = () => {
        // Track future status changes that allow the site to start using feature X.
        if (permissionStatus.state === "granted")
          startFeatureX();
      };
      // The permission status could already be granted so the site can use feature X already.
      if (permissionStatus.state === "granted")
          startFeatureX();
    });
</script>
```

<!-- TOC --><a name="restrictions"></a>
#### Restrictions

It is crucial that the site is not able to easily abuse the <permission> element to trigger a
permission prompt without the user's express intent, because the user agent
should be able to have reasonable confidence that the user intended to trigger a
permission flow.

In order to maintain the integrity of the user intent, the user agent needs to
mitigate situations that would allow malevolent sites to obtain a click on the
<permission> element by using deceitful tactics. The [Security](#security) section elaborates on
this aspect.

<!-- TOC --><a name="pepc-attributes"></a>
#### The <permission> element attributes

<table>
  <tr>
    <td>type</td>
    <td>
      Used to specify which permission the <permission> element applies to. Can also be a
      space-separate list of permissions if the user agent support grouping
      these permission together (e.g. microphone and camera permission requests
      are commonly grouped together)
    </td>
  </tr>
  <tr>
    <td>preciselocation</td>
    <td>
      Values: <code>true/false</code> (for the
        <a href="https://www.w3.org/TR/geolocation/#position_options_interface">
        geolocation</a> permission type) 
    </td>
  </tr>
  <tr>
    <td>sysex</td>
    <td>
      Values: <code>true/false</code>  (for the
         <a href="https://webaudio.github.io/web-midi-api/#permissions-integration">
        midi</a> permission type)
    </td>
  </tr>
  <tr>
    <td>panTiltZoom</td>
    <td>
      Values: <code>true/false</code> (for the
        <a href="https://github.com/w3c/mediacapture-image/blob/main/ptz-explainer.md#control-camera-pantilt">
        camera</a> permission type)
    </td>
  </tr>
  <tr>
    <td>onpromptdismiss onpromptaction onvalidationstatuschange</td>
    <td>Event handlers as discussed above.</td>
  </tr>
  <tr>
    <td>is-valid reason</td>
    <td>As discussed above.</td>
  </tr>
  <tr>
    <td>lang</td>
    <td>
      The global
      <a href="https://html.spec.whatwg.org/multipage/dom.html#attr-lang">lang</a>
      attribute has further purpose on the `permission` HTML element. Since the
      contents of the <permission> element is set by the user agent, this attribute will indicate
      what language the text should be in. The user agent will attempt to provide
      the text in that language if possible.<br/><br/>
      Note: This will only be used to determine the language of the HTML element,
      not of the permission confirmation UI itself. The permission UI should use
      the same language that the rest of the user agent uses on similar security
      surfaces.
    </td>
  </tr>
</table>

<!-- TOC --><a name="permission-ui"></a>
### Permission UI

After the user clicks on the <permission> element, a confirmation UI should be presented to the
user by the user agent in order to confirm their decision to grant the
permission and to potentially allow the user to configure their decision. It is
up to the user agent to design this confirmation UI, however there are some
considerations that should be taken into account:

-   The user agent should consider different UI for different scenarios based on
    the current permission status
-   The user agent should consider making use of the <permission> element relative page position
-   The user agent should consider how the <permission> element interacts with any mechanisms
    they have in place that would normally prevent permission request from
    reaching the user

<!-- TOC --><a name="standard-ui"></a>
#### Standard UI

Since the user agent has the strong signal of the user's intent and current
focus, it can use this to improve the general UX without risking interrupting
the user.

Here is an example of what the user might be presented with after they click the
<permission> element:

![](images/image15.png)

And a close-up of just the confirmation UI:

![](images/image16.png)

Key points to consider:

-   The confirmation UI can make use of the <permission> element position to position itself on
    the screen
-   The confirmation UI can be brought more into attention by the user agent. In
    the example above this is done by the user agent applying a gray filter over
    the site content area
-   The confirmation UI should have an obvious way for the user to change their
    mind

<!-- TOC --><a name="ui-when-the-user-cant-change-the-permission"></a>
#### UI when the user can't change the permission

There are many user agents that offer mechanisms for permission granting that
involve some sort of administrator or management system, which the user can not
override. In this type of situation, the <permission> element text itself should not change (as
it can be used as a potential fingerprinting bit), instead the confirmation UI
should clarify the situation to the user. For example:

![](images/image17.png)

<!-- TOC --><a name="ui-when-there-is-a-mechanism-that-would-block-the-request"></a>
#### UI when there is a mechanism that would block the request

As discussed previously there are many mechanisms that user agents implement
that prevent permission requests: permanent denies (either implicit or
explicit), duration-based denies, heuristics, blocklists, ML-based automatic
blocks etc.

Each of these mechanisms should be carefully weighed against the strong signal
sent by the user by clicking the <permission> element. It might be the case that this signal
should override some of these mechanisms entirely (e.g. heuristics or ML models
are probably good candidates to not apply to <permission> element-triggered permission prompts)
or that some compromise needs to be reached. It is impossible to go into more
detail here since all user agents have their own mechanisms and end-goal for
what a good permission UX is.

As an example, this is how a confirmation UI could look when the site is in a
"deny" state but the user has clicked the <permission> element:

![](images/image18.png)

<!-- TOC --><a name="ui-when-the-permission-is-already-granted"></a>
#### UI when the permission is already granted

When the permission is granted the <permission> element text changes to reflect this. This also
serves as a confirmation of the user decision having taken effect (though the
user agent should not rely on the <permission> element as an always-visible indicator).

When the user clicks on the <permission> element in this state, a permission prompt does not
make much sense. Instead the UI could be used for other reasonable purposes, for
example to allow the user to change their previous decision.

An example of how this could look:

![](images/image19.png)

<!-- TOC --><a name="complexity"></a>
### Complexity 
Most of the implementation complexity of the <permission> element lies in the annoyance reduction mechanisms. As previously mentioned, the main security surface is the "Confirmation UI" which is straightforward to implement. 

This proposal describes a deliberately conservative set of annoyance reduction mechanisms with the aim to discovering in [developer trials](#developer-trials) which restrictions will be infeasible for users, developers or implementors. 

<!-- TOC --><a name="implementor-portability-internationalization-upkeep"></a>
### Implementor portability, internationalization & upkeep
Most browsers already have user recognizable iconography for common permissions such Camera/Microphone or Location and the <permission> element can share strings used in the existing permission journey. 

Developers will need to handle the `onvalidationstatuschange` event, which helps to future proof websites against unexpected changes in browser implementor validation criteria. 

<!-- TOC --><a name="fallback-solutions"></a>
### Fallback solutions

Unsupported browsers will need to implement fallback solutions which will slow
adoption. However, we believe this is surmountable for two reasons:

1.  In many cases the polyfill will not be needed as the <permission> element can augment
    existing journeys.
1.  In cases where the <permission> element replaces existing journeys the polyfill is typically
    straightforward, with a button linking to capability usage.
1.  In UX testing we have found the <permission> element significantly outperformed other
    permission request flows for both user & developer preferred outcomes (lower
    decision "regret", whether granted or blocked), and a much higher success
    rate of users reverting past decisions they regretted. This makes the <permission> element
    appealing to developers in use cases where a permission is critical to a
    specific user journey, such as a user interacting with a locator when trying
    to find their hotel.

We would like to validate whether our assumptions concerning fallback solutions
with real developer trials of a prototype implementation.

<!-- TOC --><a name="security"></a>
## Security

<!-- TOC --><a name="threat-model"></a>
### Threat model

The goal of user agents should be to ensure that the <permission> element is not trivial to
abuse. There are two primary types of abuse: safety, and user annoyance which we
will consider separately as they are addressed by the confirmation UI and by
constraints on the <permission> element element respectively.

<!-- TOC --><a name="safety"></a>
#### Safety

The safety of the <permission> element hinges on there being a permission prompt that is used to
confirm the user's decision to grant the permission, we call this the
"Confirmation UI". The confirmation UI is strictly better than the existing
non-modal permission prompt implemented by most browsers because it:

-   (Same as current UI) is generated by the browser, with the only inputs
    accepted from the website are permission(s) types requested.
-   Modal, requiring explicit dismiss or decision gesture for the user journey
    to continue, with website content obscured with a semi-opaque and blurred
    scrim which prevents the site from manipulating the user's decision making
    or obfuscating the modal content.

The strict constraints of the confirmation UI make the <permission> element minimally as safe
(and arguably safere) than existing non-modal UI.

<!-- TOC --><a name="annoyance"></a>
#### Annoyance

Mitigating annoyance by ensuring user intent is more complex than ensuring the
safety of the <permission> element, but equally important to the goals of the proposal. Without
mitigating annoyance we don't believe it to be reasonable to impose the safer,
but more disruptive, modal confirmation UI.

The site can use techniques to annoy the user by repeatedly triggering modals,
including:

-   The site could trick the user by choosing some misleading text (e.g. "Click
    here to proceed"). Therefore the text on the <permission> element should not be able to be
    set by the site, instead the user agent should make sure to set it to
    something comprehensive (e.g. "Share location" for a geolocation <permission> element).
-   The style of the <permission> element can be set to obscure the purpose (e.g. setting the
    same text color and button color would make the text unreadable). Therefore
    the style should be verified, validated and overridden by the user agent as
    needed. More details in the
    [Locking the <permission> element style](#locking-the-pepc-style) section
-   The <permission> element might be partially covered (to hide the text) with another HTML
    element. Therefore the user agent should verify that the <permission> element has been
    visible already for some short time (e.g. 500ms or so) before it's clicked.
    User agents that implement the
    [IntersectionObserverV2](https://github.com/w3c/IntersectionObserver/blob/v2/explainer.md)
    API can make use of it internally.
-   The site might try to obtain a click on the <permission> element by moving it where the user
    is about to click. Therefore the user agent should ensure that the <permission> element has
    not been moved recently (e.g. in the past 500ms or so).
-   The site might try to obtain a click on the <permission> element by inserting it into the
    DOM where the user is about to click. Therefore the user agent should ensure
    that the <permission> element has not been inserted into the DOM recently (e.g. in the past
    500ms or so).

Reminder: the user agent-rendered confirmation UI after the user clicks on the
<permission> element is what makes the <permission> element ultimately secure. User agents should take proper
care to ensure this confirmation UI is at least as secure as their current
permission prompt flow.

<!-- TOC --><a name="fallbacks-when-constraints-are-not-met"></a>
### Fallbacks when constraints are not met

The [Security](#security) section has details on various mitigations and checks
that the user agent should strongly consider implementing to preserve the
integrity of the strong signal of user intent that the <permission> element should provide. User
agents should also consider how to handle scenarios where these checks or
mitigations fail, and most importantly what the outcome of a click on the <permission> element
should then be.

There are 3 main possible approaches to consider, if the integrity of the <permission> element
click is not assured:

-   The click triggers the legacy permission flow (as if it was triggered by the
    equivalent JS API). This approach is worth considering if the failing check
    or mitigation is not something self-correcting (e.g. styling issue or the
    <permission> element being covered).
-   The click does nothing. This approach is worth considering if the failing
    check or mitigation will self-correct itself (e.g. if the <permission> element has moved
    recently there will be a short cooldown before the <permission> element integrity is
    restored).

<!-- TOC --><a name="locking-the-pepc-style"></a>
### Locking the <permission> element style

User agents should lock down the styling of the <permission> element in regards to the color,
size, border, rounding, contents, icon, etc. of the <permission> element, as outlined below.
This provides protection against some of the clickjacking and social engineering
attacks that bad actors might use to trick the user into clicking the element.

The following table details the list of CSS properties which should have special rules applied to them:

| Property                   | Rules                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `color` `background-color` | Can be used to set the text and background color, respectively. The contrast between the 2 colors needs to be  sufficient for clearly legible text (contrast ratio of at least 3). Alpha has to be 1. Element will be disabled otherwise.                                                                                                  |
| `font-size` `zoom`         | Must be set within the equivalent of 'small' and 'xxxlarge'. Element will be disabled otherwise. Zoom will be taken into account when computing font-size.                                                                                                                                                                                 |
| `border-width`             | Values over 1em will be corrected to 1em.
| `outline-offset`           | Negative values will be corrected to 0.                                                                                                                                                                                                                                                                                                    |
| `margin` (all)             | Values under 4px will be corrected to 4px. This is done to help prevent false positives for the logic that detects the element being covered by something else.                                                                                                                                                                            |
| `font-weight`              | Values under 200 will be corrected to 200.                                                                                                                                                                                                                                                                                                 |
| `font-style`               | Values other than 'normal' and 'italic' will be corrected to 'normal'.                                                                                                                                                                                                                                                                     |
| `word-spacing`             | Values over 0.5em will be corrected to 0.5em. Values under 0 will be corrected to 0                                                                                                                                                                                                                                                        |
| `display`                  | Values other than 'inline-block' and 'none' will be corrected to 'inline-block'.                                                                                                                                                                                                                                                           |
| `letter-spacing`           | Values over 0.2em will be corrected to 0.2em. Values under -0.05em will be corrected to -0.05em.                                                                                                                                                                                                                                           |
| `min-height`               | Will have a default value of 1em. If provided, the maximum computed value between the default and the provided values will be considered.                                                                                                                                                                                                  |
| `max-height`               | Will have a default value of 3em. If provided, the minimum computed value between the default and the provided values will be considered.                                                                                                                                                                                                  |
| `min-width`                | Will have a default value of 'fit-content'. If provided, the maximum computed value between the default and the provided values will be considered.                                                                                                                                                                                        |
| `max-width`                | Will have a default value of 3 * 'fit-content'. If provided, the minimum computed value between the default and the provided values will be considered. However this does not apply if the element has a border with a width of at least 1px and a color that has a contrast ratio with the background-color of at least 3 and alpha of 1. |
| `padding-top`              | Will only take effect if 'height' is set to 'auto'. In this case values over 1em will be corrected to 1em and `padding-bottom` will be set to the value of `padding-top`.                                                                                                                                                                  |
| `padding-left`             | Will only take effect if 'width' is set to 'auto'. In this case values over 5em will be corrected to 5em and `padding-right` will be set to the value of `padding-left.`. This does not apply under the same border conditions as 'max-width', except 'padding-right' with still be set to the value of 'padding-left'.                 |
| `cursor`                   | Will have a default value of 'pointer' but 'not-allowed' is also a valid value. Any other value (including custom images) is corrected to 'pointer'. |

The following CSS properties are usable as normal: `font-kerning`, `font-optical-sizing`, `font-stretch`, `font-synthesis-weight`, 
`font-synthesis-style`, `font-synthesis-small-caps`, `font-feature-settings`, `forced-color-adjust`, `text-rendering`, `align-self`, `anchor-name`
`aspect-ratio`, `border` (and all `border-*` properties), `clear`, `color-scheme`, `contain`, `contain-intrinsic-width`, `contain-intrinsic-height`,
`container-name`, `container-type`, `counter-*`, `flex-*`, `float`, `height`, `isolation`, `justify-self`, `left`, `order`, `orphans`, `outline-*`
(with the exception noted above for `outline-offset`), `overflow-anchor`, `overscroll-behavior-*`, `page`, `position`, `position-anchor`,
`content-visibility`, `right`, `scroll-margin-*`, `scroll-padding-*`, `text-spacing-trim`, `text-transform`, `top`, `visibility`, `x`, `y`,
`ruby-position`, `user-select`, `width`, `will-change`, `z-index`.

Additionally all logically equivalent properties to the ones above can be used (e.g. `inline-size` is equivalent to `width`) following the same
rules as their equivalent.

<!-- TOC --><a name="one-pepc-per-permission-type-per-page"></a>
### One <permission> element per permission type per page

To prevent sites from tile-covering their site with the <permission> elements, there should be a
limit of at most 2 <permission> element per permission type, per page. The reason the limit is
2 is to support some legitimate use cases where multiple <permission> element might be needed
on the same page.

<!-- TOC --><a name="conditions-for-usage-in-subframes"></a>
### Conditions for usage in subframes

Subframe usage will be allowed but several security constraints need to be
enforced:

-   Permission Policy should be first checked to ensure that the permission is
    allowed in the subframe.
-   To prevent clickjacking attacks where a malicious site embeds a legitimate
    site that uses a <permission> element, the `frame-ancestors` CSP directive must be
    explicitly declared if a document using <permission> element is embedded cross-origin (to
    the top level frame). This ensures that permissions cannot be obtained by a
    bad actor via a cross-origin embedded site, as the embedded site needs to
    explicitly opt in. The developers who use the <permission> element without taking any further
    action will be safe by default.

<!-- TOC --><a name="synthetic-click-events"></a>
### Synthetic click events

Click events which are simulated by the site (e.g. via the `click()` function)
should not be considered.

Click-like event handlers (such as `onclick`, `onmousedown`, etc.) will function
as expected.

<!-- TOC --><a name="privacy"></a>
## Privacy

<!-- TOC --><a name="exposing-user-information-bits"></a>
### Exposing user information bits

Extreme care needs to be taken to ensure that information is limited to what a
site needs to know. Information that can be already determined (for example via
the Permissions API) is fine to be exposed via the <permission> element. Other sensitive
information should not be.

*Example:* Many user agents provide a way for an admin to manage certain
permissions on behalf of the user. In such cases the user agent might decide to
have the <permission> element text reflect this state, perhaps by setting the <permission> element text to
"Admin blocked". This would however provide information to the site that they
would otherwise not be privy to, namely that the user's settings are partially
controlled by an administrator.

<!-- TOC --><a name="status-quo-elaboration"></a>
## Status quo elaboration

<!-- TOC --><a name="permission-prompts-ux-evaluation"></a>
### Permission prompts UX evaluation

Below are two examples of browser permission prompts. The prompts are triggered
when the site starts using some specific sensitive capability. Transparently to
the site, the user agent will decide whether user consent is needed (based on a
variety of factors such as previous decision, settings, etc.) and it will
trigger the permission prompt if it is indeed needed. The permission prompts are
drawn starting from a fixed point above the web content area.

![](images/image20.png) \
*Example notification permission prompt on Chrome*

![](images/image21.png) \
*Example location permission prompt on Firefox*

In order to evaluate the user experience for these prompts **from the
perspective of the user agent**, there are some questions that can be
considered:

1.  Does the user notice this prompt or is their attention engaged elsewhere? \
    The prompt was triggered by the site using a JavaScript API at some point
    that might seem entirely arbitrary (from the user's perspective). There is
    no way to tell whether this has any connection to what the user is currently
    doing, which significantly increases the chance that the prompt will simply
    go unnoticed by the user.
1.  Does the user understand what the site feature that triggered this
    permission request does? Can they weigh the potential benefit that the
    feature can provide them against the potential downsides? The user might
    understand and be aware of why a site might request their permission to
    access some powerful feature, or they might have no context for this and
    there are no signals to distinguish between these scenarios.
1.  Does the user have any interest in the site feature that requires their
    permission? It could certainly be the case that this prompt is in response
    to the user showing interest in some feature (e.g. by pressing a button that
    says "Use my location" on a food delivery service site), but it could also
    be the case that the user is not interested in the feature at all.
1.  If the user chooses to deny the permission request here, will they know how
    to revisit this decision in the future should they change their mind? Many
    user agents implement some form of temporary or permanent deny decision
    policy to prevent sites from spamming permission prompt requests. However
    this makes it difficult for sites to recover from this state even if the
    user shows clear interest in the feature.

<!-- TOC --><a name="user-agent-abuse-mitigations"></a>
### User Agent abuse mitigations

The shortcomings of the current status quo of permission prompts practically has
the side-effect that user agents need to be quite defensive to shield users from
unwanted permission prompts:

1.  Many user agents implement a "permanent deny" policy, and other user agents
    offer it as an option in the permission prompt. This means that a site will
    not be able to ask for permission again after the user has blocked it.
    Sometimes this is for some fixed (or increasing) duration, not strictly
    speaking permanent. This helps prevent unwanted permission prompt spam
    though it can sometimes lead to user confusion if they wish to change their
    mind later as it requires them to discover the appropriate UI that allows
    them to make the change manually.
1.  Some user agents use heuristics, blocklists or ML-powered algorithms in an
    effort to shield users from unwanted permission prompts.

Even with these measures in place, most user interactions on permission prompts
are negative. For notifications (the most requested permission type), Google
Chrome metrics data shows that the percentage of prompts that are ignored,
dismissed or blocked by the user add up to approx 92% on desktop platforms and
85% on mobile devices.

A permission model designed to be initiated by the user would solve these
issues. If the user initiates the permission request it ensures that:

1.  The user understands the purpose of the permission, or at least has enough
    **context** to feel comfortable engaging in an activity that uses this
    permission.
1.  The user's current flow or task is related to granting this permission and
    as such it's unlikely that the permission request could be **interruptive**.
1.  The user agent can ensure the subsequent UI is placed near the current
    **focus** of attention of the user. This is because the user has just
    interacted with some piece of UI to request the permission which means their
    focus is likely in the area. Because of the above, it is unlikely that such
    a placement is interruptive or annoying.

<!-- TOC --><a name="alternatives-considered"></a>
## Alternatives considered

<!-- TOC --><a name="no-platform-changes"></a>
### No platform changes

Sites could replicate most of this behavior currently by using a button that
triggers the permission request. Developers could be actively encouraged to use
this pattern via articles, communications etc.

Disadvantages:

1.  There is no signal or guarantee indicating the user's intent. This means
    that the user agent still needs to remain defensive about permission
    requests.
1.  It requires user experience design and consideration from the site's side.
    There are many ways to get this wrong and provide a suboptimal user
    experience. Also, providing a solution with best-practices built in helps
    resource-constrained development teams more.

<!-- TOC --><a name="improve-existing-usage-triggered-permission-request-journey"></a>
### Improve existing usage triggered permission request journey

The existing permission request journey is triggered by usage of the relevant
capability, for example, `getUserMedia` triggering a Camera permission journey.
We agree there may be ways to improve the current journey and we intend to
explore these in parallel, however, there is an upper bound to improvements.
Specifically:

1.  Accessibility. Native HTML elements (such as the proposed permission element
    in this explainer) come with built-in roles, properties, and keyboard
    interaction behaviors understood by assistive technologies. While JavaScript
    solutions can be *made* accessible, the <permission> element can be accessible by default.
1.  User intent. JavaScript triggered UI journeys will never be able to capture
    user intent the way we believe is possible with the <permission> element. User gestures are
    easily gamed by manipulative or malicious websites. It's difficult to see
    how more advanced heuristics could be used to determine user intent, and we
    believe that any heuristics to determine user intent would be significantly
    more complicated that determining user intent for the semantic element.
1.  Context. While sites *may* do a good job with providing context to the user
    about why a permission journey is happening, the <permission> element *ensures* the context
    is present with consistent button UI and labels, and strong signal of user
    intent.
1.  Reconsideration. Sometimes users make a mistake in a permission decision.
    It's undesirable for browsers to allow users to reconsider past decisions
    with the usage-driven UI model, as enabling reconsideration would present
    spammy or abusive websites the ability to repeatedly prompt users who block
    a permission request. Help text directing users to navigate browser UI to
    revisit past permission decisions requires web developers to provide users
    with evergreen browser-specific directions on changes to the browser
    permission settings. In practice this is a significant burden on web
    developers, often results in stale directions, and users seldom succeed at
    these journeys even when the directions are up-to-date and clear.

<!-- TOC --><a name="separate-this-into-two-proposals-1-improved-user-intent-signal-and-2-permission-prompt-improvements"></a>
### Separate this into two proposals, (1) improved user intent signal and (2) permission prompt improvements

There are various permission prompt improvement suggestions as part of this
proposal. The proposal could be trimmed down, by splitting the permission
prompt improvements into some separate document.

However these suggestions are necessary in order to reason about the usefulness
of the proposal, and the issues it can help address. While this proposal
makes no prescriptions when it comes to the actual permission model or
permission flow, the mocks and examples provided help visualize and explain
the types of changes user agents can make, and therefore they are necessary
to help evaluate the benefits of the proposal.

<!-- TOC --><a name="extending-an-existing-element"></a>
### Extending an existing element

Instead of adding a new element, existing HTML elements can be augmented to
provide the same result. The immediate candidates are the `input` and `button`
elements which could have new properties added to achieve the same
functionality.

This could be an example of how this would look like:

```html
<p>
  Button:
  <button permission-type="geolocation"></button>
</p>

<p>
  Input:
  <input type="permission-control" permission-type="geolocation" />
</p>

<style>
  button[permission-type],
  input[permission-type] {
    background-color: white;
    color: blue;
  }
</style>
```

<img src="images/image22.png">

Disadvantages:

1.  `button`
    1.  Backwards-compatibility and interoperability: old versions and user
        agents that don't implement the permission element will still render and
        create a `button` element that does not do anything. This is a worse
        experience if not compensated with some other solution (e.g. a
        polyfill).
    1.  Flexibility: this proposal generally imagines the HTML control as a
        button, but future extensions of this element could instead use some
        different type of UI like a checkbox, a link, a radio etc.
    1.  Counter-intuitive: buttons usually have a lot more flexibility than the
        <permission> element has (e.g. the button text is set by the author). A site author
        using the <permission> element would have to be always aware of the differences between
        the <permission> element and a regular button. If the behavior between elements is
        significantly different then it makes sense that they should be distinct
        elements.
1.  `input`
    1.  The `input` [element represents a typed data field, usually with a form
        control to allow the user to edit the
        data](https://html.spec.whatwg.org/multipage/input.html#the-input-element).
        Different input types are designed generally to be used as part of a
        form that the user enters data into and submits. While some exceptions
        exist (e.g. `<input type="button">`), they still represent controls that
        are supposed to integrate within a form (a `submit` or `reset` button, a
        hidden field etc.). Since there is no connection between forms and the <permission> element,
        adding a new input
        [type](https://html.spec.whatwg.org/multipage/input.html#attr-input-type)
        would be a poor design fit.

<!-- TOC --><a name="providing-a-registration-js-api"></a>
### Providing a registration JS API

A JS API could be used to mark a particular HTML element as the <permission> element of the
page.

```html
<button id="pepc">Share location</button>

<script>
  pepc_params = {};
  pepc_params['type'] = 'geolocation';
  navigator.permissions.registerPEPC(
    document.getElementById('pepc'),
    pepc_params,
  );
</script>
```

Disadvantages:

1.  This does not solve the problem of permissions not really being brought into
    focus in the interaction design process.
1.  The possibility of dynamically selecting which element is the <permission> element
    complicates the verification and constraints we recommend as part of
    security. It is more robust for the same element to either always be a <permission> element
    or not.
1.  Backwards-compatibility and interoperability: developers need to always be
    careful to manually remove their HTML button that they planned to declare as
    a PECP if the user agent does not implement the <permission> element API, otherwise their
    site will simply contain a button that does nothing.
1.  Counter-intuitive: buttons usually have a lot more flexibility than the <permission> element
    has (e.g. the button text is set by the author). A site author using the
    <permission> element would have to be always aware of the differences between the <permission> element and a
    regular button. If the behavior between elements is significantly different
    then it makes sense that they should be distinct elements.

<!-- TOC --><a name="extending-the-permissions-api-to-provide-an-anchor-point"></a>
### Extending the Permissions API to provide an anchor point

A somewhat similar experience could be achieved by extending the Permission API
to allow sites to specify an HTML element as an anchor when requesting a
permission. This could be done by adding a `request()` function to the
[permissions interface](https://www.w3.org/TR/permissions/#permissions-interface)
which takes as one of the arguments an HTML element that can be used as the
anchor.

```html
<p id="pepc_anchor">This is where the permission prompt will be anchored</p>

<script>
  navigator.permissions.request(
    { name: 'geolocation' },
    document.getElementById('pepc_anchor'),
  );
</script>
```

Disadvantages:

1.  There is no signal of the user's intent and therefore user agents can not
    make any of the improvements listed in the sections above, except for
    positioning the prompt. However the user agent will still need to remain
    defensive and make sure the user is protected against permission prompt
    spam.
1.  This opens the permission prompt more to abuse as it allows malicious sites
    to position it without having implemented any of the restriction or security
    mechanisms that a <permission> element would have.

<!-- TOC --><a name="allowing-recovery-via-the-regular-permission-flow"></a>
### Allowing recovery via the regular permission flow

The regular permission flow that is currently implemented, could be used to
allow users to recover from situations where the permission is blocked. However
this needs to be balanced with protecting users from spam from bad actors on the
web. There are some potential approaches to consider:

1.  Some reputation-based mechanism that allows certain origins to recover from
    a blocked permission state. This raises difficult ethical and technical
    questions depending on which entity decides the how origin reputation is
    calculated, and how a fair algorithm could be designed. The ethical risk is
    that limiting access to powerful APIs based on origin reputation is a
    dangerous feature that can potentially allow bad actors to attempt to game
    the reputation algorithm (in their favor, or for a competitor in their
    disfavor), and even the user agent itself could use this algorithm to
    unfairly favor certain proprietary origins. The technical difficulty
    consists of designing an algorithm that is fair and precise. It needs to
    have a precision comparable to the precision of the `<permission>` element
    signal of user intent.
1.  A heuristic could be used to allow recovering from a blocked permissions
    state based on various aspects of the user interaction on the site, previous
    user action history, time since permission has been blocked, etc. However it
    is very unlikely that the precision of such a heuristic would get even close
    to the direct signal raised by the user's interaction with the
    `<permission>` element. The usefulness of an unpredictable heuristic that
    "sometimes" allows recovery makes for a bad developer and user experience.

<!-- TOC --><a name="implementing-an-origin-based-permission-allow-list-registry"></a>
### Implementing an origin based permission allow list registry

An allow list registry could be created allowing well behaved origins to request
a review and once authorized the behavior of the Permission API could be
modified to allow the user to change previous permission decisions.

Advantages:

1.  No change to HTML standards required. The allow list simply changes the
    behavior of the permission API on certain origins.

Disadvantages:

1.  Low effectiveness at scale and bias towards larger, better known origins.
    The vast number of origins on the internet ensures that most origins could
    not be reviewed. Many long tail sites offering genuine user value and
    applying best practices, which might nominally qualify, would be excluded or
    face long waiting periods despite implementing best practices.
1.  Faulty reviews. This system would depend not only on an unbiased review
    system (a tremendously difficult problem), but also on the ability of the
    reviewer to detect cloaking behaviors that could lead to an incorrect allow
    list approval. Sites could also change in design at any point, such as new
    site ownership, and there is no practical way to signal to the allow list
    registry that a fresh review was needed.
1.  Cost. A system of allow listing origins would be a significant ongoing
    operational expense, including a review and appeals process. Many user
    agents would be excluded from being able to implement such a system.
1.  Consistency. Different user agents would likely have their own allow list
    mechanism resulting in inconsistent best practice guidance to developers and
    headaches navigating the constraints of the allow list review process.

<!-- TOC --><a name="extending-the-pepc-in-the-future"></a>
## Extending the <permission> element in the future

<!-- TOC --><a name="pepc-for-additional-user-agent-settings"></a>
### The <permission> element for additional user agent settings

Some user agents support installable web apps with additional user features such
as Run on OS Login. In the future the <permission> element could be used to allow sites to embed App
settings relevant to installed web app behavior.

<!-- TOC --><a name="not-just-a-button"></a>
### Not "just" a button

This current proposal assumes an HTML element similar to a button. In the
future, user agents might also provide the <permission> element in the form of a link, a
checkbox or some new bespoke UI, based on in particular which permission is
being requested. There is a lot of flexibility in designing future versions that
better fit more niche types of permissions.
