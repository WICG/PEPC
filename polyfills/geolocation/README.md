# `<geolocation>` element polyfill

A drop-in JavaScript polyfill for the `<geolocation>` HTML element. It provides
a declarative, privacy-conscious interface for the Geolocation API with built-in
form participation and UI.

## Demo

Check out the [live demo](https://wicg.github.io/PEPC/polyfills/geolocation/).

## Features

- **Declarative HTML**: Use `<geolocation>` tags directly in your markup.
- **Privacy-First Autolocate**: The `autolocate` attribute only runs if
  permissions were _already_ granted, preventing unexpected popups.
- **Built-in UI**: Renders a "Use location" / "Use precise location" button
  automatically.
- **Form Native**: Implements `ElementInternals` to act as a native form input.
  Submits JSON-serialized coordinate data automatically.
- **Attributes**: Supports `watch`, `accuracymode` (`"precise"` vs
  `"approximate"`), and inline `onlocation` handlers.

## Installation

### via npm

```bash
npm install geolocation-element-polyfill
```

```javascript
import 'geolocation-element-polyfill';
```

### via CDN

Simply include the script at the end of your body tag:

```html
<script src="https://unpkg.com/geolocation-element-polyfill/index.js"></script>
```

## Usage

### Basic Example

Just drop the tag into your HTML. The polyfill will replace it with a functional
Custom Element (`<geo-location>`) rendering a button.

```html
<geolocation
  onlocation="console.log(event)"
  accuracymode="precise"
></geolocation>
```

### Form Participation

The element functions like a hidden `<input>`. When the user enables location,
the element stores the data internally. When the form is submitted, it includes
the location data as a JSON string.

```html
<form action="/api/save-place" method="GET">
  <label>Location Name: <input name="place_name" /></label>

  <geolocation name="coords" autolocate></geolocation>

  <button type="submit">Save</button>
</form>
```

## API Reference

### Attributes

| Attribute      | Value                          | Description                                                                                                         |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `autolocate`   | Boolean                        | If present, attempts to fetch location immediately on load. **Note:** Only runs if permission state is `'granted'`. |
| `accuracymode` | `"approximate"` or `"precise"` | Determines the precision of the location data.                                                                      |
| `watch`        | Boolean                        | If present, uses `watchPosition()` to continuously update coordinates as the user moves.                            |
| `onlocation`   | Script                         | Inline event handler string.                                                                                        |
| `name`         | String                         | The name of the field when submitted within a `<form>`.                                                             |

### Properties (JavaScript)

You can access the DOM element directly:

```javascript
const geoEl = document.querySelector('geolocation');

// Read-only access to the last result
console.log(geoEl.position); // GeolocationPosition object or null
console.log(geoEl.error); // GeolocationPositionError object or null
```

### Events

The element dispatches a bubbling `location` CustomEvent.

```javascript
// Be sure to target both `geolocation` and `geo-location`.
document
  .querySelector('geolocation, geo-location')
  .addEventListener('location', (e) => {
    const { position, error } = e.target;

    if (position) {
      console.log(`Lat: ${position.coords.latitude}`);
    } else {
      console.error(`Error ${error.code}: ${error.message}`);
    }
  });
```

## Styling

The button is rendered inside the Shadow DOM to prevent style bleeding, but the
host element is display `inline-block` by default. You can size or position the
container. Be sure to target both `geolocation` and `geo-location`.

```css
geolocation,
geo-location {
  display: block;
  margin: 1rem 0;
}
```

## How it works internally

Because the HTML specification require Custom Elements to contain a dash (e.g.,
`geo-location`), this polyfill uses an "Upgrade Strategy":

1. It defines a valid `<geo-location>` custom element.
2. It scans the DOM for `<geolocation>` tags.
3. It instantly replaces them with `<geo-location>`, transferring all
   attributes, IDs, classes, and event listeners seamlessly.

## License

Apache 2.0
