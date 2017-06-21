var isMobileOld;

/* BEGIN Sample Page */

// Returns the Icon name for the control on the current sample page
function GetControlIconName() {
    var locationPath = location && location.pathname ? location.pathname.split('/') : "";
    var controlIconName = locationPath && locationPath.length > 1 ? locationPath[locationPath.length - 2] : "";
    controlIconName = controlIconName ? "igsb-" + controlIconName.trim().replace(new RegExp("-", "g"), "") : "";
    return controlIconName;
}

// Adds the correct icon class name to the control-title on the current sample page and removes any old classes 
function SetControlIconClass() {
    var sampleControlIcon = $("#sampleControlIcon");
    var controlIconName = GetControlIconName();
    if (sampleControlIcon) {
        prevControlIconName && sampleControlIcon.hasClass(prevControlIconName) ? sampleControlIcon.removeClass(prevControlIconName) : "";
        controlIconName && controlIconName != "" ? sampleControlIcon.addClass(controlIconName) : "";
        prevControlIconName = controlIconName;
    }
}

// Store the js files on initial page load
function StoreInitScripts(scripts) {
    if (scripts) {
        var length = scripts.length;
        for (i = 0; i < length; i++) {
            var src = scripts[i].src;
            var href = scripts[i].href;
            if (src && src.indexOf('js-data') < 0)
                scriptsHash[src] = 1;
            else if (href)
                scriptsHash[href] = 1;
        }
    }
}

// Execute scripts if any
function ExecScripts(scripts, isMobileContent) {
    if (scripts) {
        var sampleCSS = null;
        var leng = scripts.length;
        for (var scriptInd = 0; scriptInd < leng; scriptInd++) {
            var scriptTags = scripts[scriptInd];
            if (!scriptTags) continue;

            var scriptTagsLen = scriptTags.length;
            for (var sInd = 0; sInd < scriptTagsLen; sInd++) {
                var script = scriptTags[sInd];
                try {
                    if (script.tagName && (script.tagName.toLowerCase() == "link" || script.tagName.toLowerCase() == "style"))
                        throw "script is a link";

                    var src = script.src;
                    var innerHTML = script.innerHTML;
                    if (src && script.id != "historyJS" && (!isMobileContent || !scriptsHash.hasOwnProperty(src))) {
                        if (src.indexOf("sb-mobile") >= 0) {
                            scriptsHash[src] = 1;
                            throw "script is mobile";
                        }

                        $.ajaxSetup({ cache: true, async: false });
                        $.getScript(src, function (data, textStatus, jqxhr) {
                            if (textStatus == 'success' && src.indexOf('js-data') < 0)
                                scriptsHash[src] = 1;
                        });
                    }
                    else if (innerHTML)
                        throw "script has innerHTML";
                    //eval(innerHTML.trim());
                }
                catch (e) {
                    var head = $("head");
                    var tagName = script.tagName;
                    var linkElem = null;
                    if (tagName && tagName.toLowerCase() == "link") {
                        if (script.href.indexOf("sb-sample.css") >= 0)
                        { sampleCSS = script; continue; }

                        if (script.id != "responsiveCSS") {
                            var scriptHref = script.href.replace(location.origin, "");
                            linkElem = $('head link[href*="' + scriptHref + '"]');
                            if (!linkElem || linkElem.length <= 0)
                                linkElem = $('head link[href*="' + scriptHref + "?" + '"]');
                        }
                    }

                    if (head && script && script.id != "responsiveCSS" && (!linkElem || linkElem.length <= 0))
                        $(script).appendTo(head);
                }
            }
        }

        if(sampleCSS)
            $(sampleCSS).appendTo(head);
    }
}


function StoreTags(source, tagName) {
    var tags = [];
    var headTags = source.filter(tagName);
    tags.push(headTags);
    var bodyTags = source.find(tagName);
    tags.push(bodyTags);

    if (tagName != 'script') {
        currStyleScripts.push(headTags);
        currStyleScripts.push(bodyTags);
    }

    return tags;
}

