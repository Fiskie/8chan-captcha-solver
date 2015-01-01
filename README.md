8chan-captcha-solver
====================

Simple captcha solving userscript for 8chan.

This is a script in the form of a reusable library that demonstrates the insecurity of 8chan's (vichan's?) captcha software.

The captcha itself is a nice concept, since it just creates a massive, cumbersome web of letters with randomized margin widths and absolute element offsets. There are a lot of dummy letters that are either unreadable or just completely hidden from the user.

Unfortunately, the entire thing can be read like a book because we have a bunch of browser utilities at our disposal. We solve the problem by simply looking at the relative positions of the letters on the browser, filtering out obvious fakes, then ordering the letters as they appear on the screen in order to get the answer.

My main intention for doing this was to see if I could crack it, since I had a hunch that it was going to be pretty exploitable. Otherwise, it was an annoying piece of shit that had a short timeout duration (2 minutes, which was annoying if it generated itself before or while you started writing a long post), and would sometimes generate captchas which were unsolvable; sometimes by overlaying an "invisible" letter over a real one, therefore obscuring it from view.

Hopefully this convinces ~someone~ to use a less exploitable captcha implementation, such as the new Google one.
