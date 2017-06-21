var initTime = new Date().getTime();

if (parent && parent.isMobilePhone && parent.isMobilePhone()) {

    // Change the width and height of the phone container for mobile devices
    function ChangePhoneContents(startTime, timer) {
        var phonetimer = setInterval(function () {
            if (!timer) timer = 3000;
            if (new Date().getTime() - startTime > timer) {
                clearInterval(phonetimer);
                return;
            }

            var isMobilePopup = location.href.indexOf("mobile-popup") >= 0; // popup-sample
            if (!isMobilePopup)
                ChangePhoneContent(false);
        }, 100);
    }

    // Change the width and height of the phone container for mobile devices
    function ChangePhoneContent(hasDataUrlChanged) {
        var activePages = $('.ui-page-active');
        if (activePages && activePages.length == 1) {
            var uicontent = activePages ? activePages.find('.ui-content') : null;
            var uipageHt = 0;
            var uipageChildren = activePages.children(); null;
            var uipageChildrenCount = uipageChildren ? uipageChildren.length : 0;
            for (var childInd = 0; childInd < uipageChildrenCount; childInd++) {
                var pageChild = uipageChildren[childInd];
                pageChild = pageChild ? $(pageChild) : null;
                if (!pageChild.is('script') && !pageChild.is('style'))
                    uipageHt += pageChild ? pageChild.outerHeight() : 0;
            }

            var contentHeight = activePages ? uipageHt : -1;
            if (contentHeight) {
                activePages ? activePages.width('100%') : "";
                parent && parent.ResizeIframeHeight ? parent.ResizeIframeHeight(contentHeight) : "";
            }
        }
    }

    // Fix for IE iframe load event firing too early
    var _timer = setInterval(function () {
        if (document.readyState == 'complete') {
            if (new Date().getTime() - initTime > 5000)
                clearInterval(_timer);
            else
                ChangePhoneContent();

            // Maintain the scroll position
            //window ? window.scrollTo(windowScrollLeft, windowScrollTop) : "";
        }
    }, 500);

    $(window).load(function () {
        ChangePhoneContent();
        initTime = new Date().getTime();
    });

    $(document).on("click", function () {
        ChangePhoneContents(new Date().getTime(), 3000);
    });
}
