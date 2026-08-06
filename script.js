(function () {
  var cfg = window.VOLTA_EV_PROMO || {};
  var ios = cfg.iosStoreUrl || '#download';
  var android = cfg.androidStoreUrl || '#download';

  function wire(sel, url) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.setAttribute('href', url);
      if (url.indexOf('http') === 0) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  wire('#btn-apple, .js-store-ios', ios);
  wire('#btn-android, .js-store-android', android);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nodes = document.querySelectorAll('.reveal');

  if (nodes.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      nodes.forEach(function (el) {
        el.classList.add('is-in');
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
      );

      nodes.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  if (reduce) return;

  function random(x) {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }

  function noise2D(x, y) {
    var i = Math.floor(x);
    var j = Math.floor(y);
    var fx = x - i;
    var fy = y - j;
    var a = random(i + j * 57);
    var b = random(i + 1 + j * 57);
    var c = random(i + (j + 1) * 57);
    var d = random(i + 1 + (j + 1) * 57);
    var ux = fx * fx * (3.0 - 2.0 * fx);
    var uy = fy * fy * (3.0 - 2.0 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }

  function octavedNoise(x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed, baseFlatness) {
    var y = 0;
    var amplitude = baseAmplitude;
    var frequency = baseFrequency;
    for (var i = 0; i < octaves; i++) {
      var octaveAmplitude = amplitude;
      if (i === 0) octaveAmplitude *= baseFlatness;
      y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= lacunarity;
      amplitude *= gain;
    }
    return y;
  }

  function getCornerPoint(centerX, centerY, radius, startAngle, arcLength, progress) {
    var angle = startAngle + progress * arcLength;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }

  function getRoundedRectPoint(t, left, top, width, height, radius) {
    var straightWidth = width - 2 * radius;
    var straightHeight = height - 2 * radius;
    var cornerArc = (Math.PI * radius) / 2;
    var totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
    var distance = t * totalPerimeter;
    var accumulated = 0;
    var progress;

    if (distance <= accumulated + straightWidth) {
      progress = (distance - accumulated) / straightWidth;
      return { x: left + radius + progress * straightWidth, y: top };
    }
    accumulated += straightWidth;

    if (distance <= accumulated + cornerArc) {
      progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightHeight) {
      progress = (distance - accumulated) / straightHeight;
      return { x: left + width, y: top + radius + progress * straightHeight };
    }
    accumulated += straightHeight;

    if (distance <= accumulated + cornerArc) {
      progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightWidth) {
      progress = (distance - accumulated) / straightWidth;
      return { x: left + width - radius - progress * straightWidth, y: top + height };
    }
    accumulated += straightWidth;

    if (distance <= accumulated + cornerArc) {
      progress = (distance - accumulated) / cornerArc;
      return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress);
    }
    accumulated += cornerArc;

    if (distance <= accumulated + straightHeight) {
      progress = (distance - accumulated) / straightHeight;
      return { x: left, y: top + height - radius - progress * straightHeight };
    }
    accumulated += straightHeight;

    progress = (distance - accumulated) / cornerArc;
    return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress);
  }

  function initElectricBorder(root) {
    var canvas = root.querySelector('.eb-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var color = root.getAttribute('data-color') || '#ffee00';
    var speed = parseFloat(root.getAttribute('data-speed') || '1') || 1;
    var chaos = parseFloat(root.getAttribute('data-chaos') || '0.12') || 0.12;
    var borderRadius = parseFloat(root.getAttribute('data-radius') || '20') || 20;

    var octaves = 10;
    var lacunarity = 1.6;
    var gain = 0.7;
    var amplitude = chaos;
    var frequency = 10;
    var baseFlatness = 0;
    var displacement = window.matchMedia('(max-width: 959px)').matches ? 32 : 48;
    var borderOffset = window.matchMedia('(max-width: 959px)').matches ? 36 : 48;
    var time = 0;
    var lastFrame = 0;
    var lastDpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = { width: 0, height: 0 };

    function updateSize() {
      var rect = root.getBoundingClientRect();
      var width = rect.width + borderOffset * 2;
      var height = rect.height + borderOffset * 2;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      return { width: width, height: height };
    }

    size = updateSize();

    function draw(currentTime) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (dpr !== lastDpr) {
        lastDpr = dpr;
        size = updateSize();
      }

      var delta = (currentTime - lastFrame) / 1000;
      if (!isFinite(delta) || delta < 0) delta = 0;
      time += delta * speed;
      lastFrame = currentTime;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      var left = borderOffset;
      var top = borderOffset;
      var borderWidth = size.width - 2 * borderOffset;
      var borderHeight = size.height - 2 * borderOffset;
      var maxRadius = Math.min(borderWidth, borderHeight) / 2;
      var radius = Math.min(borderRadius, maxRadius);
      var approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      var sampleCount = Math.floor(approximatePerimeter / 2);

      ctx.beginPath();
      for (var i = 0; i <= sampleCount; i++) {
        var progress = i / sampleCount;
        var point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);
        var xNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, time, 0, baseFlatness);
        var yNoise = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, time, 1, baseFlatness);
        var dx = point.x + xNoise * displacement;
        var dy = point.y + yNoise * displacement;
        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function () {
        size = updateSize();
      }).observe(root);
    }

    requestAnimationFrame(draw);
  }

  document.querySelectorAll('[data-electric-border]').forEach(function (el) {
    if (window.matchMedia('(max-width: 959px)').matches) {
      el.setAttribute('data-chaos', '0.08');
    }
    initElectricBorder(el);
  });
})();
