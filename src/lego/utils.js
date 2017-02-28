export const domReady = function(callback) {
    //NOTE: we can't use document.readyState === "interactive" because of ie9/ie10 support
    if(document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        callback();
        return;
    }

    var loadedCallback = function() {
        callback();
        document.removeEventListener("DOMContentLoaded", loadedCallback);
    };
    document.addEventListener("DOMContentLoaded", loadedCallback);
};

export const gestureCover = (function() {
    // var isDesktop = devices.real().platform === "generic";

    // if(!supportPointerEvents() || !isDesktop) {
    //     return $.noop;
    // }

    var cover = document.createElement('div');

    cover.style.pointerEvents = 'none';
    cover.style.transform = 'translate3d(0,0,0)';
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.right = 0;
    cover.style.left = 0;
    cover.style.bottom = 0;
    cover.style.opacity = 0;
    cover.style.zIndex = 2147483647;

    cover.addEventListener('whell', function(e) {
        e.preventDefault();
    });

    domReady(function() {
        document.body.appendChild(cover);
    });

    return function(toggle, cursor) {
        cover.style.pointerEvents = toggle ? "all" : "none";
        toggle && (cover.style.cursor = cursor);
    };
})();

export const clearSelection = function() {
    let selection = getSelection();
    if(!selection) return;
    if(selection.type === "Caret") return;

    if(selection.empty) {
        selection.empty();
    } else if(selection.removeAllRanges) {
        selection.removeAllRanges();
    }
};

export const clamp = (value, min, max) => Math.min(Math.max(min, value), max);