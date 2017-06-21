var qrOptions = {
    text: location.href,
    qrZoneID: 'qrCodeZone',
    qrImageID: 'qrcodeImage',
    size: '141',
    margin: '10',
    typeNumber: false,
    render: 'image'
};

var mobileDivHeight = null, prevActivePageUrl = null, defaultTheme = "ios", defaultDeviceThemeSet = null, defaultThemeIndex = 0, defaultAndroidIndex = 3, defaultWPhoneIndex = 5;

// Replaces iframe to prevent iframe from adding to browser history every time its src is changed
function ReplaceIFrame(iframe, newSrc) {
    try {
        if (iframe) {
            var frm = iframe.clone(true);
            frm ? frm.attr("src", newSrc) : "";
            iframe.replaceWith(frm);
            frm = null;
        }
    }
    catch (ex) {
    }
}

// Update QR code and popout link
function UpdatePopoutSample(phoneTheme, isInitLoad) {
    if (qrOptions) {
        qrOptions.text = location.href;
        qrOptions.isInitLoad = isInitLoad;
        CreateQRCode(qrOptions);
    }

    var href = qrOptions ? qrOptions.text : location.href;
    phoneTheme = phoneTheme == null || phoneTheme == "" ? defaultTheme : phoneTheme;
    var popoutLink = href ? href + "?mobileview=native&phoneTheme=" + phoneTheme : "";
    $("#popoutLink").attr("href", popoutLink);
}

// Gets the last-selected/default theme and sets this for the themeSelector
// Parameters: isInitLoad - true if the sample is loaded for the first time or needs a full postback
//             relURL - If specified, this is the relative URL for the mobile sample, without the query string parameters
function GetAndSelectTheme(isInitLoad, relURL) {
    var themeCombo = $('input[name="_themeCombo"]');
    var mobileName = getMobile();
    var defThemeIndex = mobileName ? (mobileName.indexOf("android") >= 0 ? defaultAndroidIndex
                                      : mobileName.indexOf("windowsphone") >= 0 ? defaultWPhoneIndex : defaultThemeIndex)
                                   : defaultThemeIndex;
    var themeIndex = themeCombo && themeCombo.val() && parseFloat(themeCombo.val()) >= 0 ? parseFloat(themeCombo.val()) : defThemeIndex;
    var themeItems = $(".igsb-themeItem");
    var currThemeItem = themeItems ? themeItems.get(themeIndex) : null;
    currThemeItem ? selectTheme($(currThemeItem), isInitLoad, relURL) : "";
}

// Updates the theme of the mobile sample and the popout link
// Parameters: source - The currently selected theme Item of the themeSelector
//             isInitLoad - true if the sample is loaded for the first time or needs a full postback
//             relURL - If specified, this is the relative URL for the mobile sample, without the query string parameters
function selectTheme(source, isInitLoad, relURL) {
    if (!source) {
        return;
    }

    try{
        // Remove any previously selected theme and select new theme
        var currSelectedTheme = $('.igsb-themeItem.igsb-themeSelected');
        currSelectedTheme ? currSelectedTheme.removeClass("igsb-themeSelected") : "";
        source.addClass("igsb-themeSelected");

        // Update the theme name of the themeSelector button to the currently selected theme name
        var themeName = $(".igsb-themeName"),
            textParent = source.children(".mobileTheme"),
            textItem = textParent? textParent.children(".igsb-list-text"): null,
            textItemValue = textItem ? textItem.text() : null;
        textItemValue && themeName ? themeName.text(textItemValue) : "";

        // Update the hidden input value to be consistent with the selected theme
        var allThemeItems = $(".igsb-themeItem");
        if (allThemeItems) {
            var themeCombo = $('input[name="_themeCombo"]');
            var sourceIndex = allThemeItems.index(source);
            themeCombo ? themeCombo.val(sourceIndex) : "";
        }

        var item = source.children(".igsb-list-value"),
            theme = item ? item.text() : null,
            selectedImg = source.children(".igsb-list-imageName"),
            selectedImgName = selectedImg ? selectedImg.text() : null,
            iframe = $("#phoneContainer iframe"),
            src = iframe ? iframe.attr("src") : null;

        if (theme) {
            var i = src ? src.indexOf("&phoneTheme=") : -1;
            var newSrc = src ? (i > 0 ? src.substring(0, i) : src) + "&phoneTheme=" + theme : null;
            relURL = relURL && relURL != "" ? relURL + "?mobileview=desktop&phoneTheme=" + theme : null;
            if (relURL && newSrc !== relURL)
                newSrc = relURL;

            // change theme of iframe content: phoneTheme is used by MobileSample.cshtml and processed by SampleViewModel.MobilePhoneTheme
            if (!isInitLoad && history && history.pushState && src.indexOf("./") !== 0)
                ReplaceIFrame(iframe, newSrc); // Replaces iframe to prevent iframe from adding to browser history every time its src is changed

            // change overall image of phone: background of DIV and attributes of its child elements
            var phoneContainer = $("#phoneContainer");
            phoneContainer ? phoneContainer.removeClass("ios").removeClass("android").removeClass("wp7").addClass(selectedImgName) : "";

            if (isIE7) {            
                var popoutContainer = $(".popout-container");
                if (popoutContainer)
                    popoutContainer.css("display", "none");
            }
            else {
                // Update Popout Sample details
                UpdatePopoutSample(theme, isInitLoad);
            }
        }
    }
    catch (ex) { }
}