function RemoveHeadTags(isMobileContent) {
    try {
        var headStyles = $("head style");
        headStyles ? headStyles.remove() : "";

        if (!isMobileContent) {
            var headLinks = $("head link[rel=stylesheet][href*='infragistics.theme.css']");
            headLinks ? headLinks.remove() : "";
            var infragisticsCSS = $("head link[rel=stylesheet][href*='infragistics.css']");
            infragisticsCSS ? infragisticsCSS.remove() : "";
            var sampleCSS = $("head link[rel=stylesheet][href*='sb-sample.css']");
            sampleCSS ? sampleCSS.remove() : "";
        }

        var jsScripts = $("head script").not($("head script[src]"));
        jsScripts ? jsScripts.remove() : "";
    }
    catch (ex) { }
}

function getElementsByClassName(node, classname) {
    var a = [];
    var re = new RegExp('(^| )' + classname + '( |$)');
    var els = node.getElementsByTagName("*");
    for (var i = 0, j = els.length; i < j; i++)
        if (re.test(els[i].className)) a.push(els[i]);
    return a;
}

function GetControlTitle(elem) {
    var aParent = elem ? elem.parents('.navControl') : null;
    var controlElem = aParent ? aParent.children(".navControlTitle") : null;
    var controlTitle = controlElem ? controlElem.text() : "";
    return controlTitle;
}

// Fix for IE : Expand the corresponding hamurger menu group 
// of currently selected sample on full page load
var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        DisableNavigation();
        clearInterval(readyStateCheckInterval);
    }
}, 1000);


// navigate to next/prev sample
// check - do not navigate, but return true if navigation is available (can be used to enable/disable next/prev buttons)
function sampleNavigateNextPrev(upDown, check) {
    if (!hasSampleLoaded) return;

    var li = $('li.listItemSelected')[0],
        a = li ? null : $(".hamburgerMenu").find("a"),
        i = a ? a.length : 0,
        loc = window.location.href;
    // find LI.A.href, which represents location of current sample
    while (!li && i-- > 0) {
        if (loc.indexOf(a[i].href) >= 0) {
            li = a[i].parentNode;
            if (li.nodeName !== "LI") {
                li = null;
            }
        }
    }
    while (li) {
        try{
            var liElem = $(li);
            if(!liElem) throw "No LI";

            var sibling = upDown ? liElem.next(".navSample") : liElem.prev(".navSample");

            // For navigating between navSample groups and overview pages
            if (!sibling || sibling.length == 0) {
                var liGroup = liElem.parents ? liElem.parents('.navSampleGroup') : null;
                var siblingLiGroup = liGroup ? (upDown ? liGroup.next() : liGroup.prev()) : null;
                siblingLiGroup = siblingLiGroup && siblingLiGroup.length > 0 ? siblingLiGroup : (upDown ? liElem.next() : liElem.prev());
                if (siblingLiGroup && siblingLiGroup.hasClass("navSample"))
                    sibling = siblingLiGroup;
                else {
                    var navSamplesList = siblingLiGroup ? siblingLiGroup.children('.navSamplesList') : null;
                    sibling = navSamplesList ? (upDown ? navSamplesList.children('.navSample:first') : navSamplesList.children('.navSample:last')) : null;
                }
            }
            li = sibling? sibling[0]: null;
        }
        catch (ex) { li = upDown ? li.nextSibling : li.previousSibling; }

        a = li && li.getElementsByTagName ? li.getElementsByTagName("A") : null;
        if (a && a[0]) {
            if (!check) {
                isManual = true;
                _navigate(a[0].href, $(a));
            }
            return true;
        }
    }
}

