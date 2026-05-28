# HTML Permission Elements

This repo documents a number of proposed HTML elements, whose common goal is
to provide secure and user friendly access and control of
[HTML permissions](https://www.w3.org/TR/permissions/) and their associated
capabilities from within a web page.

# Geolocation Element

An HTML permission element for the
[geolocation](https://www.w3.org/TR/geolocation/) feature:

* [Explainer](geolocation_explainer.md)
* [Geolocation Element Specification Draft](https://wicg.github.io/PEPC/geolocation-element.html)

# Usermedia Elements / HTML Media Capture Elements

A set of HTML elements to mediate access to a
[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream).
This proposal has been modified and integrated into the
<a href="https://w3c.github.io/mediacapture-extensions">Media Capture and Streams
Extension</a> specification, chapter
<a href="https://w3c.github.io/mediacapture-extensions/#media-capture-html-elements">Media capture HTML elements</a>. All future work on these elements is
expected to occur there.

* [Explainer](https://github.com/w3c/mediacapture-extensions/blob/main/media-capture-elements-explainer.md)
* [Media Capture HTML Elements](https://w3c.github.io/mediacapture-extensions/#media-capture-html-elements)

The originally proposed usermedia element:

* [Explainer](usermedia_element.md)
* [Usermedia Element Specification Draft](https://wicg.github.io/PEPC/usermedia-element-delta.html),
    meant for inclusion in
    [Media Capture and Streams Extensions](https://w3c.github.io/mediacapture-extensions/)
    (as of spring 2026)

# Page Embedded Permission Control (PEPC)

The originally proposed permission element, for any
[permission](https://www.w3.org/TR/permissions/)

* [Explainer for PEPC](explainer.md)
* [Permission Element Specification draft](https://wicg.github.io/PEPC/permission-element.html)
   (as of Sept 22, 2025)
