# [Self-Review Questionnaire: Security and Privacy](https://w3ctag.github.io/security-questionnaire/)

The full questionnaire is at https://w3ctag.github.io/security-questionnaire/.

For your convenience, a copy of the questionnaire's questions is included here in Markdown, so you can easily include your answers in an [explainer](https://github.com/w3ctag/w3ctag.github.io/blob/master/explainers.md).

---
01.  What information does this feature expose,
     and for what purposes?
     
     This features is mostly focused on functionality, and it exposes little information, but there are 2 pieces of information it does expose:
     * User's permission status (same as the [Permissions API query method](https://www.w3.org/TR/permissions/#query-method)) - by design
     * User's default browser language (same as the [input type=file element](https://html.spec.whatwg.org/#file-upload-state-(type=file)) - by the contents of the element using a user-known locale by default
      
02.  Do features in your specification expose the minimum amount of information
     necessary to implement the intended functionality?
  
     Yes

03.  Do the features in your specification expose personal information,
     personally-identifiable information (PII), or information derived from
     either?
     
     No

04.  How do the features in your specification deal with sensitive information?

     No sensitive information exposed

05.  Does data exposed by your specification carry related but distinct
     information that may not be obvious to users?

     No
    
7.  Do the features in your specification introduce state
     that persists across browsing sessions?

     The feature makes use of permission status which is sometimes persisted across browsing session, but this is not a concept introduced by this feature.
    
9.  Do the features in your specification expose information about the
     underlying platform to origins?

     No
    
11.  Does this specification allow an origin to send data to the underlying
     platform?

     No
     
13.  Do features in this specification enable access to device sensors?

     No

14.  Do features in this specification enable new script execution/loading
     mechanisms?

     No
     
16.  Do features in this specification allow an origin to access other devices?

     No

17.  Do features in this specification allow an origin some measure of control over
     a user agent's native UI?

     Yes, depending on implementation details. A user agent might choose to place the prompt near where the permission element is positioned.
     
19.  What temporary identifiers do the features in this specification create or
     expose to the web?

     None that I can think of
     
21.  How does this specification distinguish between behavior in first-party and
     third-party contexts?

     [Permission policy](https://www.w3.org/TR/permissions-policy/) and the [CSP frame-ancestors directive](https://www.w3.org/TR/CSP3/#directive-frame-ancestors) are required for subframes to make use of the feature
     
23.  How do the features in this specification work in the context of a browser’s
     Private Browsing or Incognito mode?

     No special considerations are made for privacy browsing/incognito mode. Up to user agent implementaion and their specific permission model details.
     
25.  Does this specification have both "Security Considerations" and "Privacy
     Considerations" sections?

     Not yet, WIP.
     
27.  Do features in your specification enable origins to downgrade default
     security protections?

     No.
     
29.  What happens when a document that uses your feature is kept alive in BFCache
     (instead of getting destroyed) after navigation, and potentially gets reused
     on future navigations back to the document?

     The feature should work as normal.
     
31.  What happens when a document that uses your feature gets disconnected?

     The feature does not work in a disconnected document. Since it requires user interaction in the first place (which can't happen in the document is disconnected), the permission element will simply not do anything until re-connected.

32.  Does your spec define when and how new kinds of errors should be raised?

     No
     
33.  Does your feature allow sites to learn about the user's use of assistive technology?

     No

34.  What should this questionnaire have asked?

     Perhaps a question as to whether the exposed information is already available today via other APIs.
