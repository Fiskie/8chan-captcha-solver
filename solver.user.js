// ==UserScript==
// @name         8chan captcha cracker
// @namespace    http://fiskie.me
// @version      1.0
// @description  8chan captcha cracking utility.
// @author       Fiskie
// @match        https://8chan.co/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/**
 DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

 DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

 0. You just DO WHAT THE FUCK YOU WANT TO.
 **/

/**
 * This is a script in the form of a reusable library that demonstrates the insecurity of 8chan's (vichan's?) captcha software.
 *
 * The captcha itself is a nice concept, since it just creates a massive, cumbersome web of letters with
 * randomized margin widths and absolute element offsets. There are a lot of dummy letters that are either unreadable
 * or just completely hidden from the user.
 *
 * Unfortunately, the entire thing can be read like a book because we have a bunch of browser utilities at our disposal.
 * We solve the problem by simply looking at the relative positions of the letters on the browser, filtering out obvious
 * fakes, then ordering the letters as they appear on the screen in order to get the answer.
 *
 * My main intention for doing this was to see if I could crack it, since I had a hunch that it was going to be pretty
 * exploitable. Otherwise, it was an annoying piece of shit that had a short timeout duration (2 minutes, which was annoying
 * if it generated itself before or while you started writing a long post), and would sometimes generate captchas which
 * were unsolvable; sometimes by overlaying an "invisible" letter over a real one, therefore obscuring it from view.
 *
 * Hopefully this convinces ~someone~ to use a less exploitable captcha implementation, such as the new Google one.
 *
 * I'm putting this under the WTFPL because I could not care less about who uses it or who they credit; I made it for fun.
 */

/**
 * Node class
 */
function Node($resource) {
    var $element = $resource;

    /**
     * Returns the element's offset.
     */
    this.getOffset = function() {
        return $element.offset();
    };

    /**
     * Get the element's character.
     */
    this.getCharacter = function() {
        return $element.text().trim();
    };

    /**
     * Get the node's element.
     */
    this.getElement = function() {
        return $element;
    }

    /**
     * Returns the node's offset relative to the captcha.
     */
    this.getRelativeOffset = function(captcha) {
        var nodeOffset = this.getOffset();
        var captchaOffset = captcha.getOffset();

        return {top: nodeOffset.top - captchaOffset.top, left: nodeOffset.left - captchaOffset.left};
    };
}

/**
 * Captcha class
 */
function Captcha($resource) {
    var $element = $resource;

    /**
     * Returns the element's offset.
     */
    this.getOffset = function() {
        return $element.offset();
    };

    /**
     * Returns the target frame's jQuery object.
     */
    this.getElement = function() {
        return $element;
    };

    /**
     * Returns all possible nodes that could make up the captcha as Node objects.
     *
     * :not(:has(*)) filters nodes that are tree nodes, since these don't contain characters.
     */
    this.getNodes = function() {
        var frame = this;

        var elements = $element.find('div')
            .filter(':not(:has(*))');

        var nodes = [];

        elements.each(function(i) {
            nodes.push(new Node($(elements[i])));
        });

        return nodes;
    };

    /**
     * Returns the background color of the frame, which is really the color of the child div, but whatever.
     */
    this.getBackgroundColor = function() {
        return $element.children('div').css('background-color');
    }

    /**
     * Returns true if the captcha actually exists.
     */
    this.ready = function() {
        return !$element.is(':empty');
    };
}

/**
 * CaptchaSolver class
 */
function CaptchaSolver(resource) {
    var $element = $(resource);
    this.captcha = new Captcha($element);

    /**
     * Loads the captcha and fires a callback upon success.
     */
    this.loadCaptcha = function(callback) {
        // Activate the captcha if it's not there already.
        $element.siblings('.captcha_text').focus();
        console.log("Waiting for captcha...");
        this.checkReadyRoutine(callback);
    }

    /**
     * Status checking routine.
     */
    this.checkReadyRoutine = function(callback) {
        if (this.captcha.ready()) {
            console.log("Captcha found.");
            callback();
        } else {
            var _this = this;
            setTimeout(function(){_this.checkReadyRoutine(callback)}, 100);
        }
    }

    /**
     * Attempt to crack the captcha.
     */
    this.solve = function(callback) {
        var _this = this;

        this.loadCaptcha(function() {
            // So I don't have to deal with _this
            _this.onCaptchaRetrieved(callback);
        });
    };

    /**
     * What to do when we have retrieved a captcha.
     */
    this.onCaptchaRetrieved = function(callback) {
        var nodes = this.captcha.getNodes();

        nodes = this.filterNodes(nodes);

        orderNodes(nodes);

        //$(nodes).each(function(i) {
        //    console.log(this.getElement()[0]);
        //});

        callback(getAnswer(nodes));
    };

    /**
     * Order the nodes by left offset via exchange sort.
     */
    var orderNodes = function(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            for (var j = i + 1; j < nodes.length; j++) {
                if (nodes[i].getOffset().left > nodes[j].getOffset().left) {
                    var tmp = nodes[i];
                    nodes[i] = nodes[j];
                    nodes[j] = tmp;
                }
            }
        }
    };

    /**
     * Get the answer from the remaining nodes.
     * A character slightly cut off on the end of the captcha field might add a value.
     * In which case, we'll only return the first 6 characters.
     */
    var getAnswer = function(nodes) {
        var str = "";

        for (var i = 0; i < nodes.length && i < 6; i++) {
            str += nodes[i].getCharacter();
        }

        return str;
    };

    /**
     * Return a list of valid nodes.
     */
    this.filterNodes = function(nodes) {
        var _this = this;

        var filtered = [];

        $(nodes).each(function(i) {
            // Filter nodes with display:none or visibility:hidden... because they are invisible.
            if (this.getElement().css('visibility') === 'hidden' || this.getElement().css('display') === 'none') {
                return true;
            }

            // Filter nodes which share the same color as the background color of the captcha.
            if (this.getElement().css('color') === _this.captcha.getBackgroundColor()) {
                return true;
            }

            var offset = this.getRelativeOffset(_this.captcha);

            // Filter nodes that are outside the captcha frame, and to an extent a border where letters cannot possibly fit.
            if (offset.top < 5 || offset.left < 5 || offset.top >= 70 || offset.left >= 290) {
                return true;
            }

            // Filter nodes that are less than 20px in font size.
            if (parseInt(this.getElement().css('font-size'), 10) < 20) {
                return true;
            }

            // Filter nodes that don't have a valid width.
            if (this.getElement().width() <= 3 || this.getElement().height() <= 3) {
                return true;
            }

            // Filter nodes that appear upside down, since these end up being invisible.
            var rotation = getRotationDegrees(this.getElement());

            if (rotation > 160 && rotation < 200) {
                return true;
            }

            filtered.push(this);
        });

        return filtered;
    }
}

// Courtesy of http://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform")    ||
        obj.css("-ms-transform")     ||
        obj.css("-o-transform")      ||
        obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle +=360 : angle;
}

// Bind an event handler.
$('.captcha_text').click(function() {
    var solver = new CaptchaSolver('.captcha_html');

    solver.solve(function(answer) {
        $('.captcha_text').val(answer);
    });
});
