/* =========================================================
   demos.js, demonstrações interativas em <canvas>
   Nenhuma dependência externa e nenhuma imagem remota: a cena
   de teste é desenhada proceduralmente, o que evita problemas
   de CORS ao ler os pixels com getImageData().
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- utilidades de DOM ---------------- */

  function h(tag, props) {
    var n = document.createElement(tag), k;
    if (props) {
      for (k in props) {
        if (k === "class") n.className = props[k];
        else if (k === "html") n.innerHTML = props[k];
        else if (k === "text") n.textContent = props[k];
        else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), props[k]);
        else n.setAttribute(k, props[k]);
      }
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return n;
  }

  function shell(host, title) {
    host.innerHTML = "";
    host.appendChild(
      h("div", { class: "demo-head" },
        h("h4", { text: title }),
        h("span", { class: "badge-demo", text: "interativo" }))
    );
    var body = h("div", { class: "demo-body" });
    host.appendChild(body);
    return body;
  }

  function canvasBox(w, hh, caption, displayW, smooth) {
    var c = h("canvas", { width: w, height: hh });
    if (smooth) c.className = "smooth";
    if (displayW) { c.style.width = displayW + "px"; c.style.height = "auto"; }
    var fig = h("figure", null, c);
    if (caption) fig.appendChild(h("figcaption", { text: caption }));
    return { canvas: c, fig: fig, ctx: c.getContext("2d", { willReadFrequently: true }) };
  }

  function range(label, min, max, step, value, fmt, oninput) {
    var out = h("span", { class: "val", text: fmt(value) });
    var inp = h("input", { type: "range", min: min, max: max, step: step, value: value });
    inp.addEventListener("input", function () {
      out.textContent = fmt(parseFloat(inp.value));
      oninput(parseFloat(inp.value));
    });
    return { wrap: h("div", { class: "ctl" }, h("label", null, document.createTextNode(label), out), inp), input: inp };
  }

  function select(label, opts, value, onchange) {
    var sel = h("select");
    opts.forEach(function (o) {
      var op = h("option", { value: o[0], text: o[1] });
      if (o[0] === value) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener("change", function () { onchange(sel.value); });
    return { wrap: h("div", { class: "ctl" }, h("label", null, document.createTextNode(label)), sel), input: sel };
  }

  function check(label, checked, onchange) {
    var inp = h("input", { type: "checkbox" });
    inp.checked = checked;
    inp.addEventListener("change", function () { onchange(inp.checked); });
    return { wrap: h("label", { class: "ctl-check" }, inp, document.createTextNode(label)), input: inp };
  }

  function controls() {
    var box = h("div", { class: "demo-controls" });
    for (var i = 0; i < arguments.length; i++) box.appendChild(arguments[i]);
    return box;
  }

  function note(txt) { return h("p", { class: "demo-note", text: txt }); }

  /* ---------------- ciclo de vida das animações ---------------- */

  var stoppers = [];
  function animate(fn) {
    var id, alive = true;
    var step = function (t) { if (!alive) return; fn(t); id = requestAnimationFrame(step); };
    id = requestAnimationFrame(step);
    stoppers.push(function () { alive = false; cancelAnimationFrame(id); });
  }

  /* ---------------- cena sintética de teste ---------------- */

  function drawScene(ctx, W, H) {
    var i, x, y;
    // céu
    var sky = ctx.createLinearGradient(0, 0, 0, H * 0.66);
    sky.addColorStop(0, "#2f6fb5"); sky.addColorStop(0.6, "#8fc4ee"); sky.addColorStop(1, "#dbeefb");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.66);

    // sol com halo
    var sun = ctx.createRadialGradient(W * 0.78, H * 0.2, 2, W * 0.78, H * 0.2, H * 0.22);
    sun.addColorStop(0, "#fffbe8"); sun.addColorStop(0.25, "#ffe27a"); sun.addColorStop(1, "rgba(255,226,122,0)");
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.2, H * 0.22, 0, 6.2832); ctx.fill();

    // montanhas ao fundo
    ctx.fillStyle = "#6f7fa8";
    ctx.beginPath(); ctx.moveTo(-10, H * 0.66);
    ctx.lineTo(W * 0.16, H * 0.30); ctx.lineTo(W * 0.33, H * 0.66);
    ctx.lineTo(W * 0.44, H * 0.40); ctx.lineTo(W * 0.62, H * 0.66);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e9f2fa"; // neve
    ctx.beginPath(); ctx.moveTo(W * 0.16, H * 0.30); ctx.lineTo(W * 0.115, H * 0.40);
    ctx.lineTo(W * 0.145, H * 0.385); ctx.lineTo(W * 0.175, H * 0.42); ctx.lineTo(W * 0.205, H * 0.40);
    ctx.closePath(); ctx.fill();

    // solo
    var gnd = ctx.createLinearGradient(0, H * 0.6, 0, H);
    gnd.addColorStop(0, "#3f7a45"); gnd.addColorStop(1, "#8fae4e");
    ctx.fillStyle = gnd; ctx.fillRect(0, H * 0.64, W, H * 0.36);

    // casa: bordas retas e cantos, bons para detecção de bordas
    var bx = W * 0.10, by = H * 0.50, bw = W * 0.22, bh = H * 0.26;
    ctx.fillStyle = "#efe7d8"; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#a8443a";
    ctx.beginPath(); ctx.moveTo(bx - bw * 0.10, by); ctx.lineTo(bx + bw * 0.5, by - bh * 0.42);
    ctx.lineTo(bx + bw * 1.10, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2b4a7a";
    ctx.fillRect(bx + bw * 0.14, by + bh * 0.18, bw * 0.24, bh * 0.26);
    ctx.fillRect(bx + bw * 0.60, by + bh * 0.18, bw * 0.24, bh * 0.26);
    ctx.fillStyle = "#6b4a2e"; ctx.fillRect(bx + bw * 0.40, by + bh * 0.52, bw * 0.20, bh * 0.48);

    // carta de resolução: barras com frequência crescente
    var cx0 = W * 0.62, cy0 = H * 0.70, cw = W * 0.30, ch = H * 0.18;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(cx0, cy0, cw, ch);
    ctx.fillStyle = "#101018";
    var px = cx0 + 2;
    for (i = 0; i < 26 && px < cx0 + cw - 2; i++) {
      var bwid = Math.max(1, (7 - i * 0.24));
      ctx.fillRect(px, cy0 + 2, bwid, ch - 4);
      px += bwid * 2;
    }

    // padrão radial (zone plate): revela aliasing com clareza
    var zr = Math.min(W, H) * 0.15, zx = W * 0.44, zy = H * 0.80;
    var img = ctx.getImageData(zx - zr, zy - zr, zr * 2, zr * 2);
    var d = img.data, n = zr * 2;
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        var dx = x - zr, dy = y - zr, r2 = dx * dx + dy * dy;
        if (r2 > zr * zr) continue;
        var v = 128 + 120 * Math.cos(r2 * 0.055);
        var o = (y * n + x) * 4;
        d[o] = d[o + 1] = d[o + 2] = v; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, zx - zr, zy - zr);

    // textura granular no gramado
    var gimg = ctx.getImageData(0, H * 0.86, W, H * 0.14), gd = gimg.data;
    for (i = 0; i < gd.length; i += 4) {
      var t = (Math.random() - 0.5) * 34;
      gd[i] += t; gd[i + 1] += t; gd[i + 2] += t;
    }
    ctx.putImageData(gimg, 0, H * 0.86);
  }

  function sourceImage(W, H) {
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var ctx = c.getContext("2d", { willReadFrequently: true });
    drawScene(ctx, W, H);
    return ctx.getImageData(0, 0, W, H);
  }

  /* ---------------- utilidades de imagem ---------------- */

  function clone(img) {
    return new ImageData(new Uint8ClampedArray(img.data), img.width, img.height);
  }
  function clamp8(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

  function toGray(img) {
    var d = img.data, g = new Float32Array(img.width * img.height);
    for (var i = 0, p = 0; i < d.length; i += 4, p++) {
      g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    return g;
  }
  function grayToImage(g, w, hh, map) {
    var img = new ImageData(w, hh), d = img.data;
    for (var p = 0; p < g.length; p++) {
      var o = p * 4;
      if (map) { var c = map(g[p]); d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; }
      else { var v = clamp8(g[p]); d[o] = d[o + 1] = d[o + 2] = v; }
      d[o + 3] = 255;
    }
    return img;
  }

  function addNoise(img, kind, amount) {
    var d = img.data, i;
    if (kind === "gauss") {
      for (i = 0; i < d.length; i += 4) {
        var n = (Math.random() + Math.random() + Math.random() - 1.5) * amount;
        d[i] = clamp8(d[i] + n); d[i + 1] = clamp8(d[i + 1] + n); d[i + 2] = clamp8(d[i + 2] + n);
      }
    } else if (kind === "sal") {
      var prob = amount / 255 * 0.35;
      for (i = 0; i < d.length; i += 4) {
        var r = Math.random();
        if (r < prob) { d[i] = d[i + 1] = d[i + 2] = 0; }
        else if (r > 1 - prob) { d[i] = d[i + 1] = d[i + 2] = 255; }
      }
    }
    return img;
  }

  // convolução por canal, com réplica de borda (clamp)
  function convolveRGB(img, kernel, k, bias) {
    var w = img.width, hh = img.height, src = img.data;
    var out = new ImageData(w, hh), dst = out.data, r = (k - 1) / 2;
    for (var y = 0; y < hh; y++) {
      for (var x = 0; x < w; x++) {
        var a0 = 0, a1 = 0, a2 = 0;
        for (var j = -r; j <= r; j++) {
          var sy = Math.min(hh - 1, Math.max(0, y + j));
          for (var i = -r; i <= r; i++) {
            var sx = Math.min(w - 1, Math.max(0, x + i));
            var wgt = kernel[(j + r) * k + (i + r)];
            if (wgt === 0) continue;
            var o = (sy * w + sx) * 4;
            a0 += src[o] * wgt; a1 += src[o + 1] * wgt; a2 += src[o + 2] * wgt;
          }
        }
        var q = (y * w + x) * 4;
        dst[q] = clamp8(a0 + bias); dst[q + 1] = clamp8(a1 + bias); dst[q + 2] = clamp8(a2 + bias); dst[q + 3] = 255;
      }
    }
    return out;
  }

  function medianFilter(img) {
    var w = img.width, hh = img.height, src = img.data;
    var out = new ImageData(w, hh), dst = out.data;
    var buf = new Array(9);
    for (var y = 0; y < hh; y++) {
      for (var x = 0; x < w; x++) {
        for (var ch = 0; ch < 3; ch++) {
          var n = 0;
          for (var j = -1; j <= 1; j++) {
            var sy = Math.min(hh - 1, Math.max(0, y + j));
            for (var i = -1; i <= 1; i++) {
              var sx = Math.min(w - 1, Math.max(0, x + i));
              buf[n++] = src[(sy * w + sx) * 4 + ch];
            }
          }
          buf.sort(function (a, b) { return a - b; });
          dst[(y * w + x) * 4 + ch] = buf[4];
        }
        dst[(y * w + x) * 4 + 3] = 255;
      }
    }
    return out;
  }

  function gauss(k, sigma) {
    var m = new Float32Array(k * k), r = (k - 1) / 2, sum = 0, i, j;
    for (j = -r; j <= r; j++) for (i = -r; i <= r; i++) {
      var v = Math.exp(-(i * i + j * j) / (2 * sigma * sigma));
      m[(j + r) * k + (i + r)] = v; sum += v;
    }
    for (i = 0; i < m.length; i++) m[i] /= sum;
    return m;
  }

  /* =========================================================
     DEMO 1, amostragem e quantização
     ========================================================= */
  var D = {};

  D.amostragem = function (host) {
    var body = shell(host, "Amostragem espacial × quantização de intensidade");
    var W = 320, H = 200;
    var src = sourceImage(W, H);
    var a = canvasBox(W, H, "original, 320 × 200, 256 níveis", 320);
    var b = canvasBox(W, H, "reamostrada e quantizada", 320);
    a.ctx.putImageData(src, 0, 0);

    var st = { res: 96, levels: 12, smooth: false };
    var tmp = document.createElement("canvas");

    function render() {
      var nw = Math.max(2, Math.round(st.res)), nh = Math.max(2, Math.round(st.res * H / W));
      tmp.width = nw; tmp.height = nh;
      var tctx = tmp.getContext("2d", { willReadFrequently: true });
      tctx.imageSmoothingEnabled = false;
      // amostragem: pega o pixel mais próximo, sem filtro anti-aliasing
      var small = tctx.createImageData(nw, nh), sd = small.data, d = src.data;
      for (var y = 0; y < nh; y++) {
        for (var x = 0; x < nw; x++) {
          var sx = Math.min(W - 1, Math.floor(x * W / nw));
          var sy = Math.min(H - 1, Math.floor(y * H / nh));
          var o = (sy * W + sx) * 4, q = (y * nw + x) * 4;
          sd[q] = d[o]; sd[q + 1] = d[o + 1]; sd[q + 2] = d[o + 2]; sd[q + 3] = 255;
        }
      }
      // quantização
      var L = Math.round(st.levels), step = 255 / (L - 1);
      for (var i = 0; i < sd.length; i += 4) {
        sd[i] = Math.round(sd[i] / step) * step;
        sd[i + 1] = Math.round(sd[i + 1] / step) * step;
        sd[i + 2] = Math.round(sd[i + 2] / step) * step;
      }
      tctx.putImageData(small, 0, 0);
      b.ctx.imageSmoothingEnabled = st.smooth;
      b.ctx.clearRect(0, 0, W, H);
      b.ctx.drawImage(tmp, 0, 0, nw, nh, 0, 0, W, H);
      b.fig.querySelector("figcaption").textContent =
        nw + " × " + nh + " px · " + L + " níveis · " + (st.res * st.res * H / W / 1000).toFixed(1) + " kpx";
    }

    var r1 = range("Resolução espacial", 4, 320, 1, st.res, function (v) { return Math.round(v) + " col."; }, function (v) { st.res = v; render(); });
    var r2 = range("Níveis de quantização", 2, 256, 1, st.levels, function (v) { return Math.round(v) + ""; }, function (v) { st.levels = v; render(); });
    var c1 = check("Interpolar na exibição", false, function (v) { st.smooth = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, a.fig, b.fig));
    body.appendChild(controls(r1.wrap, r2.wrap, c1.wrap));
    body.appendChild(note("Observe o padrão radial e a carta de barras: ao reduzir a resolução, as listras finas não " +
      "desaparecem, viram padrões falsos (aliasing). Já o céu quebra em faixas quando os níveis caem abaixo de ~32 (banding). " +
      "Leve os dois controles ao máximo para recuperar exatamente a imagem original."));
    render();
  };

  /* =========================================================
     DEMO 2, convolução
     ========================================================= */

  var KERNELS = {
    identidade: { k: 3, m: [0, 0, 0, 0, 1, 0, 0, 0, 0], bias: 0 },
    media: { k: 3, m: [1, 1, 1, 1, 1, 1, 1, 1, 1].map(function (v) { return v / 9; }), bias: 0 },
    gauss3: { k: 3, m: [1, 2, 1, 2, 4, 2, 1, 2, 1].map(function (v) { return v / 16; }), bias: 0 },
    gauss5: { k: 5, m: gauss(5, 1.2), bias: 0 },
    sharpen: { k: 3, m: [0, -1, 0, -1, 5, -1, 0, -1, 0], bias: 0 },
    laplaciano: { k: 3, m: [0, -1, 0, -1, 4, -1, 0, -1, 0], bias: 128 },
    sobelx: { k: 3, m: [-1, 0, 1, -2, 0, 2, -1, 0, 1], bias: 128 },
    sobely: { k: 3, m: [-1, -2, -1, 0, 0, 0, 1, 2, 1], bias: 128 },
    emboss: { k: 3, m: [-2, -1, 0, -1, 1, 1, 0, 1, 2], bias: 0 },
    mediana: { k: 3, m: null, bias: 0 }
  };

  D.convolucao = function (host) {
    var body = shell(host, "Bancada de filtros: troque o kernel e observe");
    var W = 300, H = 190;
    var base = sourceImage(W, H);
    var a = canvasBox(W, H, "entrada", 300);
    var b = canvasBox(W, H, "saída", 300);
    var kbox = h("div", { class: "kernel-grid" });
    var st = { kernel: "gauss3", noise: "nenhum", amount: 26 };

    function currentInput() {
      var img = clone(base);
      if (st.noise !== "nenhum") addNoise(img, st.noise, st.amount);
      return img;
    }

    function showKernel() {
      kbox.innerHTML = "";
      var kk = KERNELS[st.kernel];
      if (!kk.m) {
        kbox.style.gridTemplateColumns = "1fr";
        kbox.appendChild(h("span", { text: "mediana 3×3, não linear, sem pesos" }));
        return;
      }
      kbox.style.gridTemplateColumns = "repeat(" + kk.k + ", 52px)";
      for (var i = 0; i < kk.m.length; i++) {
        var v = kk.m[i];
        var txt = Math.abs(v) < 0.0005 ? "0" : (Number.isInteger(v) ? String(v) : v.toFixed(3));
        kbox.appendChild(h("span", { text: txt }));
      }
    }

    function render() {
      var input = currentInput();
      a.ctx.putImageData(input, 0, 0);
      var kk = KERNELS[st.kernel];
      var out = kk.m ? convolveRGB(input, kk.m, kk.k, kk.bias) : medianFilter(input);
      b.ctx.putImageData(out, 0, 0);
      showKernel();
    }

    var s1 = select("Kernel", [
      ["identidade", "Identidade (nada muda)"],
      ["media", "Média 3×3 (box blur)"],
      ["gauss3", "Gaussiano 3×3"],
      ["gauss5", "Gaussiano 5×5 (σ = 1,2)"],
      ["mediana", "Mediana 3×3 (não linear)"],
      ["sharpen", "Aguçamento (sharpen)"],
      ["laplaciano", "Laplaciano"],
      ["sobelx", "Sobel horizontal (Gx)"],
      ["sobely", "Sobel vertical (Gy)"],
      ["emboss", "Emboss (relevo)"]
    ], st.kernel, function (v) { st.kernel = v; render(); });

    var s2 = select("Ruído na entrada", [
      ["nenhum", "Sem ruído"],
      ["gauss", "Gaussiano (aditivo)"],
      ["sal", "Sal e pimenta (impulsivo)"]
    ], st.noise, function (v) { st.noise = v; render(); });

    var r1 = range("Intensidade do ruído", 4, 90, 1, st.amount, function (v) { return Math.round(v) + ""; }, function (v) { st.amount = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, a.fig, b.fig));
    body.appendChild(h("div", { style: "text-align:center;margin-top:1rem" },
      h("div", { class: "muted", style: "font-size:.78rem", text: "kernel aplicado" }), kbox));
    body.appendChild(controls(s1.wrap, s2.wrap, r1.wrap));
    body.appendChild(note("Teste decisivo: ative sal e pimenta e compare média 3×3 com mediana 3×3. A média espalha " +
      "cada ponto defeituoso pelos vizinhos; a mediana simplesmente o descarta, preservando as bordas."));
    render();
  };

  /* =========================================================
     DEMO 3, domínio da frequência (DFT 2D)
     ========================================================= */

  function twiddle(n, inv) {
    var cos = new Float32Array(n * n), sin = new Float32Array(n * n);
    for (var k = 0; k < n; k++) {
      for (var x = 0; x < n; x++) {
        var ang = 2 * Math.PI * k * x / n * (inv ? 1 : -1);
        cos[k * n + x] = Math.cos(ang); sin[k * n + x] = Math.sin(ang);
      }
    }
    return { c: cos, s: sin };
  }

  // DFT 2D separável sobre matriz n×n (re/im em Float32Array de n*n)
  function dft2(re, im, n, tw) {
    var tr = new Float32Array(n * n), ti = new Float32Array(n * n), x, y, k;
    for (y = 0; y < n; y++) {              // linhas
      for (k = 0; k < n; k++) {
        var sr = 0, si = 0;
        for (x = 0; x < n; x++) {
          var c = tw.c[k * n + x], s = tw.s[k * n + x];
          var vr = re[y * n + x], vi = im[y * n + x];
          sr += vr * c - vi * s; si += vr * s + vi * c;
        }
        tr[y * n + k] = sr; ti[y * n + k] = si;
      }
    }
    for (x = 0; x < n; x++) {              // colunas
      for (k = 0; k < n; k++) {
        var sr2 = 0, si2 = 0;
        for (y = 0; y < n; y++) {
          var c2 = tw.c[k * n + y], s2 = tw.s[k * n + y];
          var vr2 = tr[y * n + x], vi2 = ti[y * n + x];
          sr2 += vr2 * c2 - vi2 * s2; si2 += vr2 * s2 + vi2 * c2;
        }
        re[k * n + x] = sr2; im[k * n + x] = si2;
      }
    }
  }

  D.frequencia = function (host) {
    var body = shell(host, "Transformada de Fourier: filtrar apagando frequências");
    var N = 64;
    var big = sourceImage(N * 4, N * 4);
    // reduz para N×N com média de blocos (evita aliasing na própria demo)
    var g0 = new Float32Array(N * N), gb = toGray(big), BW = N * 4;
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var acc = 0;
      for (var j = 0; j < 4; j++) for (var i = 0; i < 4; i++) acc += gb[(y * 4 + j) * BW + x * 4 + i];
      g0[y * N + x] = acc / 16;
    }

    var TWF = twiddle(N, false), TWI = twiddle(N, true);
    var RE0 = new Float32Array(N * N), IM0 = new Float32Array(N * N);
    RE0.set(g0); dft2(RE0, IM0, N, TWF);

    var cIn = canvasBox(N, N, "entrada 64 × 64", 168);
    var cSp = canvasBox(N, N, "espectro (log |F|) + máscara", 168);
    var cOut = canvasBox(N, N, "reconstrução", 168);
    cIn.ctx.putImageData(grayToImage(g0, N, N), 0, 0);

    var st = { type: "baixa", radius: 12, shape: "gauss" };

    function response(d) {   // d = distância ao centro, em pixels do espectro
      var r = st.radius, v;
      if (st.shape === "ideal") v = d <= r ? 1 : 0;
      else if (st.shape === "gauss") v = Math.exp(-(d * d) / (2 * r * r));
      else v = 1 / (1 + Math.pow(d / Math.max(0.5, r), 4));   // Butterworth ordem 2
      if (st.type === "alta") v = 1 - v;
      if (st.type === "banda") {
        var inner = st.shape === "ideal" ? (d <= r * 0.45 ? 1 : 0) : Math.exp(-(d * d) / (2 * (r * 0.45) * (r * 0.45)));
        v = (st.shape === "ideal" ? (d <= r ? 1 : 0) : Math.exp(-(d * d) / (2 * r * r))) - inner;
        if (v < 0) v = 0;
      }
      return v;
    }

    function render() {
      var re = new Float32Array(N * N), im = new Float32Array(N * N);
      var spec = new Float32Array(N * N), maxLog = 0, u, v2, i;
      for (v2 = 0; v2 < N; v2++) {
        for (u = 0; u < N; u++) {
          var du = Math.min(u, N - u), dv = Math.min(v2, N - v2);
          var d = Math.sqrt(du * du + dv * dv);
          var Hf = response(d);
          i = v2 * N + u;
          re[i] = RE0[i] * Hf; im[i] = IM0[i] * Hf;
          // espectro deslocado para o centro, escala log
          var su = (u + N / 2) % N, sv = (v2 + N / 2) % N;
          var mag = Math.log(1 + Math.sqrt(RE0[i] * RE0[i] + IM0[i] * IM0[i]));
          spec[sv * N + su] = mag * (0.25 + 0.75 * Hf);
          if (mag > maxLog) maxLog = mag;
        }
      }
      var sImg = new ImageData(N, N), sd = sImg.data;
      for (i = 0; i < N * N; i++) {
        var t = spec[i] / maxLog;
        var o = i * 4;
        sd[o] = clamp8(255 * Math.pow(t, 0.85) * 0.75 + 20);
        sd[o + 1] = clamp8(255 * Math.pow(t, 1.1) * 0.9);
        sd[o + 2] = clamp8(255 * Math.pow(t, 1.4) + 30);
        sd[o + 3] = 255;
      }
      cSp.ctx.putImageData(sImg, 0, 0);

      dft2(re, im, N, TWI);
      var out = new Float32Array(N * N);
      var offset = st.type === "baixa" ? 0 : 128;   // passa-alta oscila em torno de zero
      for (i = 0; i < N * N; i++) out[i] = re[i] / (N * N) + offset;
      cOut.ctx.putImageData(grayToImage(out, N, N), 0, 0);
    }

    var s1 = select("Tipo de filtro", [["baixa", "Passa-baixa"], ["alta", "Passa-alta"], ["banda", "Passa-banda"]],
      st.type, function (v) { st.type = v; render(); });
    var s2 = select("Formato do corte", [["gauss", "Gaussiano (sem ringing)"], ["butter", "Butterworth"], ["ideal", "Ideal (degrau)"]],
      st.shape, function (v) { st.shape = v; render(); });
    var r1 = range("Frequência de corte", 1, 32, 1, st.radius, function (v) { return Math.round(v) + " ciclos"; },
      function (v) { st.radius = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, cIn.fig, cSp.fig, cOut.fig));
    body.appendChild(controls(s1.wrap, s2.wrap, r1.wrap));
    body.appendChild(note("O espectro está com a componente contínua no centro. Escolha o corte ideal com raio pequeno " +
      "e procure as ondulações em torno das bordas, é o ringing previsto pela função sinc."));
    render();
  };

  /* =========================================================
     DEMO 4, detecção de bordas
     ========================================================= */

  D.bordas = function (host) {
    var body = shell(host, "Operadores de gradiente e limiarização");
    var W = 300, H = 190;
    var base = sourceImage(W, H);
    var a = canvasBox(W, H, "entrada", 300);
    var b = canvasBox(W, H, "bordas", 300);

    var OPS = {
      sobel: { gx: [-1, 0, 1, -2, 0, 2, -1, 0, 1], gy: [-1, -2, -1, 0, 0, 0, 1, 2, 1] },
      prewitt: { gx: [-1, 0, 1, -1, 0, 1, -1, 0, 1], gy: [-1, -1, -1, 0, 0, 0, 1, 1, 1] },
      roberts: { gx: [0, 0, 0, 0, 1, 0, 0, 0, -1], gy: [0, 0, 0, 0, 0, 1, 0, -1, 0] },
      laplaciano: { gx: [0, -1, 0, -1, 4, -1, 0, -1, 0], gy: null }
    };
    var st = { op: "sobel", thr: 60, blur: true, noise: false, view: "mag" };

    function conv(g, w, hh, k) {
      var out = new Float32Array(w * hh);
      for (var y = 0; y < hh; y++) for (var x = 0; x < w; x++) {
        var acc = 0;
        for (var j = -1; j <= 1; j++) {
          var sy = Math.min(hh - 1, Math.max(0, y + j));
          for (var i = -1; i <= 1; i++) {
            var sx = Math.min(w - 1, Math.max(0, x + i));
            acc += g[sy * w + sx] * k[(j + 1) * 3 + (i + 1)];
          }
        }
        out[y * w + x] = acc;
      }
      return out;
    }

    function render() {
      var input = clone(base);
      if (st.noise) addNoise(input, "gauss", 28);
      a.ctx.putImageData(input, 0, 0);

      var g = toGray(input);
      if (st.blur) g = conv(g, W, H, [1 / 16, 2 / 16, 1 / 16, 2 / 16, 4 / 16, 2 / 16, 1 / 16, 2 / 16, 1 / 16]);

      var op = OPS[st.op];
      var gx = conv(g, W, H, op.gx);
      var gy = op.gy ? conv(g, W, H, op.gy) : null;
      var out = new Float32Array(W * H), i;

      if (st.view === "dir" && gy) {
        var img = new ImageData(W, H), d = img.data;
        for (i = 0; i < W * H; i++) {
          var mag = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
          var ang = (Math.atan2(gy[i], gx[i]) + Math.PI) / (2 * Math.PI);
          var rgb = hsvToRgb(ang * 360, 1, Math.min(1, mag / 140));
          var o = i * 4;
          d[o] = rgb[0]; d[o + 1] = rgb[1]; d[o + 2] = rgb[2]; d[o + 3] = 255;
        }
        b.ctx.putImageData(img, 0, 0);
        return;
      }
      for (i = 0; i < W * H; i++) {
        var val;
        if (!gy) val = Math.abs(gx[i]);
        else if (st.view === "gx") val = Math.abs(gx[i]);
        else if (st.view === "gy") val = Math.abs(gy[i]);
        else val = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i]);
        out[i] = st.view === "bin" ? (val >= st.thr ? 255 : 0) : Math.min(255, val);
      }
      b.ctx.putImageData(grayToImage(out, W, H), 0, 0);
    }

    var s1 = select("Operador", [["sobel", "Sobel 3×3"], ["prewitt", "Prewitt 3×3"], ["roberts", "Roberts (cruzado)"], ["laplaciano", "Laplaciano (2ª derivada)"]],
      st.op, function (v) { st.op = v; render(); });
    var s2 = select("Visualização", [["mag", "Magnitude |∇f|"], ["bin", "Binária (limiar)"], ["gx", "Somente Gx"], ["gy", "Somente Gy"], ["dir", "Direção (matiz = ângulo)"]],
      st.view, function (v) { st.view = v; render(); });
    var r1 = range("Limiar", 5, 200, 1, st.thr, function (v) { return Math.round(v) + ""; }, function (v) { st.thr = v; render(); });
    var c1 = check("Suavizar antes (gaussiano)", true, function (v) { st.blur = v; render(); });
    var c2 = check("Adicionar ruído", false, function (v) { st.noise = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, a.fig, b.fig));
    body.appendChild(controls(s1.wrap, s2.wrap, r1.wrap, c1.wrap, c2.wrap));
    body.appendChild(note("Ligue o ruído e desligue a suavização: o gradiente responde ao ruído com a mesma força com " +
      "que responde às bordas reais. Na visualização por direção, a cor codifica o ângulo do gradiente e o brilho, sua magnitude."));
    render();
  };

  /* =========================================================
     DEMO 5, transformações geométricas
     ========================================================= */

  D.transformacoes = function (host) {
    var body = shell(host, "Composição de transformações em coordenadas homogêneas");
    var W = 460, H = 300;
    var box = canvasBox(W, H, null, 460, true);
    var mv = h("div", { class: "matrix-view" });
    var st = { ang: 25, sx: 1.2, sy: 0.9, shx: 0, tx: 40, ty: -10, order: "TRS" };

    function mul(A, B) {
      var C = new Array(9);
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
        C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
      }
      return C;
    }
    function matrix() {
      var a = st.ang * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
      var T = [1, 0, st.tx, 0, 1, st.ty, 0, 0, 1];
      var R = [co, -si, 0, si, co, 0, 0, 0, 1];
      var S = [st.sx, 0, 0, 0, st.sy, 0, 0, 0, 1];
      var H2 = [1, st.shx, 0, 0, 1, 0, 0, 0, 1];
      return st.order === "TRS" ? mul(mul(mul(T, R), H2), S) : mul(mul(mul(S, H2), R), T);
    }

    var SHAPE = [[-45, -30], [45, -30], [45, 20], [0, 55], [-45, 20]];
    var HOLE = [[-18, -14], [12, -14], [12, 6], [-18, 6]];

    function apply(M, p) {
      return [M[0] * p[0] + M[1] * p[1] + M[2], M[3] * p[0] + M[4] * p[1] + M[5]];
    }

    function poly(ctx, pts, M, cx, cy) {
      ctx.beginPath();
      pts.forEach(function (p, i) {
        var q = M ? apply(M, p) : p;
        var x = cx + q[0], y = cy - q[1];
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
    }

    function render() {
      var ctx = box.ctx, cx = W / 2, cy = H / 2, M = matrix();
      var css = getComputedStyle(document.body);
      var ink = css.getPropertyValue("--ink").trim() || "#111";
      var line = css.getPropertyValue("--line").trim() || "#ddd";
      var acc = css.getPropertyValue("--accent").trim() || "#4f46e5";
      var faint = css.getPropertyValue("--ink-faint").trim() || "#888";

      ctx.clearRect(0, 0, W, H);
      // grade transformada
      ctx.strokeStyle = line; ctx.lineWidth = 1;
      for (var gx = -6; gx <= 6; gx++) {
        ctx.beginPath();
        for (var t = -6; t <= 6; t++) {
          var p = apply(M, [gx * 25, t * 25]);
          if (t === -6) ctx.moveTo(cx + p[0], cy - p[1]); else ctx.lineTo(cx + p[0], cy - p[1]);
        }
        ctx.stroke();
        ctx.beginPath();
        for (var t2 = -6; t2 <= 6; t2++) {
          var p2 = apply(M, [t2 * 25, gx * 25]);
          if (t2 === -6) ctx.moveTo(cx + p2[0], cy - p2[1]); else ctx.lineTo(cx + p2[0], cy - p2[1]);
        }
        ctx.stroke();
      }
      // eixos
      ctx.strokeStyle = faint; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

      // figura original tracejada
      ctx.setLineDash([5, 4]); ctx.strokeStyle = faint; ctx.lineWidth = 1.4;
      poly(ctx, SHAPE, null, cx, cy); ctx.stroke();
      ctx.setLineDash([]);

      // figura transformada
      poly(ctx, SHAPE, M, cx, cy);
      ctx.fillStyle = acc + "33"; ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
      poly(ctx, HOLE, M, cx, cy);
      ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.stroke();

      // vetores base transformados
      ["#e11d48", "#0891b2"].forEach(function (col, idx) {
        var v = apply(M, idx === 0 ? [60, 0] : [0, 60]);
        var o = apply(M, [0, 0]);
        ctx.strokeStyle = col; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(cx + o[0], cy - o[1]); ctx.lineTo(cx + v[0], cy - v[1]); ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(cx + v[0], cy - v[1], 3.5, 0, 6.2832); ctx.fill();
      });

      var f = function (v) { return (v >= 0 ? " " : "") + v.toFixed(3); };
      mv.textContent =
        "M = [" + f(M[0]) + "  " + f(M[1]) + "  " + f(M[2]) + " ]\n" +
        "    [" + f(M[3]) + "  " + f(M[4]) + "  " + f(M[5]) + " ]\n" +
        "    [" + f(M[6]) + "  " + f(M[7]) + "  " + f(M[8]) + " ]\n\n" +
        "det = " + (M[0] * M[4] - M[1] * M[3]).toFixed(3) + "   (fator de área)";
    }

    var r1 = range("Rotação θ", -180, 180, 1, st.ang, function (v) { return v + "°"; }, function (v) { st.ang = v; render(); });
    var r2 = range("Escala X", 0.2, 2.5, 0.05, st.sx, function (v) { return v.toFixed(2); }, function (v) { st.sx = v; render(); });
    var r3 = range("Escala Y", 0.2, 2.5, 0.05, st.sy, function (v) { return v.toFixed(2); }, function (v) { st.sy = v; render(); });
    var r4 = range("Cisalhamento X", -1.2, 1.2, 0.05, st.shx, function (v) { return v.toFixed(2); }, function (v) { st.shx = v; render(); });
    var r5 = range("Translação X", -140, 140, 1, st.tx, function (v) { return v + " px"; }, function (v) { st.tx = v; render(); });
    var r6 = range("Translação Y", -110, 110, 1, st.ty, function (v) { return v + " px"; }, function (v) { st.ty = v; render(); });
    var s1 = select("Ordem da composição", [["TRS", "T · R · H · S"], ["SRT", "S · H · R · T"]], st.order,
      function (v) { st.order = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, box.fig));
    body.appendChild(mv);
    body.appendChild(controls(r1.wrap, r2.wrap, r3.wrap, r4.wrap, r5.wrap, r6.wrap, s1.wrap));
    body.appendChild(note("Deixe uma translação diferente de zero e alterne a ordem da composição: as mesmas " +
      "transformações, em ordem trocada, levam a figura para outro lugar. O determinante mostra quanto a área foi multiplicada."));
    render();
    host._redraw = render;   // redesenha ao trocar o tema
  };

  /* =========================================================
     DEMO 6, modelo de câmera pinhole
     ========================================================= */

  D.camera = function (host) {
    var body = shell(host, "Projeção perspectiva: distância focal × distância do objeto");
    var W = 440, H = 280;
    var side = canvasBox(W, H, "esquema lateral (vista de cima)", 440, true);
    var view = canvasBox(300, H, "imagem projetada", 300, true);
    var st = { f: 35, dist: 400, dolly: true, baseSize: 0 };

    // cena: um objeto de 100 unidades e três postes ao fundo
    function project(X, Z, f, sensorW, imgW) {
      return imgW / 2 + (f * X / Z) * (imgW / sensorW);
    }

    function render() {
      var f = st.f, dist = st.dist;
      var sctx = side.ctx, css = getComputedStyle(document.body);
      var ink = css.getPropertyValue("--ink").trim() || "#111";
      var line = css.getPropertyValue("--line-strong").trim() || "#ccc";
      var acc = css.getPropertyValue("--accent").trim() || "#4f46e5";
      var cy = css.getPropertyValue("--cyan").trim() || "#0891b2";
      var faint = css.getPropertyValue("--ink-faint").trim() || "#888";

      sctx.clearRect(0, 0, W, H);
      sctx.font = "11px system-ui, sans-serif";
      // O esquema é desenhado em escala própria, mas mantendo a geometria coerente:
      // a altura da imagem é derivada das distâncias em pixels, como no mundo real.
      var mid = H / 2, camX = 250;
      var fpx = 22 + (f - 14) / 186 * 116;                       // f do diagrama: 22 a 138 px
      var planeX = camX - fpx;
      var objX = 320 + 110 * Math.sqrt((dist - 80) / 1120);      // 320 a 430 px
      var objHalf = 46;
      var imgHalf = fpx * objHalf / (objX - camX);

      // eixo óptico
      sctx.strokeStyle = line; sctx.setLineDash([4, 4]); sctx.lineWidth = 1;
      sctx.beginPath(); sctx.moveTo(planeX - 20, mid); sctx.lineTo(W - 6, mid); sctx.stroke();
      sctx.setLineDash([]);

      // raios principais: objeto → centro óptico → plano (invertido)
      sctx.strokeStyle = acc + "99"; sctx.lineWidth = 1.3;
      [[-1, 1], [1, -1]].forEach(function (s) {
        sctx.beginPath();
        sctx.moveTo(objX, mid + s[0] * objHalf);
        sctx.lineTo(planeX, mid + s[1] * imgHalf);
        sctx.stroke();
      });

      // plano de imagem
      sctx.strokeStyle = cy; sctx.lineWidth = 2.5;
      sctx.beginPath(); sctx.moveTo(planeX, mid - 62); sctx.lineTo(planeX, mid + 62); sctx.stroke();
      sctx.fillStyle = faint;
      sctx.fillText("plano de imagem", Math.max(4, planeX - 44), mid - 72);

      // imagem formada (invertida) — cor própria para não se confundir com o plano
      sctx.fillStyle = "#f472b6";
      sctx.fillText("imagem invertida", Math.max(4, planeX - 46), mid + 78);
      sctx.strokeStyle = "#f472b6"; sctx.lineWidth = 6;
      sctx.beginPath(); sctx.moveTo(planeX, mid - imgHalf); sctx.lineTo(planeX, mid + imgHalf); sctx.stroke();

      // centro óptico
      sctx.fillStyle = ink;
      sctx.beginPath(); sctx.arc(camX, mid, 4.5, 0, 6.2832); sctx.fill();
      sctx.fillStyle = faint;
      sctx.fillText("centro óptico", camX - 34, mid - 14);

      // objeto
      sctx.strokeStyle = acc; sctx.lineWidth = 4;
      sctx.beginPath(); sctx.moveTo(objX, mid + objHalf); sctx.lineTo(objX, mid - objHalf); sctx.stroke();
      sctx.fillStyle = acc;
      sctx.beginPath();
      sctx.moveTo(objX, mid - objHalf - 10); sctx.lineTo(objX - 6, mid - objHalf + 4);
      sctx.lineTo(objX + 6, mid - objHalf + 4); sctx.closePath(); sctx.fill();
      sctx.fillText("objeto", objX - 16, mid + objHalf + 18);

      // cotas de f (acima) e Z (abaixo)
      sctx.strokeStyle = faint; sctx.lineWidth = 1;
      sctx.beginPath();
      sctx.moveTo(planeX, 52); sctx.lineTo(camX, 52);
      sctx.moveTo(planeX, 46); sctx.lineTo(planeX, 58);
      sctx.moveTo(camX, 46); sctx.lineTo(camX, 58);
      sctx.moveTo(camX, H - 34); sctx.lineTo(objX, H - 34);
      sctx.moveTo(camX, H - 40); sctx.lineTo(camX, H - 28);
      sctx.moveTo(objX, H - 40); sctx.lineTo(objX, H - 28);
      sctx.stroke();
      sctx.fillStyle = faint;
      sctx.fillText("f = " + f.toFixed(0) + " mm", (planeX + camX) / 2 - 26, 42);
      sctx.fillText("Z = " + dist.toFixed(0) + " cm", (camX + objX) / 2 - 28, H - 42);

      // imagem resultante
      var v = view.ctx, VW = 300;
      v.clearRect(0, 0, VW, H);
      var bg = v.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#20304f"); bg.addColorStop(1, "#4b6a92");
      v.fillStyle = bg; v.fillRect(0, 0, VW, H);
      v.fillStyle = "#2f5a38"; v.fillRect(0, H * 0.72, VW, H * 0.28);

      var sensorW = 36;   // mm (full frame)
      // postes de fundo, em Z fixo
      [-260, -120, 120, 260, 420].forEach(function (X, i) {
        var Zb = 1400;
        var x = project(X, Zb, f, sensorW, VW);
        var hgt = f * 180 / Zb * (VW / sensorW);
        v.fillStyle = i % 2 ? "#8fa4c4" : "#7b90b3";
        v.fillRect(x - 4, H * 0.72 - hgt, 8, hgt);
      });
      // objeto principal em Z = dist
      var Zo = dist * 3.2;
      var ow = f * 90 / Zo * (VW / sensorW);
      var oh = f * 150 / Zo * (VW / sensorW);
      v.fillStyle = acc;
      v.fillRect(VW / 2 - ow / 2, H * 0.72 - oh, ow, oh);
      v.fillStyle = "#ffffffcc";
      v.fillRect(VW / 2 - ow * 0.22, H * 0.72 - oh * 0.75, ow * 0.44, oh * 0.3);
      v.fillStyle = "#ffffff"; v.font = "11px system-ui, sans-serif";
      v.fillText("altura na imagem: " + oh.toFixed(0) + " px", 8, 16);
      v.fillText("campo de visão: " + (2 * Math.atan(sensorW / (2 * f)) * 180 / Math.PI).toFixed(0) + "°", 8, 32);
    }

    var r1, r2;
    r1 = range("Distância focal", 14, 200, 1, st.f, function (v) { return v + " mm"; }, function (v) {
      if (st.dolly) { st.dist = st.dist * (v / st.f); r2.input.value = st.dist; r2.wrap.querySelector(".val").textContent = Math.round(st.dist) + " cm"; }
      st.f = v; render();
    });
    r2 = range("Distância da câmera", 80, 1200, 1, st.dist, function (v) { return Math.round(v) + " cm"; },
      function (v) { st.dist = v; render(); });
    var c1 = check("Dolly zoom (manter o tamanho do objeto)", true, function (v) { st.dolly = v; });

    body.appendChild(h("div", { class: "demo-canvases" }, side.fig, view.fig));
    body.appendChild(controls(r1.wrap, r2.wrap, c1.wrap));
    body.appendChild(note("Com o dolly zoom ligado, o objeto principal mantém o tamanho enquanto os postes ao fundo " +
      "crescem ou encolhem: a perspectiva depende da posição da câmera, não da distância focal. Desligue e a mudança " +
      "vira um simples enquadramento."));
    render();
    host._redraw = render;
  };

  /* =========================================================
     DEMO 7, cor: RGB × HSV
     ========================================================= */

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, hh = 0;
    if (d !== 0) {
      if (mx === r) hh = 60 * (((g - b) / d) % 6);
      else if (mx === g) hh = 60 * ((b - r) / d + 2);
      else hh = 60 * ((r - g) / d + 4);
    }
    if (hh < 0) hh += 360;
    return [hh, mx === 0 ? 0 : d / mx, mx];
  }
  function hsvToRgb(hd, s, v) {
    var c = v * s, x = c * (1 - Math.abs(((hd / 60) % 2) - 1)), m = v - c, r = 0, g = 0, b = 0;
    if (hd < 60) { r = c; g = x; } else if (hd < 120) { r = x; g = c; }
    else if (hd < 180) { g = c; b = x; } else if (hd < 240) { g = x; b = c; }
    else if (hd < 300) { r = x; b = c; } else { r = c; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  D.cores = function (host) {
    var body = shell(host, "Decomposição em canais e manipulação em HSV");
    var W = 300, H = 190;
    var base = sourceImage(W, H);
    var a = canvasBox(W, H, "original", 300);
    var b = canvasBox(W, H, "resultado", 300);
    var st = { hue: 0, sat: 1, val: 1, view: "rgb" };

    function render() {
      var out = clone(base), d = out.data;
      for (var i = 0; i < d.length; i += 4) {
        var hsv = rgbToHsv(d[i], d[i + 1], d[i + 2]);
        var hd = (hsv[0] + st.hue + 360) % 360;
        var s = Math.min(1, hsv[1] * st.sat);
        var v = Math.min(1, hsv[2] * st.val);
        var c;
        switch (st.view) {
          case "r": c = [d[i], 0, 0]; break;
          case "g": c = [0, d[i + 1], 0]; break;
          case "b": c = [0, 0, d[i + 2]]; break;
          case "h": c = hsvToRgb(hd, 1, hsv[1] > 0.08 ? 1 : 0.15); break;
          case "s": c = [s * 255, s * 255, s * 255]; break;
          case "v": c = [v * 255, v * 255, v * 255]; break;
          case "gray": var y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; c = [y, y, y]; break;
          default: c = hsvToRgb(hd, s, v);
        }
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
      }
      b.ctx.putImageData(out, 0, 0);
    }

    a.ctx.putImageData(base, 0, 0);
    var s1 = select("Visualização", [
      ["rgb", "Imagem completa"], ["r", "Canal R"], ["g", "Canal G"], ["b", "Canal B"],
      ["h", "Matiz (H)"], ["s", "Saturação (S)"], ["v", "Valor (V)"], ["gray", "Luminância (0,299R + 0,587G + 0,114B)"]
    ], st.view, function (v) { st.view = v; render(); });
    var r1 = range("Rotação de matiz", -180, 180, 1, 0, function (v) { return v + "°"; }, function (v) { st.hue = v; render(); });
    var r2 = range("Saturação", 0, 2.5, 0.05, 1, function (v) { return "×" + v.toFixed(2); }, function (v) { st.sat = v; render(); });
    var r3 = range("Valor (brilho)", 0.2, 2, 0.05, 1, function (v) { return "×" + v.toFixed(2); }, function (v) { st.val = v; render(); });

    body.appendChild(h("div", { class: "demo-canvases" }, a.fig, b.fig));
    body.appendChild(controls(s1.wrap, r1.wrap, r2.wrap, r3.wrap));
    body.appendChild(note("Zere a saturação e observe o canal de matiz: onde a cor é quase cinza, o matiz vira ruído, " +
      "por isso segmentação por H sempre vem acompanhada de um piso mínimo de saturação."));
    render();
  };

  /* =========================================================
     DEMO 8, pipeline gráfico (rasterizador em software)
     ========================================================= */

  function sphereMesh(stacks, slices) {
    var pos = [], tris = [], i, j;
    for (i = 0; i <= stacks; i++) {
      var phi = Math.PI * i / stacks;
      for (j = 0; j <= slices; j++) {
        var th = 2 * Math.PI * j / slices;
        pos.push([Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)]);
      }
    }
    for (i = 0; i < stacks; i++) {
      for (j = 0; j < slices; j++) {
        var a = i * (slices + 1) + j, b = a + slices + 1;
        tris.push([a, b, a + 1]); tris.push([a + 1, b, b + 1]);
      }
    }
    return { pos: pos, tris: tris };
  }

  D.pipeline = function (host) {
    var body = shell(host, "Rasterizador em software: MVP, culling, z-buffer e sombreamento");
    var W = 420, H = 300;
    var box = canvasBox(W, H, null, 420, true);
    var mesh = sphereMesh(18, 26);
    var st = { mode: "gouraud", fov: 50, light: 35, cull: true, zbuf: true, spin: true, ang: 0.6 };
    var stats = h("div", { class: "matrix-view" });
    var img = box.ctx.createImageData(W, H);
    var zbuf = new Float32Array(W * H);

    // A câmera olha na direção +z, então o hemisfério visível tem normal com nz < 0
    // e o vetor que aponta para o observador é (0, 0, -1).
    function shade(nx, ny, nz) {
      var la = st.light * Math.PI / 180;
      var lx = Math.sin(la), ly = 0.5, lz = -Math.cos(la);
      var len = Math.sqrt(lx * lx + ly * ly + lz * lz);
      lx /= len; ly /= len; lz /= len;
      var diff = Math.max(0, nx * lx + ny * ly + nz * lz);
      // Blinn-Phong: vetor meio-caminho entre a luz e o observador
      var hx = lx, hy = ly, hz = lz - 1;
      var hl = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
      var spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 28);
      return 0.16 + 0.72 * diff + 0.55 * spec;     // ambiente + difuso + especular
    }

    function tri(d, v0, v1, v2, i0, i1, i2, col) {
      var minx = Math.max(0, Math.floor(Math.min(v0[0], v1[0], v2[0])));
      var maxx = Math.min(W - 1, Math.ceil(Math.max(v0[0], v1[0], v2[0])));
      var miny = Math.max(0, Math.floor(Math.min(v0[1], v1[1], v2[1])));
      var maxy = Math.min(H - 1, Math.ceil(Math.max(v0[1], v1[1], v2[1])));
      var area = (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v2[0] - v0[0]) * (v1[1] - v0[1]);
      if (area === 0) return;
      for (var y = miny; y <= maxy; y++) {
        for (var x = minx; x <= maxx; x++) {
          var px = x + 0.5, py = y + 0.5;
          var w0 = ((v1[0] - v0[0]) * (py - v0[1]) - (px - v0[0]) * (v1[1] - v0[1])) / area;
          var w1 = ((px - v0[0]) * (v2[1] - v0[1]) - (v2[0] - v0[0]) * (py - v0[1])) / area;
          var w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          var z = w2 * v0[2] + w1 * v1[2] + w0 * v2[2];
          var idx = y * W + x;
          if (st.zbuf && z >= zbuf[idx]) continue;
          zbuf[idx] = z;
          var inten = w2 * i0 + w1 * i1 + w0 * i2;
          var o = idx * 4;
          d[o] = clamp8(col[0] * inten); d[o + 1] = clamp8(col[1] * inten); d[o + 2] = clamp8(col[2] * inten); d[o + 3] = 255;
        }
      }
    }

    var last = performance.now(), ms = 0, drawn = 0;

    function frame(t) {
      if (st.spin) st.ang += 0.012;
      var t0 = performance.now();
      var d = img.data, i;
      for (i = 0; i < d.length; i += 4) { d[i] = 16; d[i + 1] = 20; d[i + 2] = 40; d[i + 3] = 255; }
      for (i = 0; i < zbuf.length; i++) zbuf[i] = Infinity;

      var ca = Math.cos(st.ang), sa = Math.sin(st.ang);
      var tilt = 0.35, ct = Math.cos(tilt), stl = Math.sin(tilt);
      var f = (H / 2) / Math.tan(st.fov * Math.PI / 360);
      var camZ = 3.4;

      var P = [], N = [], p, k;
      for (k = 0; k < mesh.pos.length; k++) {
        p = mesh.pos[k];
        // rotação Y depois X (matriz de modelo)
        var x1 = p[0] * ca + p[2] * sa, z1 = -p[0] * sa + p[2] * ca, y1 = p[1];
        var y2 = y1 * ct - z1 * stl, z2 = y1 * stl + z1 * ct;
        N.push([x1, y2, z2]);
        var zc = z2 + camZ;                    // espaço da câmera
        P.push([W / 2 + f * x1 / zc, H / 2 - f * y2 / zc, zc]);
      }

      drawn = 0;
      var col = [124, 150, 255];
      for (k = 0; k < mesh.tris.length; k++) {
        var T = mesh.tris[k], a = P[T[0]], b = P[T[1]], c = P[T[2]];
        var area = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
        if (st.cull && area >= 0) continue;    // back-face culling por sinal de área
        drawn++;
        var na = N[T[0]], nb = N[T[1]], nc = N[T[2]];
        if (st.mode === "wire") {
          continue;
        } else if (st.mode === "flat") {
          var fx = (na[0] + nb[0] + nc[0]) / 3, fy = (na[1] + nb[1] + nc[1]) / 3, fz = (na[2] + nb[2] + nc[2]) / 3;
          var L = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1;
          var ii = shade(fx / L, fy / L, fz / L);
          tri(d, a, b, c, ii, ii, ii, col);
        } else {
          tri(d, a, b, c, shade(na[0], na[1], na[2]), shade(nb[0], nb[1], nb[2]), shade(nc[0], nc[1], nc[2]), col);
        }
      }
      box.ctx.putImageData(img, 0, 0);

      if (st.mode === "wire") {
        var ctx = box.ctx;
        ctx.strokeStyle = "rgba(140,170,255,.85)"; ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (k = 0; k < mesh.tris.length; k++) {
          var T2 = mesh.tris[k], a2 = P[T2[0]], b2 = P[T2[1]], c2 = P[T2[2]];
          var ar = (b2[0] - a2[0]) * (c2[1] - a2[1]) - (c2[0] - a2[0]) * (b2[1] - a2[1]);
          if (st.cull && ar >= 0) continue;
          ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(c2[0], c2[1]); ctx.closePath();
        }
        ctx.stroke();
      }

      ms = ms * 0.9 + (performance.now() - t0) * 0.1;
      if (t - last > 200) {
        last = t;
        stats.textContent =
          "vértices enviados : " + mesh.pos.length + "\n" +
          "triângulos totais : " + mesh.tris.length + "\n" +
          "após back-face    : " + drawn + (st.cull ? "  (" + Math.round(100 - drawn / mesh.tris.length * 100) + "% descartados)" : "") + "\n" +
          "tempo por quadro  : " + ms.toFixed(1) + " ms   (CPU, sem GPU)";
      }
    }

    var s1 = select("Sombreamento", [["gouraud", "Gouraud (por vértice)"], ["flat", "Flat (por face)"], ["wire", "Wireframe"]],
      st.mode, function (v) { st.mode = v; });
    var r1 = range("Campo de visão", 20, 110, 1, st.fov, function (v) { return v + "°"; }, function (v) { st.fov = v; });
    var r2 = range("Ângulo da luz", 0, 360, 1, st.light, function (v) { return v + "°"; }, function (v) { st.light = v; });
    var c1 = check("Back-face culling", true, function (v) { st.cull = v; });
    var c2 = check("Z-buffer", true, function (v) { st.zbuf = v; });
    var c3 = check("Girar", true, function (v) { st.spin = v; });

    body.appendChild(h("div", { class: "demo-canvases" }, box.fig));
    body.appendChild(stats);
    body.appendChild(controls(s1.wrap, r1.wrap, r2.wrap, c1.wrap, c2.wrap, c3.wrap));
    body.appendChild(note("Desligue o z-buffer para ver faces de trás sendo desenhadas por cima das da frente; " +
      "desligue o culling e note o número de triângulos processados saltar para a malha inteira, sem nenhum ganho visual."));
    animate(frame);
  };

  /* =========================================================
     DEMO 9, limiarização e histograma
     ========================================================= */

  function ctSlice(W, H) {
    var img = new ImageData(W, H), d = img.data;
    var blobs = [
      { x: 0.50, y: 0.50, r: 0.40, v: 95 },
      { x: 0.36, y: 0.42, r: 0.15, v: 150 },
      { x: 0.63, y: 0.45, r: 0.16, v: 145 },
      { x: 0.50, y: 0.68, r: 0.12, v: 60 },
      { x: 0.60, y: 0.62, r: 0.055, v: 225 }   // "lesão" de alta densidade
    ];
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var u = x / W, v = y / H, val = 12;
        for (var i = 0; i < blobs.length; i++) {
          var b = blobs[i], dx = (u - b.x) * 1.15, dy = v - b.y;
          var dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < b.r) val = Math.max(val, b.v * (1 - 0.25 * Math.pow(dd / b.r, 6)));
        }
        val += (Math.random() - 0.5) * 16;
        var o = (y * W + x) * 4;
        d[o] = d[o + 1] = d[o + 2] = clamp8(val); d[o + 3] = 255;
      }
    }
    return img;
  }

  function otsu(hist, total) {
    var sum = 0, i;
    for (i = 0; i < 256; i++) sum += i * hist[i];
    var sumB = 0, wB = 0, best = 0, thr = 0;
    for (i = 0; i < 256; i++) {
      wB += hist[i]; if (wB === 0) continue;
      var wF = total - wB; if (wF === 0) break;
      sumB += i * hist[i];
      var mB = sumB / wB, mF = (sum - sumB) / wF;
      var between = wB * wF * (mB - mF) * (mB - mF);
      if (between > best) { best = between; thr = i; }
    }
    return thr;
  }

  D.limiar = function (host) {
    var body = shell(host, "Limiarização de um corte simulado: onde fica o valor certo?");
    var W = 240, H = 200;
    var base = ctSlice(W, H);
    var a = canvasBox(W, H, "corte simulado", 240);
    var b = canvasBox(W, H, "segmentação sobreposta", 240);
    var hcv = canvasBox(256, 90, "histograma e limiar", 256, true);
    var st = { thr: 120, blur: false };
    var readout = h("p", { class: "demo-note" });

    function current() {
      var img = clone(base);
      if (st.blur) img = convolveRGB(img, gauss(5, 1.4), 5, 0);
      return img;
    }

    function render() {
      var img = current();
      a.ctx.putImageData(img, 0, 0);
      var g = toGray(img), i;
      var hist = new Uint32Array(256);
      for (i = 0; i < g.length; i++) hist[Math.max(0, Math.min(255, Math.round(g[i])))]++;

      var over = new ImageData(W, H), d = over.data, count = 0;
      for (i = 0; i < g.length; i++) {
        var on = g[i] >= st.thr;
        if (on) count++;
        var v = clamp8(g[i]), o = i * 4;
        d[o] = on ? clamp8(v * 0.35 + 210) : v;
        d[o + 1] = on ? clamp8(v * 0.35 + 40) : v;
        d[o + 2] = on ? clamp8(v * 0.35 + 90) : v;
        d[o + 3] = 255;
      }
      b.ctx.putImageData(over, 0, 0);

      // histograma
      var hc = hcv.ctx, mx = 0;
      for (i = 0; i < 256; i++) if (hist[i] > mx) mx = hist[i];
      var css = getComputedStyle(document.body);
      hc.clearRect(0, 0, 256, 90);
      hc.fillStyle = css.getPropertyValue("--ink-faint").trim() || "#888";
      for (i = 0; i < 256; i++) {
        var hgt = Math.pow(hist[i] / mx, 0.55) * 84;
        hc.fillRect(i, 90 - hgt, 1, hgt);
      }
      hc.strokeStyle = css.getPropertyValue("--accent").trim() || "#4f46e5";
      hc.lineWidth = 2;
      hc.beginPath(); hc.moveTo(st.thr, 0); hc.lineTo(st.thr, 90); hc.stroke();

      var auto = otsu(hist, g.length);
      readout.textContent = "Área segmentada: " + (count / g.length * 100).toFixed(1) + "% da imagem  ·  " +
        "limiar atual: " + Math.round(st.thr) + "  ·  limiar automático de Otsu: " + auto;
    }

    var r1 = range("Limiar", 0, 255, 1, st.thr, function (v) { return Math.round(v) + ""; }, function (v) { st.thr = v; render(); });
    var c1 = check("Suavizar antes (reduz ruído)", false, function (v) { st.blur = v; render(); });
    var btn = h("button", { class: "chip", type: "button", text: "Aplicar limiar de Otsu" });
    btn.addEventListener("click", function () {
      var g = toGray(current()), hist = new Uint32Array(256);
      for (var i = 0; i < g.length; i++) hist[Math.max(0, Math.min(255, Math.round(g[i])))]++;
      st.thr = otsu(hist, g.length);
      r1.input.value = st.thr;
      r1.wrap.querySelector(".val").textContent = st.thr + "";
      render();
    });

    body.appendChild(h("div", { class: "demo-canvases" }, a.fig, b.fig, hcv.fig));
    body.appendChild(controls(r1.wrap, c1.wrap, h("div", { class: "ctl" }, btn)));
    body.appendChild(readout);
    body.appendChild(note("A estrutura clara à direita do centro simula uma lesão de alta densidade. Percorra o limiar " +
      "devagar: o volume medido muda de forma contínua, sem nenhum ponto que se destaque como o correto, e é esse " +
      "volume que entraria em um laudo. Repare no valor de Otsu: ele separa o par de classes mais dominante do " +
      "histograma (fundo × tecido), que não é a separação clinicamente relevante — automatizar o limiar não " +
      "dispensa decidir qual pergunta ele deve responder."));
    render();
    host._redraw = render;
  };

  /* ---------------- API pública ---------------- */

  window.Demos = {
    mount: function (root) {
      var nodes = root.querySelectorAll(".demo[data-demo]");
      Array.prototype.forEach.call(nodes, function (node) {
        var name = node.getAttribute("data-demo");
        if (!D[name]) { node.innerHTML = '<div class="demo-body muted">Demonstração indisponível.</div>'; return; }
        try {
          D[name](node);
        } catch (e) {
          node.innerHTML = '<div class="demo-body muted">Não foi possível carregar esta demonstração neste navegador.</div>';
          if (window.console) console.error("Demo " + name + ":", e);
        }
      });
    },
    dispose: function () {
      stoppers.forEach(function (f) { f(); });
      stoppers = [];
    },
    // redesenha as demos que dependem das cores do tema
    refreshTheme: function (root) {
      Array.prototype.forEach.call(root.querySelectorAll(".demo"), function (n) {
        if (typeof n._redraw === "function") n._redraw();
      });
    }
  };
})();
