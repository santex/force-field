var R = 200,
    xoff = 50,
    yoff = 50;

var vis = d3.select("#vis")
    .on("mousewheel", blockScroll)
    .on("DOMMouseScroll", blockScroll)
  .append("svg")
    .attr("width", "100%")
    .attr("height", 500)
    .attr("pointer-events", "all")
    .call(d3.behavior.zoom()
      .on("zoom", redraw))
    .append("g");

vis.append("circle")
    .attr("class", "line")
    .attr("cx", R + xoff)
    .attr("cy", R + yoff)
    .attr("r", R)

for (var s=1.5; s<=576; s*=2) {
  for (var q1=0; q1<2*Math.PI; q1+=Math.PI/s) {
    var q2 = q1 + Math.PI/s;
    drawLine(q1, q2);
  }
}

function redraw() {
  vis
    .attr("transform",
      "translate(" + d3.event.translate + ")"
      + "scale(" + d3.event.scale + ")")
    .style("stroke-width", 1/d3.event.scale);
}

function drawArc(x1, y1, x2, y2, r1, r2) {
  vis.append("path")
    .attr("class", "line")
    .attr("d", "M" + x1 + "," + y1 + " " +
        "A" + r1 + "," + r2 + " 0 0,1 " +
        x2 + "," + y2);
}

function drawLine(q1, q2) {
  var f = (q2 - q1) / 2,
      dq = Math.abs(f),
      r = R * Math.tan(dq),
      rp = Math.sqrt(r * r + R * R),
      cx = xoff + R + rp * Math.cos(q1 + f),
      cy = yoff + R + rp * Math.sin(q1 + f),
      beta = Math.PI - dq * 2,
      k = Math.PI / 2 + q2;
  drawArc(cx + r * Math.cos(k), cy + r * Math.sin(k),
          cx + r * Math.cos(k + beta), cy + r * Math.sin(k + beta),
          r, r);
}

function blockScroll() { d3.event.preventDefault(); }
