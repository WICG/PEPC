(function () {
  // Nothing to do if the element is natively supported
  if ('HTMLGeolocationElement' in window) {
    return;
  }

  // Serialize Position for Forms
  function serializePosition(pos) {
    if (!pos) return null;
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
  }

  // Custom element
  class GeoLocationElement extends HTMLElement {
    static get formAssociated() {
      return true;
    }
    static get observedAttributes() {
      return ['accuracymode', 'autolocate'];
    }

    constructor() {
      super();
      this._internals = this.attachInternals();
      this.attachShadow({ mode: 'open' });
      this._position = null;
      this._error = null;
      this._watchId = null;
    }

    // Attributes & Props
    get position() {
      return this._position;
    }
    get error() {
      return this._error;
    }

    get accuracymode() {
      return this.getAttribute('accuracymode') || 'approximate';
    }
    set accuracymode(val) {
      this.setAttribute('accuracymode', val);
    }

    get autolocate() {
      return this.hasAttribute('autolocate');
    }
    set autolocate(val) {
      val
        ? this.setAttribute('autolocate', '')
        : this.removeAttribute('autolocate');
    }

    get watch() {
      return this.hasAttribute('watch');
    }

    // Lifecycle
    connectedCallback() {
      this.render();
      this._handleInlineEvents(); // Bind onlocation="..."

      // Setup button listener
      this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
        // Prevent form submission if the button is inside a form
        e.preventDefault();
        this.start();
      });

      if (this.autolocate) this._attemptAutolocate();
    }

    disconnectedCallback() {
      this._stop();
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'accuracymode') this._updateButtonText();
      // If active and settings change, restart
      if (this._watchId || this._position) {
        this._stop();
        if (this.autolocate) this.start();
      }
    }

    // Rendering
    render() {
      if (this.shadowRoot.innerHTML.trim() !== '') return; // Don't re-render if exists

      const style = /* html */ `
        <style>
          :host { display: inline-block; font-family: system-ui, sans-serif; }
          button {
            padding: 8px 12px;
            cursor: pointer;
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 0.9em;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          button:hover { background: #e0e0e0; }
          button:active { background: #d0d0d0; }
          .icon { width: 12px; height: 12px; background: currentColor; border-radius: 50%; opacity: 0.5; }
          .icon.active { color: #2ecc71; opacity: 1; }
          .icon.error { color: #e74c3c; opacity: 1; }
        </style>
      `;

      this.shadowRoot.innerHTML = /* html */ `
        ${style}
        <button type="button">
          <span class="icon"></span>
          <span class="text"></span>
        </button>
      `;
      this._updateButtonText();
    }

    _updateButtonText() {
      const btnText = this.shadowRoot.querySelector('.text');
      if (btnText) {
        const mode = this.accuracymode === 'precise' ? 'precise ' : '';
        btnText.textContent = `Use ${mode}location`;
      }
    }

    _setStatus(status) {
      const icon = this.shadowRoot.querySelector('.icon');
      icon.className = 'icon'; // reset
      if (status === 'success') icon.classList.add('active');
      if (status === 'error') icon.classList.add('error');
    }

    // Logic
    _handleInlineEvents() {
      const onLocationAttr = this.getAttribute('onlocation');
      if (onLocationAttr) {
        this.addEventListener('location', (event) => {
          try {
            new Function('event', onLocationAttr).call(this, event);
          } catch (e) {
            console.error('Handler error:', e);
          }
        });
      }
    }

    async _attemptAutolocate() {
      if (!navigator.permissions) return;
      try {
        const res = await navigator.permissions.query({ name: 'geolocation' });
        if (res.state === 'granted') this.start();
      } catch (e) {
        /* ignore */
      }
    }

    start() {
      if (!navigator.geolocation) return;
      const opts = { enableHighAccuracy: this.accuracymode === 'precise' };

      const success = (p) => {
        this._position = p;
        this._error = null;
        this._setStatus('success');
        this._updateForm(p);
        this._emit();
      };

      const fail = (e) => {
        this._error = e;
        this._position = null;
        this._setStatus('error');
        this._updateForm(null);
        this._emit();
      };

      if (this.watch) {
        if (this._watchId) navigator.geolocation.clearWatch(this._watchId);
        this._watchId = navigator.geolocation.watchPosition(
          success,
          fail,
          opts
        );
      } else {
        navigator.geolocation.getCurrentPosition(success, fail, opts);
      }
    }

    _stop() {
      if (this._watchId) {
        navigator.geolocation.clearWatch(this._watchId);
        this._watchId = null;
      }
    }

    _updateForm(data) {
      this._internals.setFormValue(
        data ? JSON.stringify(serializePosition(data)) : null
      );
    }

    _emit() {
      this.dispatchEvent(
        new Event('location', {
          bubbles: true,
        })
      );
    }
  }

  customElements.define('geo-location', GeoLocationElement);

  // Swap logic (replaces <geolocation> with <geo-location>)
  function upgradeTags() {
    // Find all invalid <geolocation> tags
    const badTags = document.querySelectorAll('geolocation');

    badTags.forEach((oldEl) => {
      // Create the valid custom element
      const newEl = document.createElement('geo-location');

      // Copy all attributes (id, class, custom attrs, events)
      for (const attr of oldEl.attributes) {
        newEl.setAttribute(attr.name, attr.value);
      }

      // Move any children (unlikely, but good practice)
      while (oldEl.firstChild) {
        newEl.appendChild(oldEl.firstChild);
      }

      // Replace in DOM
      oldEl.parentNode.replaceChild(newEl, oldEl);
    });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeTags);
  } else {
    upgradeTags();
  }

  // Observe for dynamically added <geolocation> tags
  new MutationObserver(upgradeTags).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