// Change the height of iframe to match the height of its contents
function ResizeIframeHeight(contentHeight) {
    if (!contentHeight) return;

    var newMobileContentHt = mobileDivHeight && mobileDivHeight > contentHeight ? mobileDivHeight : contentHeight;
    var extraMargin = 1; // for IE

    var isMobilePopup = location.href.indexOf("mobile-popup") >= 0; // popup-sample
    if (isMobilePopup) newMobileContentHt = mobileDivHeight;

    if (newMobileContentHt) {
        var mobileDiv = $("#mobileDiv");
        var mobileContent = $("#mobile-content");
        mobileDiv ? mobileDiv.css('min-height', newMobileContentHt + extraMargin) : "";
        mobileContent ? mobileContent.css('min-height', newMobileContentHt + extraMargin) : "";
    }
}

function ChangePhoneAttributes() {
    var mobileDiv = $("#mobileDiv");
    if (!mobileDiv || mobileDiv.length == 0) return; // not mobile sample

    var _isMobile = isMobilePhone();
    if (!_isMobile) return; // not mobile device        

    var phoneContainer = $("#phoneContainer");
    var mobileContent = $("#mobile-content");
    var mobileMainContainer = $(".mobileMainContainer");
    var screen = $(".screen");
    var popoutSample = $(".popout-sample ");
    var popoutContainer = $(".popout-container");
    var qrCode = $(".qr-code");

    phoneContainer && !phoneContainer.hasClass("phoneContainerPhone") ? phoneContainer.addClass("phoneContainerPhone") : "";
    mobileMainContainer && !mobileMainContainer.hasClass("mobileMainContainerPhone") ? mobileMainContainer.addClass("mobileMainContainerPhone") : "";
    mobileContent && !mobileContent.hasClass("mobileContentPhone") ? mobileContent.addClass("mobileContentPhone") : "";
    screen && !screen.hasClass("screenPhone") ? screen.addClass("screenPhone") : "";
    popoutSample && !popoutSample.hasClass("popoutSamplePhone") ? popoutSample.addClass("popoutSamplePhone") : "";
    qrCode && !qrCode.hasClass("qrCodePhone") ? qrCode.addClass("qrCodePhone") : "";
}

$(function () {
	var href = document.location ? document.location.href : null;
	if (href && href.indexOf("file:") === 0) {
		return;
	}

    var hitEvent = document && document.documentElement && 'ontouchstart' in document.documentElement
                    ? 'touchstart': 'click';

    // Open/Close the themeSelector menu
    $(document).off(hitEvent, "#igsb-themeButton").on(hitEvent, "#igsb-themeButton", function () {
        OpenCloseMenuItem($(this), "#igsb-themeSelector", "#sampleContainer");
    });

    // Switch between themes
    $(document).off(hitEvent, ".igsb-themeItem").on(hitEvent, ".igsb-themeItem", function () {
        windowScrollLeft = window && window.pageXOffset ? window.pageXOffset : 0;
        windowScrollTop = window && window.pageYOffset ? window.pageYOffset : 0;

        selectTheme($(this), false, "");
    });    
        
    // Actions to be performed when content of iframe completes loading
    $("#mobile-content").load(function () {
    });
    
    $(window).resize(windowResizeFn = function (onload) {
        try {

            // Change the width and height of the phone container for mobile devices
            ChangePhoneAttributes();
        }
        catch (ex) { }
    });

    $(document).ready(function () {
        // Fix for theme not getting applied via back/forward buttons
    	if (!defaultDeviceThemeSet) {
    		GetAndSelectTheme(false, "");
    		defaultDeviceThemeSet = true;
    	}
    	ChangePhoneAttributes();
    });

    // Fix for IE : Expand the corresponding hamurger menu group 
    // of currently selected sample on full page load
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            ChangePhoneAttributes();
            clearInterval(readyStateCheckInterval);
        }
    }, 1000);
});