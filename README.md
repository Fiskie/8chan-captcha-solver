8chan-captcha-solver
====================

Simple captcha solving userscript for 8chan.

The captcha system that this solver targeted has been deprecated, therefore this is now useless. Hurray!

Introduction
-----------

This is a script in the form of a reusable library that demonstrates the insecurity of 8chan's (vichan's?) captcha software.

The captcha itself is a nice concept, since it creates a massive, cumbersome web of letters with randomized margin widths and absolute element offsets in HTML/CSS. There are a lot of dummy letters that are either unreadable or just completely hidden from the user. Some are even upside down, but use an upside down version of the character it wants to convey.

Unfortunately, the entire thing can be read like a book because we have a bunch of browser utilities at our disposal. We solve the problem by simply looking at the relative positions of the letters on the browser, filtering out obvious fakes, then ordering the letters as they appear on the screen in order to get the answer.

My main intention for doing this was to see if I could crack it, since I had a hunch that it was going to be pretty exploitable. Otherwise, it was an annoying piece of shit that had a short timeout duration (2 minutes, which was annoying if it generated itself before or while you started writing a long post), and would sometimes generate captchas which were unsolvable; sometimes by overlaying an "invisible" letter over a real one, therefore obscuring it from view.

Hopefully this convinces ~someone~ to use a less exploitable captcha implementation, such as the new Google one.

Installation
------------

It's a userscript; use Tampermoney or Greasemonkey.

Usage
-----

1. Click the verification field.
2. You're done.

Known Issues
------------

1. Triggering captcha currently makes the page scroll to the top.
2. Upside down characters are a bit of a bitch to deal with, because sometimes they're made invisible by their rotation but other times they aren't based on the pivot. Yet to figure that out.
