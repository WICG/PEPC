# How to use PEPC
## Enabling PEPC
### Chrome
Use a version of Chrome that is version 121.0.6136 or higher. This might mean you need to download a [canary](https://www.google.com/chrome/canary/), [dev](https://www.google.com/chrome/dev/) or [beta](https://www.google.com/chrome/beta/) version of Chrome. You can check your current browser version by visiting `chrome://version`.

To enable the PEPC feature you need to start Chrome with the command line flag: `--enable-features=PermissionElement`. You need to make sure the Chrome app is fully closed; simply starting a new instance while one is already open will not work on certain Operating Systems. You can verify the flag is active by visiting `chrome://version`.

## Feature Detection
You can use code such as the following example to determine if PEPC is supported:

```JS
let el = document.createElement("permission");
if (el instanceof HTMLUnknownElement) {
  // PEPC not supported
  ...
} else {
  // PEPC supported
  ...
}
```

Alternatively if you want a more lightweight version and don't need to create an element you can use:

```JS
if (typeof HTMLPermissionElement === 'function') {
  // PEPC supported
} else {
  // PEPC not supported
}
```

More advanced feature detection (such as per-type) is not currently supported.

## Using PEPC
You can visit https://permission.site/pepc for a quick example and test.

To add the PEPC element to your page simply include it as you would any other HTML element. It does not have an end tag or contents.

```HTML
<permission type="camera microphone" ondismiss="promptDismiss()" onresolve="promptResolve()">
```

Current supported `type` attribute values (on Chrome) are: `"camera"`, `"microphone"` or both together `"camera microphone"`.

In order to make use of the permission you can use the permissions API to listen to permission status changes. This has the advantage that you will catch all permission status changes.

```JS
navigator.permissions.query({name: "camera"})
  .then((permissionStatus) => {
    permissionStatus.onchange = () => {
      // Track future status changes that allow the site to start using camera.
      if (permissionStatus.state === "granted")
        startUsingCamera(); // <= your implementation here
    };
    // The permission status could already be granted so the site can use camera already.
    if (permissionStatus.state === "granted")
        startUsingCamera(); // <= your implementation here
  });
```
## Applying style to the PEPC

The PEPC style is heavily restricted and controlled. The following table details some properties that have restrictions or special rules applied to them:

| Property                   | Rules                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `color` `background-color` | Can be used to set the text and background color, respectively. The contrast between the 2 colors needs to be  sufficient for clearly legible text (contrast ratio of at least 3). Alpha has to be 1. Element will be disabled otherwise.                                                                                                  |
| `font-size` `zoom`         | Must be set within the equivalent of 'small' and 'xxxlarge'. Element will be disabled otherwise. Zoom will be taken into account when computing font-size.                                                                                                                                                                                 |
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



The following CSS properties can be used as normal: `font-kerning`, `font-optical-sizing`, `font-stretch`, `font-synthesis-weight`, 
`font-synthesis-style`, `font-synthesis-small-caps`, `font-feature-settings`, `forced-color-adjust`, `text-rendering`, `align-self`, `anchor-name`
`aspect-ratio`, `border` (and all `border-*` properties), `clear`, `color-scheme`, `contain`, `contain-intrinsic-width`, `contain-intrinsic-height`,
`container-name`, `container-type`, `counter-*`, `flex-*`, `float`, `height`, `isolation`, `justify-self`, `left`, `order`, `orphans`, `outline-*`
(with the exception noted above for `outline-offset`), `overflow-anchor`, `overscroll-behavior-*`, `page`, `position`, `position-anchor`,
`content-visibility`, `right`, `scroll-margin-*`, `scroll-padding-*`, `text-spacing-trim`, `top`, `visibility`, `x`, `y`, `ruby-position`, `user-select`,
`width`, `will-change`, `z-index`.

Additionally all logically equivalent properties to the ones above can be used (e.g. `inline-size` is equivalent to `width`) following the same
rules as their equivalent.

## Providing feedback
If you're a dev and you have feedback for improvements on the ergonomics or shape of the API, please feel free raise an issue against this repository.

If you have found an implementation bug in one specific browser, you can report it by raising an issue against that specific browser tracking system:
* Chrome/Chromium - https://crbug.com/ (please use the component `Chromium>Internals>Permissions>PermissionElement`).
