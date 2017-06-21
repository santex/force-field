/*
* Infragistics.Web.ClientUI Scroll 15.2.20152.78
*
* Copyright (c) 2015 Infragistics Inc.
*
* http://www.infragistics.com/
*
* Depends on:
* jquery-1.4.4.js
* jquery.ui.core.js
* jquery.ui.widget.js
*/

/*global jQuery,setTimeout,window,clearTimeout,document*/
(function ($) {
	var _attr = "data-sb-scroll", _stop = function (e, noStop) {
		try {
			e.preventDefault();
			if (!noStop) {
				e.stopPropagation();
			}
		} catch (ex) { }
	}, _aNull = function (val) {
		return val === null || val === undefined || (typeof val === "number" && isNaN(val));
	}, _num = function (val) {
		// convert to int
		return isNaN(val = parseInt(val, 10)) ? 0 : val;
	}, _int = function (elem, css) {
		// css attribute of elem as int
		return _num(elem.css(css));
	}, _draggable = function (type) {
		return type === "draggable";
	}, _thin = function (type) {
		return type === "show";
	}, _zero = function (num) {
		return isNaN(num) || num < 5;
	}, _touch = function (e, mouse) {
		// get touch from event
		e = e.originalEvent;
		if (mouse) {
			return e;
		}
		e = e ? e.touches : null;
		return (e && e.length === 1) ? e[0] : null;
	}, _src = function (e) {
		// get source element from event
		e = e.target;
		return e.nodeName === "#text" ? e.parentNode : e;
	}, _is = function (elem, src) {
		return elem && (elem.has(src).length > 0 || elem[0] === src);
	}, _valid = function (elem) {
		return (elem && elem[0].parentNode) ? elem : null;
	}, _remove = function (elem) {
		if (_valid(elem)) {
			elem.remove();
		}
	}, _find = function (notMobile) {
		setTimeout(function () {
		    var m = window.Modernizr;
            //don't need this for mouse
			//if (!m || m.touch) {
				$("body").find("[" + _attr + "]").each(function () {
					var elem = $(this), scroll = elem.data("igSbScroll");
					if ((!scroll || !scroll.evts) && !elem.data('igSbScroll') && !elem.data('scrollview')) {
						elem.igSbScroll({ _find: true });
					}
				});
			//}
		}, notMobile === true ? 1000 : 100);
	};
	$.widget("ui.igSbScroll", {
		options: {
			/* type="number" Sets gets opacity of dragged thumb. Default value is 1. That is applied only when x/yThumb is "draggable". */
			thumbOpacityDrag: null,
			/* type="bool" Sets gets opacity of thumb. Default value is 0.5. */
			thumbOpacity: null,
			/* type="bool" Sets gets option to cancel touchstart event and explicitly raise mouse events on touchend. */
			cancelStart: null,
			/* type="bool" Sets gets option to perform scrolling only in one direction. */
			oneDirection: null,
			/* type="x|y|null" Sets gets scroll direction. */
			direction: null,
			/* type="number" Sets gets duration of animation effect in millisecods to show thumbs. Value less than 5 will disable animation. Default value is 300. */
			animateShowDuration: null,
			/* type="number" Sets gets duration of animation effect in millisecods to hide thumbs. Value less than 5 will disable animation. Default value is 500. */
			animateHideDuration: null,
			/* type="number" Sets gets delay in milliseconds to hide thumbs, which is used when none of thumbs is draggable. If value is less than 5, then 5 is used. Default value is 200. */
			hideThumbsDelay: null,
			/* type="number" Sets gets delay in milliseconds to hide thumbs, which is used when any of thumbs is draggable. If value is less than 5, then 5 is used. Default value is 1000. */
			hideDragThumbsDelay: null,
			/* type="number" Sets gets inertia for horizontal scrolling. The larger value, the longer inertia. Range from 0.97 to 0. Default value is 0.8. */
			xInertia: null,
			/* type="number" Sets gets inertia for vertical scrolling. The larger value, the longer inertia. Range from 0.97 to 0. Default value is 0.85. */
			yInertia: null,
			/* type="show|draggable|none" Sets gets type of horizontal thumb. Default value is "show". */
			xThumb: null,
			/* type="show|draggable|none" Sets gets type of vertical thumb. Default value is "draggable". */
			yThumb: null,
			/* type="touch|mouse|auto" Sets gets type of browser events which activate functionality. */
			eventType: null,
			xLabel: null,
			yLabel: null,
			/* type="number" Sets gets margin between left edge of horizontal scrollbar (position of xThumb) and edge of target element. Number of pixels. */
			marginLeft: null,
			/* type="number" Sets gets margin between right edge of horizontal scrollbar (position of xThumb) and edge of target element. Number of pixels. */
			marginRight: null,
			/* type="number" Sets gets margin between top edge of vertical scrollbar (position of yThumb) and edge of target element. Number of pixels. */
			marginTop: null,
			/* type="number" Sets gets margin between bottom edge of vertical scrollbar (position of yThumb) and edge of target element. Number of pixels. */
			marginBottom: null,
			/* type="dom" Sets gets reference to html element which is used for horizontal scrolling. Value also may contain jquery selector instead of element. */
			xScroller: null,
			/* type="dom" Sets gets reference to html element which is used for vertical scrolling. Value also may contain jquery selector instead of element. */
			yScroller: null
		},
		events: {
			/* cancel="true" Event which is raised before start scrolling.
				Return false in order to cancel action.
				Function takes arguments evt and ui.
				Use evt.originalEvent to obtain reference to event of browser.
				Use ui.owner to obtain reference to igSbScroll.
			*/
			starting: null,
			/* cancel="false" Event which is raised after start scrolling.
				Function takes arguments evt and ui.
				Use evt.originalEvent to obtain reference to event of browser.
				Use ui.owner to obtain reference to igSbScroll.
			*/
			started: null,
			/* cancel="true" Event which is raised before scrolling.
				Return false in order to cancel action.
				Function takes arguments evt and ui.
				Note: while inertia, the evt parameter is not available.
				Use evt.originalEvent (with validation for not null of evt) to obtain reference to event of browser.
				Use ui.owner to obtain reference to igSbScroll.
				Use ui.deltaX to obtain increment/decrement of horizontal scroller. That member can be modified and igScoll will use that new custom value.
				Use ui.deltaY to obtain increment/decrement of vertical scroller. That member can be modified and igScoll will use that new custom value.
			*/
			scrolling: null,
			/* cancel="false" Event which is raised after scrolling.
				Function takes arguments evt and ui.
				Note: while inertia, the evt parameter is not available.
				Use evt.originalEvent (with validation for not null of evt) to obtain reference to event of browser.
				Use ui.owner to obtain reference to igSbScroll.
				Use ui.deltaX to obtain increment/decrement of horizontal scroller.
				Use ui.deltaY to obtain increment/decrement of vertical scroller.
			*/
			scrolled: null,
			/* cancel="false" Event which is raised when scrolling was stopped.
				Function takes arguments evt and ui.
				Note: the first (evt) parameter is not available and equal to null.
				Use ui.owner to obtain reference to igSbScroll.
			*/
			stopped: null
		},
		scrollLeft: function (val) {
			/* Gets sets scrollLeft attribute for horizontal scroller.
				paramType="number" optional="true" new value for scrollLeft.
				returnType="number|object" Returns scrollLeft or reference to igSbScroll.
			*/
			if (_aNull(val)) {
				return this._getScroll(true);
			}
			this._scroll(val);
			return this;
		},
		scrollTop: function (val) {
			/* Gets sets scrollTop attribute for vertical scroller.
				paramType="number" optional="true" new value for scrollTop.
				returnType="number|object" Returns scrollTop or reference to igSbScroll.
			*/
			if (_aNull(val)) {
				return this._getScroll();
			}
			this._scroll(null, val);
			return this;
		},
		scrollWidth: function () {
			/* Gets scrollWidth attribute of horizontal scroller.
				returnType="number" Returns scrollWidth.
			*/
			return this._getScroll(true, true);
		},
		scrollHeight: function () {
			/* Gets scrollHeight attribute of vertical scroller.
				returnType="number" Returns scrollHeight.
			*/
			return this._getScroll(false, true);
		},
		_create: function () {
			var v, key, self = this,
				elem = self.element,
				o = self.options;
			if (o._find) {
				for (key in o) {
					if (o.hasOwnProperty(key) && _aNull(o[key])) {
						if (_aNull(v = elem.attr("data-" + key))) {
							v = elem.attr("data-" + key.replace("S", "-s").replace("D", "-d").replace("O", "-o").
								replace("R", "-r").replace("T", "-t").replace("I", "-i").replace("B", "-b").
								replace("L", "-l").replace("H", "-h").replace("D", "-d"));
						}
						if (!_aNull(v)) {
							o[key] = v;
						}
					}
				}
				o.direction = o.direction || elem.attr(_attr);
			}
			v = $.ui.igSbScroll.defaults;
			for (key in v) {
				if (v.hasOwnProperty(key) && o[key] === null) {
					o[key] = v[key];
				}
			}
			v = o.direction;
			self.dir = o.oneDirection && v !== "x" && v !== "y";
			if ((o.eventType === "mouse") || (o.eventType === "auto" && (!window.Modernizr || !window.Modernizr.touch))) {
                //alert(""+window.Modernizr+":"+(window.Modernizr?window.Modernizr.touch:"?"))
				self.mouse = {
					mousemove: function (e) {
						self._move(e);
					}, mouseup: function (e) {
						delete self.skip;
						if (self.drag) {
							_stop(e);
						}
						self._move(e, "end");
					}, selectstart: function (e) { _stop(e); }
				};
				elem.css("overflow", "hidden");
				self.on = { click: function (e) { self._aStop(e); } };
			}
			if (window.navigator.msPointerEnabled && Modernizr.touch) {
			    self.mouse = {
			        pointermove: function (e) {
			            if (self._pointer) {
			                self._move(e);
			            }
			        },
			        pointerdown: function (e) {
			            delete self.skip;
			            var touch = _touch(e);
			            if (touch) {
			                self.x = touch.pageX;
			                self.y = touch.pageY;
			                self.click = true;
			                if (o.cancelStart) {
			                    _stop(e);
			                }
			            } else {
			                self._move(e, "start");
			            }
			        },
			        pointerup: function (e) {
			            if (!self.click) {
			                self._move(e, "end");
			            } else if (o.cancelStart) {
			                $(_src(e)).trigger("mousedown").trigger("mouseup").trigger("click");
			            }
			        }
			    }
			}

			self.evts = self.mouse ? { mousedown: function (e) { delete self.skip; self._move(e, "start"); } } : {
				touchstart: function (e) {
					delete self.skip;
					var touch = _touch(e);
					if (touch) {
						self.x = touch.pageX;
						self.y = touch.pageY;
						self.click = true;
						if (o.cancelStart) {
							_stop(e);
						}
					} else {
						self._move(e, "start");
					}
				},
				touchmove: function (e) {
					self._move(e);
				},
				touchend: function (e) {
					if (!self.click) {
						self._move(e, "end");
					} else if (o.cancelStart) {
						$(_src(e)).trigger("mousedown").trigger("mouseup").trigger("click");
					}
				}
			};
			elem.bind(self.evts);
		},
		// create horizontal or vertical scroll-bar with none, thin or draggable type
		_createBar: function (elem, hor, type) {
			var bar, thumb, border, sizeInt, span, img,
				iconSize = 17,
				thumbSize = 5,
				thumbDragSize = 30,
				thin = _thin(type),
				display = hor ? "inline-block" : "block",
				margin = "margin" + (hor ? "Top" : "Left"),
				size = hor ? "height" : "width";
			if (thin || _draggable(type)) {
				bar = $("<span />").css({
					position: "absolute",
					zIndex: _int(elem, "zIndex") + 2,
					background: "transparent",
					border: "0px",
					opacity: 0,
					display: "block"
				}).addClass("ui-widget").css(size, "1px").insertAfter(elem);
				sizeInt = thin ? thumbSize : thumbDragSize;
				thumb = $("<span />").css("position", "relative").
					css(size, sizeInt).
					css("display", "block").appendTo(bar);
				// thin black thumb
				if (thin) {
					thumb.css("background", "#101010");
				// draggable-large-static-size thumb
				} else {
					thumb.addClass("ui-corner-all ui-state-hover");
					border = thumb.css("borderTopColor");
					sizeInt = hor ? thumb[0].offsetHeight : thumb[0].offsetWidth;
					span = $("<span />").css({
						display: display,
						borderStyle: "solid",
						borderColor: border,
						borderWidth: hor ? "0px 1px 0px 0px" : "0px 0px 1px 0px"
					}).addClass("ui-corner-" + (hor ? "left" : "top")).css(size, "100%").appendTo(thumb);
					img = $("<span />").css("display", "block").
						css(margin, Math.floor((sizeInt - iconSize) / 2) + "px").
						addClass("ui-icon ui-icon-carat-1-" + (hor ? "w" : "n")).appendTo(span);
					span = $("<span />").css("display", display).css(size, "100%").appendTo(thumb);
					img = $("<span />").css("display", "block").
						css(margin, Math.floor((sizeInt - iconSize) / 2) + "px").
						addClass("ui-icon ui-icon-grip-dotted-" + (hor ? "vertical" : "horizontal")).appendTo(span);
					span = $("<span />").css({
						display: display,
						borderStyle: "solid",
						borderColor: border,
						borderWidth: hor ? "0px 0px 0px 1px" : "1px 0px 0px 0px"
					}).addClass("ui-corner-" + (hor ? "right" : "bottom")).css(size, "100%").appendTo(thumb);
					img = $("<span />").css("display", "block").
						css(margin, Math.floor((sizeInt - iconSize) / 2) + "px").
						addClass("ui-icon ui-icon-carat-1-" + (hor ? "e" : "s")).appendTo(span);
				}
				thumb.css(margin, -(sizeInt + 1) + "px");
			}
			if (hor) {
				this.barX = bar;
				this.thumbX = thumb;
			} else {
				this.barY = bar;
				this.thumbY = thumb;
			}
		},
		// adjust location of scroll-bar
		_bar: function (elem, hor) {
			var v, left, top, thumb, locElem, locBar, shiftBar, shiftX, shiftY, thumbSize,
				o = this.options,
				barMargin = 2,
				barSizeMargin = _num(hor ? o.marginLeft : o.marginTop),
				barSizeMargin2 = _num(hor ? o.marginRight : o.marginBottom),
				minBarSize = 4,
				minThumbSize = 15,
				bar = hor ? this.barX : this.barY,
				type = hor ? o.xThumb : o.yThumb,
				elemSize = hor ? elem[0].offsetWidth : elem[0].offsetHeight,
				barSize = Math.max(elemSize - barSizeMargin - barSizeMargin2, minBarSize),
				scrollSize = Math.max(this._getScroll(hor, true), minBarSize + barSizeMargin + barSizeMargin2);
			if (!elemSize || scrollSize - elemSize < 1) {
				if (bar) {
					bar.remove();
					delete this.bar;
				}
				return;
			}
			if (bar) {
				if (_valid(bar)) {
					return bar;
				}
				bar.insertAfter(elem);
			}
			if (!bar) {
				this._createBar(elem, hor, type);
			}
			bar = hor ? this.barX : this.barY;
			if (!bar) {
				return;
			}
			thumb = hor ? this.thumbX : this.thumbY;
			if (_draggable(type) && thumb) {
				thumb.bind(this.evts);
			}
			shiftBar = (hor ? elem[0].offsetHeight : elem[0].offsetWidth) - barMargin;
			left = _int(elem, "marginLeft") + (hor ? barSizeMargin : shiftBar);
			top = _int(elem, "marginTop") + (hor ? shiftBar : barSizeMargin);
			bar.css({ left: elem.css("left"), top: elem.css("top"), marginLeft: left + "px", marginTop: top + "px" });
			if (_thin(type)) {
				thumb.css(hor ? "width" : "height", Math.floor(Math.max(elemSize * elemSize / scrollSize, minThumbSize)) + "px");
			}
			thumbSize = hor ? thumb[0].offsetWidth : thumb[0].offsetHeight;
			v = (scrollSize - barSize - barSizeMargin - barSizeMargin2 + barMargin) / (barSize - thumbSize);
			if (hor) {
				this.ratioX = v;
			} else {
				this.ratioY = v;
			}
			//
			locElem = elem.offset();
			locBar = bar.offset();
			shiftY = locBar.top - locElem.top - (hor ? shiftBar : barSizeMargin);
			shiftX = locBar.left - locElem.left - (hor ? barSizeMargin : shiftBar);
			if (Math.abs(shiftY) > 0) {
				bar.css("marginTop", (top - shiftY + _int(elem, "borderTopWidth")) + "px");
			}
			if (Math.abs(shiftX) > 0) {
				bar.css("marginLeft", (left - shiftX + _int(elem, "borderLeftWidth")) + "px");
			}
			return bar;
		},
		// get scroller
		_scroller: function (hor) {
			var o = this.options, div = o.direction;
			if (!this.evts || (hor && div === "y") || (!hor && div === "x")) {
				return;
			}
			div = hor ? o.xScroller : o.yScroller;
			if (div && typeof div === "string") {
				div = $(div)[0];
				if (hor) {
					o.xScroller = div;
				} else {
					o.yScroller = div;
				}
			}
			if (div && div.length) {
				div = div[0];
			}
			return div || this.element[0];
		},
		// get left/top to width/height of scroller
		_getScroll: function (hor, size) {
			var div = this._scroller(hor);
			if (!div) {
				return 0;
			}
			return hor ? (size ? div.scrollWidth : div.scrollLeft) : (size ? div.scrollHeight : div.scrollTop);
		},
		// do horizontal scroll
		_scroll: function (x, y) {
			var div = this._scroller(true);
			if (div && !this.inBarY && this.dir !== "y" && !_aNull(x)) {
				div.scrollLeft = x;
				if (this.thumbX) {
					this.thumbX.css("marginLeft", Math.floor(div.scrollLeft / this.ratioX) + "px");
				}
			}
			div = this._scroller();
			if (div && !this.inBarX && this.dir !== "x" && !_aNull(y)) {
				div.scrollTop = y;
				if (this.thumbY) {
					this.thumbY.css("marginTop", Math.floor(div.scrollTop / this.ratioY) + "px");
				}
			}
		},
		_vis: function () {
			return this.evts && this.element[0].offsetWidth;
		},
		// do inertia
		_inertia: function () {
			var self = this,
				arg = { owner: self },
				max = 0.97,
				stopTimerSpeed = 0.8,
				x = self.speedX,
				y = self.speedY,
				o = self.options,
				tick = 17,
				rateX = Math.max(Math.min(parseFloat(o.xInertia), max), 0),
				rateY = Math.max(Math.min(parseFloat(o.yInertia), max), 0),
				speedX = (x ? x[0] + x[1] + x[2] : 0) * tick,
				speedY = (y ? y[0] + y[1] + y[2] : 0) * tick,
				left = self._getScroll(true),
				top = self._getScroll(),
				inertia = function () {
					self.timer = setTimeout(function () {
						delete self.timer;
						arg.deltaX = -Math.floor(speedX);
						arg.deltaY = -Math.floor(speedY);
						if (!self._vis() || !self._trigger("scrolling", null, arg)) {
							self._end();
							return;
						}
						left += arg.deltaX;
						top += arg.deltaY;
						self._scroll(Math.floor(left), Math.floor(top));
						self._trigger("scrolled", null, arg);
						speedY *= rateY;
						speedX *= rateX;
						if ((Math.abs(speedY) > stopTimerSpeed && top > 0) || (Math.abs(speedX) > stopTimerSpeed && left > 0)) {
							inertia();
						} else {
							self._end();
						}
					}, tick * 3);
				};
			inertia();
		},
		// show thumbs with possible delay
		_show: function (valid) {
			var bar, self = this,
				o = self.options,
				val = parseFloat(o.thumbOpacity),
				valDrag = parseFloat(o.thumbOpacityDrag),
				dur = valid ? 0 : _num(o.animateShowDuration),
				barX = _valid(self.barX),
				barY = _valid(self.barY);
			if (self.hiding) {
				self.hiding.stop(true);
				delete self.hiding;
			}
			if (_zero(dur)) {
				if (barX) {
					barX.css("opacity", self.inBarX ? valDrag : val);
				}
				if (barY) {
					barY.css("opacity", self.inBarY ? valDrag : val);
				}
				return;
			}
			bar = barX || barY;
			if (bar) {
				self.showing = bar.animate({ opacity: val }, {
					duration: dur,
					complete: function () { delete self.showing; },
					step: function (now) {
						if (barX && barY) {
							barY.css("opacity", now);
						}
					}
				});
			}
		},
		// do action after thumbs became invisible: remove thumbs
		_hide: function (hide) {
			var self = this;
			if (self.showing) {
				self.showing.stop(true);
				delete self.showing;
			}
			setTimeout(function () {
				if (self.hiding || hide) {
					_remove(self.barX);
					_remove(self.barY);
					delete self.hiding;
				}
			}, 0);
		},
		// do action after end-scroll: hide thumbs with delay and animate thumb-hiding
		_end: function () {
			var self = this,
				o = self.options,
				delay = (self.thumbX && _draggable(o.xThumb)) || (self.thumbY && _draggable(o.yThumb)),
				dur = _num(o.animateHideDuration);
			self._trigger("stopped", null, { owner: self });
			if (self.skip || !self._vis()) {
				return self._hide(true);
			}
			delay = _num(delay ? o.hideDragThumbsDelay : o.hideThumbsDelay);
			self.timerEnd = setTimeout(function () {
				if (!self.timer && self.timerEnd) {
					if (_zero(dur)) {
						self._hide(true);
					} else {
						var bar = _valid(self.barX), bar2 = _valid(self.barY);
						if (!bar) {
							bar = bar2;
							bar2 = null;
						}
						if (bar) {
							self.hiding = bar.animate({ opacity: 0 }, {
								duration: dur,
								complete: function () { self._hide(); },
								step: function (now) {
									if (bar2) {
										bar2.css("opacity", now);
									}
									if (self.skip && self.hiding) {
										self.hiding.stop();
									}
								}
							});
						}
					}
				}
				delete self.timerEnd;
			}, _zero(delay) ? 5 : delay);
		},
		// clear timers
		_clear: function () {
			if (this.timer) {
				clearTimeout(this.timer);
				delete this.timer;
			}
			if (this.timerEnd) {
				clearTimeout(this.timerEnd);
				delete this.timerEnd;
			}
		},
		_fire: function (t, e, x, y) {
			return this._trigger(t, e, { owner: this, left: x, top: y });
		},
		// return true if nowhere to scroll: allow default scrolling of browser
		_skip: function (x, y) {
			var dir = this.options.direction,
				left = this._scroller(true) || 0,
				top = this._scroller() || 0,
				height = 0,
				width = 0,
				heightScroll = 0,
				widthScroll = 0;
			if (left) {
				width = left.clientWidth;
				widthScroll = left.scrollWidth;
				left = left.scrollLeft;
			}
			if (top) {
				height = top.clientHeight;
				heightScroll = top.scrollHeight;
				top = top.scrollTop;
			}
			if ((dir === "y" || width >= widthScroll) && (dir === "x" || height >= heightScroll)) {
				return true;
			}
			if (this.mouse) {
				return;
			}
			if ((Math.abs(y) > Math.abs(x) || dir === "y") && dir !== "x") {
				return (y > 0 && !top) || (y < 0 && top + height >= heightScroll);
			}
			return (x > 0 && !left) || (x < 0 && left + width >= widthScroll);
		},
		_aStop: function (e) {
			if (this.aBind) {
				$(this.aStop).unbind(this.on);
				if (e) {
					_stop(e);
				}
			}
			delete this.aStop;
			delete this.aBind;
		},
		_move: function (evt, end) {
			if (!this.evts) {
				return;
			}
			var speed, x, y, arg = { owner: this },
				time = (new Date()).getTime(),
				self = this,
				maxSpeed = 3,
				oldX = self.x0,
				oldY = self.y0,
				speedX = self.speedX,
				speedY = self.speedY,
				oldTop = self.top,
				oldLeft = self.left,
				inBarY = self.inBarY,
				inBarX = self.inBarX,
				barX = self.barX,
				barY = self.barY,
				start = !self.drag,
				elem = self.element,
				touch = _touch(evt, self.mouse),
				src = _src(evt);
			delete self.click;
			if (self.skip) {
				return;
			}
			if (!self.on) {
				elem.css("overflow", "hidden");
				self.on = true;
			}
			if (self.mouse) {
				if (end === "start") {
					if (self._skip()) {
						return;
					}
					self._aStop();
					x = src;
					while (x) {
						if (x.nodeName === "A") {
							break;
						}
						x = (x === elem[0]) ? null : x.parentNode;
					}
					src = src ? src.nodeName : null;
					if (src === "INPUT" || src === "TEXTAREA" || src === "BUTTON" || src === "SELECT") {
						return;
					}
					self.aStop = x;
					$(document).bind(self.md = self.mouse);
				} else if (!self.md) {
					return;
				} else if (end) {
					$(document).unbind(self.mouse);
					delete self.md;
				}
				_stop(evt, end === "start");
			}
			self._clear();
			// request to end scrolling
			if (end || !touch) {
				if (!self.skip && end === "end" && !start) {
					if (self.inBarX || self.inBarY) {
						self._end();
					} else {
						self._inertia();
					}
				}
				delete self.drag;
				return;
			}
			x = touch.pageX;
			y = touch.pageY;
			if (!x && !y) {
				x = touch.x;
				y = touch.y;
				if (!x && !y) {
					x = touch.clientX;
					y = touch.clientY;
				}
			}
			if (start) {
				self.skip = self._skip(x - self.x, y - self.y);
				if (self.skip) {
					self._end();
				}
			} else {
				arg.deltaX = self.x - x;
				arg.deltaY = self.y - y;
			}
			if (self.skip || !this._trigger(start ? "starting" : "scrolling", evt, arg)) {
				return;
			}
			if (start) {
				speed = _valid(barX) || _valid(barY);
				// x
				oldX = self.x0 = x;
				oldLeft = self.left = self._getScroll(true);
				delete self.speedX;
				barX = self._bar(elem, true);
				// check for scrolling inside scrollbar
				inBarX = self.inBarX = _is(barX, src);
				// y
				oldY = self.y0 = y;
				oldTop = self.top = self._getScroll();
				delete self.speedY;
				barY = self._bar(elem);
				// check for scrolling inside scrollbar
				inBarY = self.inBarY = _is(barY, src);
				self._show(speed || inBarX || inBarY);
				if (self.aStop) {
					$(self.aStop).bind(self.aBind = self.on);
				}
			} else {
				x = self.x - arg.deltaX;
				speed = (x - self.x) / (time - self.time);
				if (Math.abs(speed) > maxSpeed) {
					speed = (speed > 0) ? maxSpeed : -maxSpeed;
				}
				if (!speedX) {
					self.speedX = [0, 0, speed];
				} else {
					speedX[0] = speedX[1];
					speedX[1] = speedX[2];
					speedX[2] = speed;
				}
				//
				y = self.y - arg.deltaY;
				speed = (y - self.y) / (time - self.time);
				if (Math.abs(speed) > maxSpeed) {
					speed = (speed > 0) ? maxSpeed : -maxSpeed;
				}
				if (!speedY) {
					self.speedY = [0, 0, speed];
					if (self.dir) {
						self.dir = (Math.abs(speed) >= Math.abs(self.speedX[2])) ? "y" : "x";
					}
				} else {
					speedY = self.speedY = [0, 0, speed];
					speedY[0] = speedY[1];
					speedY[1] = speedY[2];
					speedY[2] = speed;
				}
			}
			self.drag = true;
			self.x = x;
			self.y = y;
			self.time = time;
			_stop(evt);
			x = inBarX ? oldLeft + Math.floor((x - oldX) * self.ratioX) : oldLeft - x + oldX;
			y = inBarY ? oldTop + Math.floor((y - oldY) * self.ratioY) : oldTop - y + oldY;
			self._scroll(x, y);
			this._trigger(start ? "started" : "scrolled", evt);
		},
		destroy: function () {
			if (this.evts) {
				this.element.unbind(this.evts);
				delete this.evts;
				if (this.showing) {
					this.showing.stop(true);
				}
				if (this.hiding) {
					this.hiding.stop(true);
				}
				this._clear();
				_remove(this.barX);
				_remove(this.barY);
				$.Widget.prototype.destroy.apply(this, arguments);
			}
			return this;
		}
	});
	$.extend($.ui.igSbScroll, { version: "15.2.20152.78" });
	/* options which can be customized globally for all instances of igSbScroll. */
	$.ui.igSbScroll.defaults = {
		thumbOpacityDrag: 1,
		thumbOpacity: 0.5,
		animateShowDuration: 300,
		animateHideDuration: 500,
		hideThumbsDelay: 200,
		hideDragThumbsDelay: 1000,
		xInertia: 0.8,
		yInertia: 0.85,
		marginLeft: 2,
		marginRight: 2,
		marginTop: 2,
		marginBottom: 2,
		xThumb: "show",
		yThumb: "show"
	};
	try {
	    $(document).on("pageshow", ":jqmData(role='page')", _find);
	} catch (ex) {
		_find(true);
		$(document).bind('igcontrolcreated', function (event, args) {
			args.owner.scrollContainer().igSbScroll({ _find: true });
		});
	}
}(jQuery));

