# How to use PEPC
## Enabling PEPC
### Chrome
Use a version of Chrome that is version 121.0.6136 or higher. This might mean you need to download a [canary](https://www.google.com/chrome/canary/), [dev](https://www.google.com/chrome/dev/) or [beta](https://www.google.com/chrome/beta/) version of Chrome. You can check your current browser version by visiting `chrome://version`.

To enable the PEPC feature you need to start Chrome with the command line flag: `--enable-features=PermissionElement`. You need to make sure the Chrome app is fully closed; simply starting a new instance while one is already open will not work on certain Operating Systems. You can verify the flag is active by visiting `chrome://version`.

## Using PEPC
You can visit https://permission.site/pepc for a quick example and test.

To add the PEPC element to your page simply include it as you would any other HTML element. It does not have an end tag or contents.

```
<permission type="camera microphone" ondismiss="pepcDismiss()" onresolve="pepcResolve()">
```

Current supported `type` attribute values (on Chrome) are: `"camera"`, `"microphone"` or both together `"camera microphone"`.

In order to make use of the permission you can use the permissions API to listen to permission status changes. This has the advantage that you will catch all permission status changes.

```
navigator.permissions.query({name: "camera"})
  .then((permissionStatus) => {
    permissionStatus.onchange = () => {
      // Track future status changes that allow the site to start using camera.
      if (permissionStatus.state == "granted")
        startUsingCamera(); // <= your implementation here
    };
    // The permission status could already be granted so the site can use camera already.
    if (permissionStatus.state == "granted")
        startUsingCamera(); // <= your implementation here
  });
```
