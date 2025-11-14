# TPAC2025 Breakout: Declarative Capability Access

https://www.w3.org/events/meetings/1a19962f-cbe5-42b9-8070-80d4209fd779/

# Participants

- Mike West, Google Chrome  
- Marian Harbach, Google Chrome  
- Anonymous Coward  
- Anonymous, but not Cowardly at all  
- Martin Thomson, Mozilla  
- Nick Doty (CDT)  
- Marijn Kruisselbrink, Google Chrome  
- Dan Rubery, Google Chrome  
- Thomas Steiner   
- Simon Pieters, Mozilla  
- Camille Lamy, Google Chrome  
- Christian Liebel, Thinktecture  
- [Kagami Rosylight](mailto:krosylight@mozilla.com), Mozilla  
- Limin Zhu, Microsoft Edge  
- \<add yourself\>

# Notes

* Mike West: Let’s have a chat \- the concept is simple. There are reasons people might want it to be different, let’s problem solve.  
* **An alternative to developer-initiated prompts**  
* Normally:  
  * We give developers an imperative API  
  * We empower them to ask for a privilege at a point  
    * Sometimes they ask when the page is loaded  
    * Sometimes they do when we give them power to  
    * And sometimes they do the best thing where the ask for privilege exactly when the user needs it / it makes sense  
* In many cases, this results in a prompt shown to the user by the user agent  
* We agree upon \- we generally have no idea that we don’t know if a page should have access to a think from the user, so we ask the user about it  
  * This website is asking you for this privilege, and you have these options  
    * Granting this for a while  
    * Granting this for a short while  
    * Or not granting privilege  
* Browsers have made some improvements \- decisions about when the prompt is show, the duration of it, whether the site is allowed to have the UA show another prompt after it was denied, etc etc  
* Trying to find a better way of showing user prompts where it makes sense.  
* Trying NOT to show users prompts in any other case  
* Today: heuristics.  
* Assertion: it would be helpful if we had substantially stronger signals \- context and engagement signals, which are much stronger  
* (slide) button that says “Use Location”  
  * We can have much higher confidence that the user engaging on this will understand & expect that something locational will happen  
* Other example: “install’  
  * User would not be surprised that an install prompt popped up in front of them.  
  * Camera, microphone, etc  
* By creating a mechanism that gives a much stronger signal about what users want or expect, then we can do a better job with knowing they expect the action  
* Love to live in a world where **we never show a prompt unless the user has an expectation that a prompt will show up in that moment.**  
* We can do better than the status quo. What might be more helpful here? More user engagement, less user surprise.

1. Are there capabilities that don’t lend to this approach?  
   1. My take: none  
2. Why might an imperative API be preferable? Where might this approach fail?  
   1. my take: imperative seems always worse  
3. How strong should the signal be?   
   1. Chrome has settled on a set of constraints, but it might not be perfect/sufficient or too much.  
   2. (visibible, not occluded, some others)

Examples:

