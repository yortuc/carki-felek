function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
  var len = str.length, s;

  context.save();

  context.font = '20pt arial';
  context.textAlign = 'center';
  context.fillStyle = 'blue';
  context.strokeStyle = 'black';
  context.lineWidth = 1;

  context.translate(centerX, centerY);
  context.rotate(-1 * angle / 2);
  context.rotate(-1 * (angle / len) / 2);

  for (var n = 0; n < len; n++) {
    context.rotate(angle / len);
    context.save();
    context.translate(0, -1 * radius);
    s = str[n];
    context.fillText(s, 0, 0);
    context.restore();
  }
  context.restore();
}

export default drawTextAlongArc;

// draw circle underneath text
//context.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI, false);
//context.stroke();