function FadeDialogDivs(remove) {
    var dialogDivIds = "", dialogs = "";
    try {
        if (document.getElementsByClassName != undefined)
            dialogs = document.getElementsByClassName("ui-igdialog");
        else if (document.querySelectorAll != undefined)
            dialogs = document.querySelectorAll(".ui-igdialog");
        else
            dialogs = getElementsByClassName(document.body, "ui-igdialog");
    }
    catch (ex) {

    }
    var count = dialogs.length;
    for (var i = 0; i < count; i++) {
        if (remove == true) {
            dialogDivIds += ",#" + dialogs[i].id;
            document.body.removeChild(dialogs[i]);
        }
        else {
            dialogs[i].id = "dialogDiv" + i;
            dialogDivIds += ",#" + dialogs[i].id;
        }
    }

    return dialogDivIds;
}

window.setInterval(function () {
    var lastUrlClean = GetCleanURL(lastUrl);
    var windowLocClean = GetCleanURL(window.location.href);

    if (lastUrlClean && windowLocClean && lastUrlClean != windowLocClean) {
        historyChangeFunc(true);
    }
    toggleCodeViewerPopup(false, true);
}, 500);

function DestroyWidgets() {

    // igGrid with groupBy should be destroyed, otherwise all grids with id "grid" will pick-up groupBy feature, which has one of samples
    if ($("#grid").data("igGrid")) {
        $("#grid").igGrid("destroy");
    }

    if ($("#zoom").data("igZoombar")) {
        $("#zoom").igZoombar("destroy");
    }

    // T.G. 27 Sep 2013 Fix for bug #153504: The popovers are not destroyed when leaving the sample's page
    if ($("#bodyParts").data("igPopover")) {
        $("#popoverTooltip").igPopover("destroy");
        $("#bodyParts").igPopover("destroy");
    }

    $("*[id*='htmlEditor']:visible").each(function () {
        $(this).remove();
    });

    if ($("#pivotView").data("igPivotView")) {
        $("#pivotView").igPivotView("destroy");
    }

    if ($("#dataSelector").data("igPivotDataSelector")) {
        $("#dataSelector").igPivotDataSelector("destroy");
    }

    if ($("#pivotGrid").data("igPivotGrid")) {
        $("#pivotGrid").igPivotGrid("destroy");
    }
}

// If the prev/next sample does not exist for the current sample, 
// disable the corresponding prev/next buttons
function DisableNavigation() {
    var sampleNavigatePrev = $("#sampleNavigatePrev");
    var sampleNavigateNext = $("#sampleNavigateNext");

    var prevChild = sampleNavigateNextPrev(false, true);
    if (sampleNavigatePrev && !prevChild) {
        sampleNavigatePrev.addClass("sampleNavigateDisabled");
    }

    var nextChild = sampleNavigateNextPrev(true, true);
    if (sampleNavigateNext && !nextChild)
        sampleNavigateNext.addClass("sampleNavigateDisabled");
}

// Perform actions when dynamic loading of sample is complete
function OnLoadComplete(scrollLeft, scrollTop) {
    hasSampleLoaded = true;
    var prevNext = $("#sampleNavigatePrev,#sampleNavigateNext");
    prevNext ? prevNext.removeClass("sampleNavigateDisabled") : "";
    DisableNavigation();
    SetSampleContainerWidth();

    var sbContainer = $("#sampleBrowserContainer");
    if (sbContainer && sbContainer.width() <= 0) {
        var tempContainer = $(".tempContainer");
        var containerMaxWidth = sbContainer ? sbContainer.css("max-width") : 0;
        var containerMinWidth = tempContainer ? tempContainer.css("min-width") : 0;
        SetSBContainerWidth(containerMinWidth, containerMaxWidth);
    }

    //intervalID = setInterval(SyncWithMainContainer, 100);

    // Maintain the scroll position
    //window ? window.scrollTo(scrollLeft, scrollTop) : "";
    windowScrollLeft = scrollLeft;
    windowScrollTop = scrollTop;
}

