function GridModalLoadingIndicator(grid) {
	var modalBackground = $("<div class='ui-widget-overlay ui-iggrid-blockarea' style='position: absolute; display: none; width: 100%; height: 100%;'></div>").appendTo(grid.igGrid("container"));
	function _show() {
		modalBackground.show();
		grid.data("igGrid")._loadingIndicator.show();
	}
	function _hide() {
		modalBackground.hide();
		grid.data("igGrid")._loadingIndicator.hide();
	}
	return {
		show: _show,
		hide: _hide
	}
}