//Code to automatically make the jquery mobile pages in the scroll containers
//in the samples browser
$(document).delegate("div:jqmData(role='page')", "pageinit", function (e) {

    //Uses element in the HTMLjQueryMobileSample.cshtml View to create scroller
    $(this).igSbScroll({
        eventType: "auto"
    });

    $.mobile.touchOverflowEnabled = true;
    $.support.touchOverflow = true;

    // latest jquery mobile removes height, sets minHeight, sets overflow:hidden, etc.
    // try to get around those new features
    // old codes:
    //$(this).attr("style", "height:460px;width:320px;overflow:hidden;");
    // new codes:
	var me = this, me$ = $(me);
	me$.css("width", "320px").css("overflow", "hidden");
	setTimeout(function () {
		var height = parseFloat(me$.css("minHeight"));
		if (!height || isNaN(height) || height < 100) {
			height = 460;
		}
		me$.css("height", me._height = height + "px");
	}, 300);
	setTimeout(function () {
		if (me._height && me.style && me.style.height !== me._height) {
			me$.css("height", me._height);
		}
    }, 500);
    setTimeout(function () {
		if (me._height && me.style && me.style.height !== me._height) {
			me$.css("height", me._height);
		}
    }, 1000);

    //fixes scrollbar issue in Chrome
    $(":jqmData(role='content')").css("overflow", "hidden");

    $(document).delegate("a.ui-input-clear", "click", function (evnt) {
    	var parent = $(evnt.target).parent();
    	while (parent && !parent.hasClass('ui-input-search'))
    		parent = parent.parent();
    	var input = parent.children('input'), clearbtn = parent.find('.ui-input-clear');
    	/* copied from jQuery Mobile textinput tap handler for clear button */
    	input.val("").focus();
    	input.trigger("change");
    	clearbtn.addClass("ui-input-clear-hidden");
    	evnt.preventDefault();
    });
});