function UpdateContent(contents) {
    var htmlContent, relURL, isMobileContent, JSFiddleContent, detailsContent, noSrcScripts, bottomSection, scrollLeft, scrollTop;
    if (contents) {
        htmlContent = contents.htmlContent;
        relURL = contents.relURL;
        isMobileContent = contents.isMobileContainer;
        bottomSection = contents.bottomSection;
        noSrcScripts = contents.scripts;
        scrollLeft = contents.scrollLeft;
        scrollTop = contents.scrollTop;
    }
    DestroyWidgets();

    //intervalID = setInterval(SyncWithMainContainer, 100);

    // Replace sample content
    var elem, dialogDivIds = "";

    var mobileDivElem = $("#mobileDiv");
    var isCurrSampleMobile = isMobileContent && mobileDivElem && mobileDivElem.length > 0;
    if (isCurrSampleMobile != true) {
        dialogDivIds = FadeDialogDivs(true);
        if (htmlContent) {
            elem = $('#sampleContainer').show();
            document.getElementById('sampleContainer').innerHTML = htmlContent;
        }
    }    
    else {
        elem = mobileDivElem.show();

        // Hide qrcodeZone while navigating between mobile samples to enable fading effect
        var qrcodeZone = $('#qrCodeZone');
        qrcodeZone ? qrcodeZone.hide() : "";
    }

    if(this.GetAndSelectTheme)
        GetAndSelectTheme(true, relURL);

    // Remove prev <style>, stylesheet <link> tags and <script> with no src
    RemoveHeadTags(isMobileContent);

    // Execute scripts if any
    ExecScripts(noSrcScripts, isMobileContent);
    if (elem) {
        elem.hide();
    }

    // Replace bottom section content
    $('#bottomSection').hide().html(bottomSection);
    prettyPrint();
    $('#detailsViewer').tabs({
        heightStyle: "fill"
    });
    $(".jq-ui-tabs").tabs({

    });

    $('#dvLoading').css("display", "none");
    if (isCurrSampleMobile != true)
        $("#sampleContainer, #bottomSection").fadeIn(fadeInterval + 1000).promise().done(function () {
            OnLoadComplete(scrollLeft, scrollTop);
        });
    else
        $("#mobileDiv, #qrCodeZone, #bottomSection").fadeIn(fadeInterval + 1000).promise().done(function () {
            OnLoadComplete(scrollLeft, scrollTop);
        });

    // Reload style sheets for IE so that the correct media query is applied
    if (isIE) {
        ReloadStyleSheets();
        ExecScripts(currStyleScripts, isMobileContent);
    }

    SetMobileFeatures();

    // Maintain the scroll position
    window ? window.scrollTo(scrollLeft, scrollTop) : "";

    prevStyleScripts = currStyleScripts;
    initSelectBehavior();
}

// Returns the url without the # or query parameters
function GetCleanURL(url) {
    var cleanUrl = null;
    if (url) {
        cleanUrl = url.split('#')[0].split("/?")[0].split("?")[0];
    }

    return cleanUrl;
}