* Geolocation \- been working on for a while: [https://github.com/WICG/PEPC/blob/main/geolocation\_explainer.md](https://github.com/WICG/PEPC/blob/main/geolocation_explainer.md)  
* Install \- prototype is in the code, relevant for us to chat about: [https://github.com/mikewest/pepc-install/](https://github.com/mikewest/pepc-install/)  
* User media element \- camera and microphone access

Tom Steiner: Not necessarily just about asking for permission, but also about doing the thing in itself?  
Mike:

* Different elements work different \- geolocation  
  * by interacting with it, you hae a targetin the page to which the location is attached. If the user allows the page to access location, the element provides a hook to retrieve it. It can be populated with location information. And \- the element can act as part of a form. So \- if gaining location in order to find directions to a place \- then you can do so. It will serialize as part of form data, or be serialized as part of form data objec tetc  
* Install element would act differently \- you are asking for the privilege of being on the user’s computer \- it’s about an action.  
* User media element  
  * It would attach the stream to the object.  
  * So you could use it like a mute button on the page. So it could mute the stream \- it would give users way more control over what is going on \- don’t have to trust the page to mute, for example. They just stop getting stream data.

Does this broader story make sense? Or should we push off in a different direction.

* 

Yoav Weiss (Shopify): What constraints exist?  
Constraints:

* Contrast \- so text is visible  
* Size \- visibility and legibility  
* Visible \- we use intersection observer to make sure it is non-occluded and visible for some time  
* Text hard coded  
* Icon hard coded  
* Branding \- what can developers do?  
  * Right now \- colors are not constrained as long as the contrast ratio good.  
* language?   
  * Yes \- button is translated in all languages of chrome. Not sure if we take page’s language, or if you can specify button lang…. Probably takes page language

Simon: So you can show a button in language that user doesn’t understand ? yes. That is possible.

* File upload button \- it uses browser ui language  
* In explainer, we try to honor lang attribute, otherwise fall back to language of the browser  
* Icon mitigates this a little

Mike \- I am confident that we do not have the right set of restrictions today. It might be the case they are too weak or strong. Seems reasonable, but not look the same in a year vs today.

* Haven’t gotten enough feedback from ecosystem on what is reasonable, and what is bar we are aiming for  
* Goal \- ensuring that the user isn’t just clicking on anything, but a thing that looks like the thing it relates to. Consistency can be helpful.

Question \- Rob \- Biggest question \- as web designer, what are my constraints going to be for compatibility across user agents? It feels like opening a can of worms of despair to try to get a geolocation element to look the way I want it to look on blink, safari, firefox. The goal is righteous, but the challenge for domain specificity \- what would go into that when interacting with, and how that would be designed for…. Isn’t putting colors on pixels. We need to be very specific and crisp for each one, for what browsers can and can’t do. Otherwise end developers will want a different solution

Mike \- that’s fair

Serena \- the intent is to find the actual behavior of these elements \- we would want to define that behavior pretty specifically. And the intent is that any web designer would be able to style these however they want within reason, unless it’s like light text on light background.

Mike \- Chrome is going to use ‘something material-like’ for icons. Apple / moz / msft might make different decisions about what to show icon-wise, so consistency across browsers might be difficult.

Nick:

* I share the interest in avoiding annoying prompts. Genuine privacy issue of harassment and intruding on the user.  
* A context element has the potential to improve this. Not solve it but improve it  
* Larger privacy problem not helped in last 15 years is that users typically don’t have much context from the site, what the site is saying about this permission, why should I or not provide this? What is the privacy relevant information?  
  * A declarative solution actually helps us with this set of problems too  
  * This encourages devs to use web content to explain that bit of information, and browsers to have some confidence about what context was use to prompt the users  
  * Helpful for out-of-band information  
* Currently \- websites the just bother the user. In a few cases they do provide context for high sensitivity thing  
* So \- having declarative capabilities provides us with a hook for using web content for other declarative information for how that privilege might be used, and so we can make progress there

Mike \- Marion has a breakout session later about this later

Tim Nguyen from Apple

* Have you thought about a future where you have to relax styling restrictions?  
* People’s understanding computers over time might change  
* In the 90s, all buttons were native. Now that’s no longer the case. Form control styling had to evolve from all native to custom.  
* Having a set of restrictions on, like, the geolocation element, might have same issues in the future. What is the plan there?  
* Mike \-  
  * It is dramatically easier to relax restrictions than add them  
    * Start with a thing we have confidence in, and learn from it.  
  * There are other examples of this pattern that exist that we can learn from  
    * iOS’s CFLocation button \- is there research from that team about whether that was successful? As that was an inspiration for this work.  
    * That mechanism was really constrained  
    * So it would be great to see if that had results \- did developers like it? Or did they not use it?  
* Marion \- whatever is new, we want to find the balance \- that is why we are doing this. If we see clickjacking, we need to make constraints stronger. And then developer feedback helps us too.  
* Ana- Web compat?  
  * Yes \- if one browser decided, for example, to relax all restrictions, and the other didn’t  
    * Then ppl can install there  
  * Or if people set styles that weren’t respected  
  * Remove restrictions \- CAN create interop problems, \- but creates less problems than if we increase restrictions. More problems on web platform, more things not working  
  * What happens if restricted?  
    * You can’t click on it, it looks invalid  
  * Yes \- it is the case \- when styling is violated, then the button no longer has the effect that you expect it to, and that can cause problems.

Martin Thomson

* Challenging.   
* Security barrier that exists here  
* Carrying information from the page, what you believe what the user has seen. Carry that information through click or engagement, to make different decision in UX.  
* Our perspective \- fundamentally cannot release restriction of location without ux to user  
* BUT \- we might be able to change the UX based on this.  
  * Really annoying to get prompt on page load  
  * With this, we can defer that to show it when the user understands it  
    * So \- we may user minimized UX when a button is engaged with  
* But we don’t see an idea of automatic grants happening.

* If you have the button on one engagement, and then subsequently in a future interaction \- does the button need to be present in future interactions? Or can they simply just call the API?  
  * Otherwise we don’t do web developers a lot of service if we don’t have consistency  
  * Suggestion \- if button doesn’t work, you fall back to original api pattern/permission prompt UX?  
* Mike \- yeah a lot that I agree with. Devil is in details of implementation  
  * I agree taht this allows more graduation with friction we put for access to privilege. Or information we put in from of user  
  * Exactly right \- that is what we’re aiming for, and that’s challenging.  
  * Persistent permission \- details \- current proposal in Chrome will put up a prompt, and the user’s response to that prompt will have the same impact of granting via the API  
    * I agree we should aim for a world where we separate things out, and one and only one way to get information from the user.  
    * Question of deployability \- difficult to entirely change the model on day 1\. Possible to introduce something, push developers towards it over time, and at the same time make it the thing we want it to be

Limin Zhu from MSFT

* How does this proposal interact with existing ecosystem? APIs that would have triggered geolocation prompt in the browser? Do we have an ecosystem goal in mind? Are we trying to replace the existing ecosystem? Nudge devs more towards using this set? What is the carrot for the devs? How do we plan to get there?  
* Should we list ecosystem goal in explainer?  
* Mike  
  * MY goal is to move in a direction where we have a strong signal. I imagine a number of ways here, but bad for developers to have an ability to prompt something in front of users where the user doesn’t expect it  
    * Add friction to imperative mechanisms  
    * Remove friction for ways that we have high confidence users understand  
  * Carrots? Sticks are easier.  
    * In Chrome, we can do some things from previous friction we introduced earlier  
      * Example \- in Chrome, we block a permission if you blocked it earlier, and no re-prompt. So maybe this would allow that permission to be asked again  
    * Other user agents…   
    * There are a set of heuristics that browsers have somewhat aligned on…. But hopeful we can have more alignment where we can have a stronger signal that the user wants to be engaged (dialog shown)  
  * Personally \- I would like to shift away from imperative where they expect direct access to capability, towards a model where the user is handing capability to the site more explicitly.  
  * Explainers don’t talk about it in those terms, honestly because the team thought it would be a harder sell, vs just the specific element proposal.  
  * If it would be better to be more explicit about changing the ecosystem more broadly, I would write that document  
* Worry \- if we are introducing a thing that’s going to be more restrictive, no obvious carrots, no stick, why do I need to use it?  
  * Mike \- carrot \- if you look at the case studies that permission team put together (experimenting with previous version of syntax)  
    * Results from developers at various video conferencing product  
      * positive uplift in user experience  
    * Similar results with google search  
    * [https://developer.chrome.com/blog/rethinking-web-permissions?hl=en\#case\_studies](https://developer.chrome.com/blog/rethinking-web-permissions?hl=en#case_studies)   
  * At the same time \- designing the geolocation element and … element to replace it.

Christian Liebel

* Good UX for user and dev  
* Like One additional feature of recovering from previously rejected  
* Concern:  
  * First time mixing browser UI, powerful and I can’t control  
    * With my own site’s UI, which I can control  
  * What can you build as an element that I cannot create?  
    * Would it be easier to mimic browser ui to trick user?  
  * Element \- what is the size / dimensions?  
    * Must I reserve space for something? How might it looks?  
  * I might need to change language during runtime. Browsers that don’t have this \- I would have to ship old permission code, so I expect more work for that feature \- it would be easier for me to keep existing model.  
* Mike  
  * All of those challenges are real and reasonable.  
  * Risks \- browser ui and putting in page  
    * Correct \- no pixels that we could display that website could not display  
    * Today \- website replicate the permission prompt \- and I think they do that because of other decisions the browser has made  
      * Because the decision to block permission in chrome in persistent, they first render a fake one to see if you would block  
      * Because the prompt you render doesn’t have the same impact as the browser, the user’s decision initially doesn’t have impact  
      * But \- at some point it has to go to the browser UI to gain access  
    * If we narrow the set of cases where the page has access to browser UI \- we can make a meaningful decision about the context that was given to the user  
  * Fitting into your UI  
    * Control of element & size.  
    * There would be deltas between browser\!  
    * We are making web designing harder.  
    * So for folks today  
      * People are using this in the place of a pre-prompt they would use anyways  
      * Example: Meet  
        * When you join meeting, you get a dialog from Meet saying “you’re in a vc, you should grant permission now, click button”  
        * This replaces the button in that use-case \- they still say the same thing, and the microphone button was essentially a drop-in replacement  
    * We want to work with devs & community to make sure the element works & are restricted & defined enough  
    * Yes \- people will still use the old api to have consistency, and there might be no difference. But \- modulo \- the studies we have seen with partners.  
    * If we can’t \- then potentially we need to relax restrictions.

Yoav

* Unless I’m missing this in explainer \- I think it would be very useful for these elements to have two extra things:  
  * If you don’t do a prepompt, and you have a find-my-location button, you probably don’t want the button to appear, and do other things instead?  
    * Css pseudo element for ‘permission already granted’  
    * Although \- Martin & Mike want opposite  
      * Mike \-I think there is value for a signal to the user that the, say, location is being used.  
        * For example \- with the install button \- you don’t nee dto install it twice, and we don’t need to tell the site that it’s installed \- so we can switch to a launch button\!  
        * So we give the website the contextual thing that actually makes sense given the user’s situation  
  * When style doesn’t meet bar, dev need to know  
    * Yes \- pseudoclass for this.  
    * Also \- violation reports, etc

Thomas Steiner

* PEPC allows you to revoke permission  
* One attack vector \- style a thing fake \- fake geolocation. Fake the revoke that browser might show. So there might need to be something on the UI level that something has been revoked \- above the line of death

Simon Pieters

* Two conflicting requirements (might become a problem if we lose restrictions later)  
  * Be confident of signal from user  
  * Allow web developer styling  
* Found compromise today, with color allowance and border radiusWe should keep this in mind, if we allow the restrictions to loosen too much, then we lose the original goal  
* Mike  
  * I totally agree  
  * Team would assert we getting both goals  
  * There isn’t enough to allow deves to do everything they want, but enough that they are good enough. And provides browser confidence  
  * You are correct that we will want to change over time  
  * And if we change it, we continue to meet both of those goals  
  * And to do that, we need to have conversations like this one, to ideally align on these constraints & allowances. And the confidence browsers can have is enable

Yoav

* Fallback mechanism for devs \- if the button fails, I do something else.  
* That means fallback is already in place for all devs  
* So maybe we have a random fail to make sure that devs have a fallback  
* Mike  
  * Interesting  
  * It should be the case that devs are serving content there  
  * But \- people will user agent sniff, and etc  
  * Yoav \- yes \- if chrome didn’t support the element for 1%  
    * Mike \- we could \- it would exasperated the problem Christian mentioned earlier  
  * If we do have a fallback mechanism, then people aren’t going to use that join  
  * 

Reilly

* If the user clicked, can the dev just handle the click event, and dev can use old api?

Mike

* Yes, developers can handle a click already, I believe.

Dan Murphy

* Can we polyfill the old UI when the element is invalid?

Mike

* We can do all sorts of things. Getting feedback like this is the purpose of this session.

Anne

* Concerned that we try to give developers access to existing form controls in other efforts, and this takes control away.   
* There is a lot of complexity in introducing all these elements while the benefits for developers are not very clear. More clear for users.  
* Overall not entirely sold in the idea.

Mike

* How are button presses not a good idea to initiate a flow?

Anne

* File input used to be only available after click, now you can also show a file picker after navigating.

Mike

* Feedback is true. This proposal is opposed to making forms more flexible.   
* However, for the purpose of getting access to sensitive capabilities, having more restrictions is justifiable. Need more user understanding. Developers get what they want as a second order effect.

Anne

* Developers want full control over the viewport

Yoav

* What they really want is the PM saying “you did a good job, business metric went up”. Full control over pixels is just one way to get that. Developers want many different things, but there are tradeoffs  
* While it’s contrary to enabling styling of input elements, at the same time this is slightly different.

Anne

* Had restrictions on input type file for the same reasons. But we ended up giving up on that, because people care more about what things looks like.  
* iOS button has not been widely adopted.

Serena

* If permission element has better UX, shouldn’t we prioritize that over developer experience/needs?

Anne

* …

Dan

* If prompt could be reduced so users click on it more, there is less friction with special element. Is that what we are talking about?

Anne

* Not entirely, not sure we tried enough with the existing prompts, how that flow works.  
* Part of the motivation is re-requesting after permanent denies. A solution could be for making it easier for users to revisit past decisions.

Serena

* Seems secondary. Point of this is to get a clear signal of user intent.

Anne

* Yet, that is the only benefit of using the element

Dan

* The promise is that you’ll have a higher acceptance right because of user understanding.

Mike

* It’d be best if we didn’t need these elements because developers already followed best practices and if we didn’t have to match website behavior with what users expect the behavior to be. But websites don’t often do that today.   
* No incentive to try the new thing if the old thing stays available. Should change existing APIs as well.  
* Agree that browser could do more to surface existing settings. Confident that browsers strive to do that. Seems separate from the question that we would like of paving a new path to a better user experience. Can use benefits or fences to encourage new path. Seems likely we can shift the ecosystem  
* Core question: is this better for users? If we have a clear signal from the user, we can make better decisions. We get this signal from an element with important characteristics.

Anne

* Not as clear that it is a definite improvement. Websites could already be doing this today.

Mike

* Many websites already behave well, but not all do.

Marian

* Ran UXR identified that many developers don’t consider implications of calling APIs for a lack of resources

Anne

* We should explain how to use permissions better to developers then.

Serena

* The way the current APIs are designed is that folks are not encouraged to think about the UX aspects of that call. Re-design so developers are encouraged to consider UX. Need to make changes to current APIs at the same time.

Yoav

* What changes?

Serena

* If element is easy enough to use by developers, and we are confident in that, then we can say there’s the high signal way and low signal way, and then implement counter abuse measures and change UX for lower signal path. We just have no signal right now, maybe the website was really good with their UX, maybe they weren’t, we just can’t tell easily, so it’s difficult to differentiate UX and manage interruption vs. being too quiet.

Mike

* Can see as something like a ratchet. If we wanted developers to migrate en masse, we could do all sorts of things to existing APIs to make them less valuable.  
* Example: could give you location only within a state with API vs. button. With camera, you only get lower resolution. Sticks are easy.

Anne

* These will impact end users first.

Mike

* Yes, we shouldn’t do these blindly.

Anne

* Concrete ideas for making existing APIs less attractive would be helpful

Yoav

* You don’t have to degrade the actual API capability, but change UX

Kagami

* For the carrot, we can have a carrot for push notifications, make it easier to set up push

Serena

* Make prompt worse: important to realize that quieter prompt is worse where user wanted the capability, better in the cases where they didn’t want it.

Yoav

* Making it less visible when using old APIs, conversion rates will get lower, people will yell at them, and they will find the right APIs.

Simon

* File picker works always, is very modal. We see no abuse, no spamming. So maybe a solution is to make prompts more modal, discourage websites from spam.

Mike

* Take a different lesson: there is financial value associated with some capabilities. Less easy to exploit file picker.   
* That means we need to differentiate between capabilities based on abuse potential  
* Copy and paste version as opposed to always accessing the clipboard. Might not even need a prompt at all with a shape like that.  
* For all capabilities where we see abuse, the current PEPC model makes a lot of sense. But for other capabilities we might actually be able to get rid of permission prompts that exist today.  
* Making something better than user activation.

Marian

* Current decisions are not always what the user actually wanted.