$(document).ready(function () {
    initLoad = true;
    lastUrl = window.location.href;
        
    // Store the js files on initial page load
    StoreInitScripts(document.scripts);

    // Bind to StateChange Event
    // History._ig_events_ - flag to ensure that events are used/attached only once
    if (History && History.Adapter && !History._ig_events_) {
        // try to catch situation when dynamic sample was reloaded: IE9 may load the very first (wrong) sample
        var url = window.location.href, stateUrl = History ? History.savedStates : null;
        // reload button in mobile samples triggers javascript exceptions in iframe: do not reload
        // check for selectTheme #themeSelector attempts to detect "mobile" samples
        if (isIE9 && !window.selectTheme && !$("#themeSelector")[0] && stateUrl && stateUrl.length === 1) {
            stateUrl = stateUrl[0].cleanUrl;
            // name of sample
            var sample = stateUrl ? stateUrl.substring(stateUrl.lastIndexOf("/")) : "";
            if (sample && url.indexOf(sample) > 0 && stateUrl.length + 5 < url.length) {
                startUrl = stateUrl;
                // temporary hide content of sample
                $("#sampleContainer, #bottomSection").css("visibility", "hidden");
                // flag which triggers resetting url from last state of History. To prevent double action for statechange use only ig9Bug==1.
                ie9Bug = 1;
            }
        }
        History.Adapter.bind(window, History._ig_events_ = 'statechange', historyChangeFunc = function (urlChanged) { // Note: We are using statechange instead of popstate
            // prevent possible reload of same sample twice

        	if ($("#sample-title")[0].textContent !== undefined && $("#sample-title")[0].textContent.toLowerCase().indexOf("history.js") === 0 && GetCleanURL(lastUrl) === GetCleanURL(location.href)) {
                return;
            }
            if (ie9Bug && ie9Bug++ > 1) {
                return;
            }
            var State;
            if (urlChanged == true) {
                try {
                    State = History.getStateById(History.getIdByUrl(window.location.href));
                } catch (ex) { }
            }
            if (!State)
                State = History.getState();
            //toggleSampleFeatureList();
            try {
                if (State === null) return;

                var data = State.data;
                // Avoid reloading due to replaceState  
                if (initLoad == true) {
                    initLoad = false;
                    if (!ie9Bug) {
                        return;
                    }
                };
                // avoid reloading due to replaceState: may happen in mobile samples
                if (!ie9Bug && lastUrl === window.location.href) {
                    return;
                }
                lastUrl = window.location.href;
                if (document.title != State.title)
                    document.title = State.title;

                var controlTitle = data && data.controlTitle ? data.controlTitle.trim() : "";
                /* OK 10/9/2013 154494 - Overview page title needs to be updated */
                var title = data && data.sampleTitle ? data.sampleTitle.trim().replace("の概要", "概要") : "";
                var relURL = State.hash ? State.hash.split('?')[0] : "";

                var controlTitleElem = $("#control-title");
                controlTitleElem ? controlTitleElem.text(controlTitle) : "";

                SetControlIconClass();

                var sampleTitle = $("#sample-title");
                sampleTitle ? sampleTitle.text(title) : "";

                //var samplePath = $("#sample-path");
                //samplePath ? samplePath.text(title) : "";
                //samplePath ? samplePath.attr("href", relURL) : "";

                // Change keywords meta tag contents
                var keywordMeta = $('[name="keywords"]');
                if (keywordMeta && data.keywordContent)
                    keywordMeta.attr("content", data.keywordContent);

                // adjust appearance of selected item
                var currIndex = data.currSelected;
                var currSel = getNavigationLIs()[currIndex], lastSelected = $('li.listItemSelected');
                if (lastSelected[0] !== currSel) {
                    if (lastSelected[0]) {
                        lastSelected.removeClass("listItemSelected");
                    }
                    $(currSel).addClass("listItemSelected");
                }

                // Scroll to current selected item
                //scrollToElem('.hamburgerMenu', currSel);

                MyAppUrlSettings.SampleContentURL = relURL;
                var fadedOut = false;
                hasLoaded = false;
                var counter = 0;
                var htmlContent = null, mobileContainer = $("#mobile-content");
                var noSrcScripts = [];

                var isMobileContent = mobileContainer != null && mobileContainer.length > 0;
                var sampleContents = {};
                // do not animate hiding of old page, when page should be reloaded
                if (!ie9Bug) {
                    var dialogDivIds = FadeDialogDivs(false);
                    hasSampleLoaded = false;
                    $("#sampleNavigatePrev,#sampleNavigateNext").addClass("sampleNavigateDisabled");

                    if (isMobileContent != true) {
                        // For samples that take a long time to load, we need to display a loading image
                        $('#dvLoading').css("display", "block");

                        $("#sampleContainer, #bottomSection" + dialogDivIds).fadeOut(fadeInterval).promise().done(function () {
                            fadedOut = true;
                            if (hasLoaded == true)
                                UpdateContent(sampleContents);
                        });
                    }
                    else
                        $("#mobileDiv, #qrCodeZone, #bottomSection").fadeOut(fadeInterval).promise().done(function () {
                            fadedOut = true;
                            if (hasLoaded == true)
                                UpdateContent(sampleContents);
                        });
                }
                $.ajax({
                    url: MyAppUrlSettings ? MyAppUrlSettings.SampleContentURL : "", type: "Get", dataType: 'html', cache: true,
                    success: function (result) {
                        if (!result) {
                            return;
                        }
                        result = $($.trim(result));
                        // Change sample description
                        var sampleDesc = $(".igsb-sample-desc");
                        var newSampleDesc = result.find(".igsb-sample-desc");
                        /* OK 10/10/2013 154502 - changed this to look at and replace html instead of text, since description is not always pure text, but can contain links */
                        newSampleDesc = newSampleDesc ? newSampleDesc.html() : "";
                        sampleDesc ? sampleDesc.html(newSampleDesc) : "";

                        // Get sample content
                        resultMobileContainer = result.find("#mobile-content");
                        var mainDiv = result.find("#sampleContainer");
                        htmlContent = mainDiv != null && mainDiv.length > 0 ? mainDiv.html() : "";

                        // Get bottom section content
                        var bottomDiv = result.find("#bottomSection");
                        var bottomSection = bottomDiv != null && bottomDiv.length > 0 ? bottomDiv.html() : "";

                        // Eval all unloaded <script>, <style> and <link> tags on the new page
                        currStyleScripts = [];
                        noSrcScripts = StoreTags(result, 'link[rel=stylesheet], style, script');

                        isMobileContent = resultMobileContainer != null && resultMobileContainer.length > 0;
                        sampleContents = {
                            htmlContent: htmlContent,
                            bottomSection: bottomSection,
                            isMobileContainer: isMobileContent,
                            relURL: relURL,
                            scripts: noSrcScripts,
                            scrollLeft: window && window.pageXOffset ? window.pageXOffset : 0,
                            scrollTop: window && window.pageYOffset ? window.pageYOffset : 0
                        };

                        hasLoaded = true;

                        // Replace contents
                        if (fadedOut == true || ie9Bug)
                            UpdateContent(sampleContents);
                        if (ie9Bug) {
                            // show temporary hidden content of sample
                            $("#sampleContainer, #bottomSection").css("visibility", "visible");
                            ie9Bug = null;
                        }

                        result.remove();
                    }
                });
            }
            catch (exe) { }
        });
    }


    // process buttons for navigation to next/prev sample
    $("#sampleNavigatePrev").click(function (e) {
        sampleNavigateNextPrev();
    });
    $("#sampleNavigateNext").click(function (e) {
        sampleNavigateNextPrev(true);
    });
    // process click on feature-button to show drop-down list of samples

    //$("#featuredControlsTitle").click(function (e) {
    //    toggleControlListHeader($(this));
    //});
    //$("#allControlsTitle").click(function (e) {
    //    toggleControlListHeader($(this));
    //});
    //$("#prodNavCollapseButton").click(function (e) {
    //    toggleprodNavCollapse($(this));
    //});
    //$("#desktopIndexNav").click(function (e) {
    //    toggleprodNavCollapseControls($(this));
    //});
    //$("#mobileIndexNav").click(function (e) {
    //    toggleprodNavCollapseControls($(this));
    //});
    //$(document.body).click(function () {
    //    toggleSampleFeatureList();
    //}).keydown(function (evt) {
    //    if (evt.keyCode === 27) {
    //        toggleSampleFeatureList();
    //    }
    //});   

});

/* END Sample Page */
