/* =========================================================
   app.js, roteador por hash, renderização e interações
   O hash mantém URLs compartilháveis e funciona no GitHub
   Pages sem nenhuma configuração de servidor.

   Rotas:
     #/                      página inicial
     #/artigos               lista completa (aceita ?q=busca)
     #/topicos               índice de tópicos
     #/topico/<id>           artigos de um tópico
     #/tag/<tag>             artigos com uma etiqueta
     #/trilha                ordem sugerida de leitura
     #/sobre                 sobre o blog e bibliografia
     #/post/<slug>           artigo
     #/post/<slug>~<secao>   artigo, rolando até uma seção
   ========================================================= */
(function () {
  "use strict";

  var app = document.getElementById("conteudo");
  var POSTS = window.POSTS;
  // Rascunhos (draft: true em js/posts.js) ficam fora de listagens, navegação e rotas.
  // Para publicar um artigo, basta remover a linha draft do objeto correspondente.
  var PUB = POSTS.filter(function (p) { return !p.draft; });
  var TOPICS = window.TOPICS;
  var SITE = window.SITE;

  var byDate = PUB.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });

  /* ---------------- utilidades ---------------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  function fmtDate(iso) {
    var p = iso.split("-");
    return parseInt(p[2], 10) + " de " + MESES[parseInt(p[1], 10) - 1] + " de " + p[0];
  }
  function fmtShort(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function plainText(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || "";
  }

  function readingTime(post) {
    var words = plainText(post.body).trim().split(/\s+/).length;
    return Math.max(3, Math.round(words / 200));
  }

  function topicName(id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i].name;
    return id;
  }

  function postIndex(slug) {
    for (var i = 0; i < PUB.length; i++) if (PUB[i].slug === slug) return i;
    return -1;
  }

  /* ---------------- blocos reutilizáveis ---------------- */

  function cardHTML(post, featured) {
    var demo = post.demo ? '<span class="badge-demo">demo</span>' : "";
    return '' +
      '<a class="card' + (featured ? " featured" : "") + '" href="#/post/' + post.slug + '">' +
        '<div class="card-thumb"><img src="' + post.image + '" alt="' + esc(post.alt) + '" loading="lazy"></div>' +
        '<div class="card-body">' +
          '<span class="kicker">' + esc(topicName(post.topic)) + '</span>' +
          '<h3>' + esc(post.title) + '</h3>' +
          '<p>' + esc(post.lead) + '</p>' +
          '<div class="meta">' +
            '<time datetime="' + post.date + '">' + fmtShort(post.date) + '</time>' +
            '<span class="dot"></span><span>' + readingTime(post) + ' min de leitura</span>' +
            (demo ? '<span class="dot"></span>' + demo : "") +
          '</div>' +
        '</div>' +
      '</a>';
  }

  function gridHTML(list, msg) {
    if (!list.length) {
      return '<div class="empty"><h2>' + (msg || "Nada encontrado") + "</h2>" +
        '<p>Volte para <a href="#/artigos">todos os artigos</a>.</p></div>';
    }
    return '<div class="card-grid">' + list.map(function (p) { return cardHTML(p); }).join("") + "</div>";
  }

  function pageHead(title, desc) {
    return '<section class="page-head"><div class="wrap"><h1>' + esc(title) + "</h1><p>" + desc + "</p></div></section>";
  }

  /* ---------------- páginas ---------------- */

  function viewHome() {
    if (!byDate.length) {
      return '<div class="empty"><h2>Nenhum artigo publicado ainda</h2>' +
        "<p>Os textos entram ao longo do semestre.</p></div>";
    }
    var latest = byDate[0];
    var rest = byDate.slice(1, 7);
    var demos = PUB.filter(function (p) { return p.demo; }).length;

    return '' +
    '<section class="hero"><div class="wrap hero-inner">' +
      '<div>' +
        '<span class="eyebrow">Computação Visual</span>' +
        "<h1>" + esc(SITE.tagline) + "</h1>" +
        '<p class="lead">' + esc(SITE.description) + "</p>" +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary" href="#/post/' + PUB[0].slug + '">' +
            (PUB.length > 1 ? "Começar pelo primeiro artigo" : "Ler o artigo") + "</a>" +
          '<a class="btn btn-ghost" href="#/trilha">Ver a trilha completa</a>' +
        "</div>" +
        '<div class="hero-stats">' +
          "<div><b>" + PUB.length + "</b>" + (PUB.length === 1 ? "artigo publicado" : "artigos publicados") + "</div>" +
          "<div><b>" + demos + "</b>" + (demos === 1 ? "demonstração interativa" : "demonstrações interativas") + "</div>" +
          "<div><b>" + TOPICS.length + "</b>eixos do conteúdo</div>" +
        "</div>" +
      "</div>" +
      '<div class="hero-art"><img src="assets/img/hero.svg" alt="Composição visual com grade de pixels, espectro de cores e projeção geométrica"></div>' +
    "</div></section>" +

    '<section class="section"><div class="wrap">' +
      '<div class="section-head"><div><h2>Último artigo</h2><p>Publicado em ' + fmtDate(latest.date) + "</p></div></div>" +
      cardHTML(latest, true) +
    "</div></section>" +

    (rest.length ?
      '<section class="section" style="padding-top:0"><div class="wrap">' +
        '<div class="section-head"><div><h2>Publicações anteriores</h2><p>Cada artigo traz uma demonstração que roda no seu navegador</p></div>' +
        '<a class="btn btn-ghost" href="#/artigos">Ver todos</a></div>' +
        gridHTML(rest) +
      "</div></section>" : "") +

    '<section class="section" style="padding-top:0"><div class="wrap">' +
      '<div class="section-head"><div><h2>Navegue por eixo</h2><p>Os cinco blocos do conteúdo programático, mais um sobre aplicações</p></div></div>' +
      '<div class="topic-grid">' +
        TOPICS.map(function (t) {
          var n = PUB.filter(function (p) { return p.topic === t.id; }).length;
          var corpo = "<b>" + esc(t.name) + "</b><span>" + esc(t.desc) + " · " +
                      (n ? n + (n === 1 ? " artigo" : " artigos") : "em breve") + "</span>";
          return n
            ? '<a class="topic-card" href="#/topico/' + t.id + '">' + corpo + "</a>"
            : '<div class="topic-card is-empty">' + corpo + "</div>";
        }).join("") +
      "</div>" +
    "</div></section>";
  }

  function viewArtigos(query) {
    var q = (query.q || "").toLowerCase().trim();
    var list = byDate.filter(function (p) {
      if (!q) return true;
      return (p.title + " " + p.lead + " " + p.tags.join(" ") + " " + plainText(p.body)).toLowerCase().indexOf(q) >= 0;
    });

    var tags = {};
    PUB.forEach(function (p) { p.tags.forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
    var tagKeys = Object.keys(tags).sort();

    return pageHead("Todos os artigos",
      (byDate.length === 1
        ? "Por enquanto há um artigo publicado; os demais entram ao longo do semestre. "
        : byDate.length + " textos publicados ao longo do semestre, do sinal contínuo até a imagem sintetizada. ") +
      "A busca percorre o texto completo de cada um.") +
    '<section class="section"><div class="wrap">' +
      '<div class="section-head">' +
        "<div><h2>" + list.length + (list.length === 1 ? " artigo" : " artigos") +
        (q ? ' para "' + esc(q) + '"' : "") + "</h2>" +
        '<p>Ordenados do mais recente para o mais antigo</p></div>' +
        '<div class="searchbar">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
          '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>' +
          '<input type="search" id="q" placeholder="Buscar nos artigos…" value="' + esc(query.q || "") + '" aria-label="Buscar nos artigos">' +
        "</div>" +
      "</div>" +
      gridHTML(list) +
      '<div style="margin-top:2.4rem">' +
        '<div class="section-head"><div><h2 style="font-size:1.1rem">Etiquetas</h2></div></div>' +
        '<div class="tag-list">' + tagKeys.map(function (t) {
          return '<a class="tag" href="#/tag/' + encodeURIComponent(t) + '">' + esc(t) + " · " + tags[t] + "</a>";
        }).join("") + "</div>" +
      "</div>" +
    "</div></section>";
  }

  function viewTopicos() {
    return pageHead("Tópicos",
      "O conteúdo programático da disciplina, reorganizado em eixos. Cada eixo reúne os artigos que o cobrem.") +
    '<section class="section"><div class="wrap stack-lg">' +
      TOPICS.map(function (t) {
        var list = PUB.filter(function (p) { return p.topic === t.id; })
                        .sort(function (a, b) { return a.date.localeCompare(b.date); });
        return "<div>" +
          '<div class="section-head"><div><h2>' + esc(t.name) + "</h2><p>" + esc(t.desc) + "</p></div>" +
          (list.length ? '<a class="btn btn-ghost" href="#/topico/' + t.id + '">Abrir eixo</a>' : "") + "</div>" +
          gridHTML(list, "Nenhum artigo publicado neste eixo ainda") + "</div>";
      }).join("") +
    "</div></section>";
  }

  function viewTopico(id) {
    var t = TOPICS.filter(function (x) { return x.id === id; })[0];
    if (!t) return view404();
    var list = PUB.filter(function (p) { return p.topic === id; })
                    .sort(function (a, b) { return a.date.localeCompare(b.date); });
    return pageHead(t.name, esc(t.desc) + ' · <a href="#/topicos">todos os eixos</a>') +
      '<section class="section"><div class="wrap">' +
      gridHTML(list, "Nenhum artigo publicado neste eixo ainda") + "</div></section>";
  }

  function viewTag(tag) {
    var list = byDate.filter(function (p) { return p.tags.indexOf(tag) >= 0; });
    return pageHead("Etiqueta: " + tag,
      list.length + (list.length === 1 ? " artigo marcado" : " artigos marcados") +
      ' com esta etiqueta · <a href="#/artigos">ver todos</a>') +
      '<section class="section"><div class="wrap">' + gridHTML(list) + "</div></section>";
  }

  function viewTrilha() {
    return pageHead("Trilha de estudo",
      "Os artigos na ordem em que foram escritos, que acompanha a sequência do conteúdo programático: " +
      "cada um assume o anterior e prepara o seguinte.") +
    '<section class="section"><div class="wrap"><div class="trail">' +
      PUB.map(function (p, i) {
        return '<div class="trail-item">' +
          '<span class="step">Etapa ' + (i + 1) + " · " + esc(topicName(p.topic)) + "</span>" +
          '<h3><a href="#/post/' + p.slug + '">' + esc(p.title) + "</a></h3>" +
          "<p>" + esc(p.lead) + "</p>" +
          '<div class="meta"><time datetime="' + p.date + '">' + fmtShort(p.date) + "</time>" +
          '<span class="dot"></span><span>' + readingTime(p) + " min</span>" +
          (p.demo ? '<span class="dot"></span><span class="badge-demo">demo</span>' : "") + "</div>" +
        "</div>";
      }).join("") +
    "</div></div></section>";
  }

  function viewSobre() {
    return pageHead("Sobre o blog",
      "Trabalho da disciplina de Computação Visual, escrito e publicado como um blog navegável.") +
    '<section class="section"><div class="wrap">' +
      '<div class="prose">' +
        '<div class="author-card" style="margin-bottom:2rem">' +
          '<img src="assets/img/avatar.svg" alt="">' +
          "<div><strong>" + esc(SITE.author) + "</strong>" +
          "<p>Estudante de Ciência da Computação · 7ª etapa · Faculdade de Computação e Informática, " +
          "Universidade Presbiteriana Mackenzie. Todos os textos e demonstrações deste site são autorais.</p></div>" +
        "</div>" +

        "<h2 id='tema'>O tema escolhido</h2>" +
        "<p>Em vez de tratar cada assunto da ementa como um texto isolado, o blog adota um fio condutor único: " +
        "<strong>a jornada de um pixel, da captura ao render</strong>. A sequência acompanha o caminho físico e " +
        "computacional da informação visual, um sinal contínuo é amostrado e quantizado, filtrado no domínio " +
        "espacial e no da frequência, tem seus aspectos detectados, é reposicionado por transformações geométricas, " +
        "projetado por um modelo de câmera, interpretado como cor e, por fim, sintetizado do zero pelo pipeline " +
        "gráfico. O último artigo fecha o percurso discutindo o que tudo isso significa quando a imagem embasa um " +
        "diagnóstico ou uma decisão judicial.</p>" +
        "<p>A escolha atende aos três grupos de objetivos do plano de ensino: os artigos 1 a 4 cobrem " +
        "<em>fatos e conceitos</em> de formação e processamento de imagens; as demonstrações interativas exercitam " +
        "<em>procedimentos e habilidades</em>, executando de fato os algoritmos sobre pixels; e o artigo final trata " +
        "das <em>atitudes e valores</em>, senso crítico sobre manipulação de imagens e a abrangência das aplicações " +
        "em medicina e segurança.</p>" +

        "<h2 id='cobertura'>Cobertura do conteúdo programático</h2>" +
        '<div class="table-scroll"><table><thead><tr><th>Item do plano</th><th>Onde aparece</th></tr></thead><tbody>' +
        [["1.1 / 1.2 Aspectos e técnicas básicas", "imagem-digital", "Do fóton ao pixel"],
         ["2.1 Transformações de intensidade, convolução e filtragem espacial", "convolucao-filtragem", "Convolução"],
         ["2.2 Filtragem no domínio da frequência", "dominio-frequencia", "Domínio da frequência"],
         ["2.3 Detecção de aspectos", "deteccao-bordas", "Detecção de bordas"],
         ["3.1 Transformações geométricas", "transformacoes-geometricas", "Transformações geométricas"],
         ["3.2 Modelos de câmeras", "modelos-camera", "Modelos de câmera"],
         ["4.1 / 4.2 Luz e reprodução de cores", "luz-e-cor", "Luz e cor"],
         ["5.1 / 5.2 Etapas da produção e pipeline gráfico interativo", "pipeline-grafico", "O pipeline gráfico"],
         ["Aplicações em medicina e segurança", "medicina-seguranca-etica", "Senso crítico"]]
          .map(function (r) {
            var no_ar = PUB.some(function (p) { return p.slug === r[1]; });
            return "<tr><td>" + r[0] + "</td><td>" + (no_ar
              ? '<a href="#/post/' + r[1] + '">' + r[2] + "</a>"
              : '<span class="muted">' + r[2] + " — em breve</span>") + "</td></tr>";
          }).join("") +
        "</tbody></table></div>" +

        "<h2 id='tecnico'>Como o site foi feito</h2>" +
        "<p>HTML, CSS e JavaScript puro, sem framework nem etapa de build, em arquivos separados: " +
        "<code>index.html</code>, <code>css/style.css</code> e três scripts, <code>js/posts.js</code> " +
        "(conteúdo), <code>js/demos.js</code> (demonstrações) e <code>js/app.js</code> (roteador). " +
        "A navegação usa roteamento por hash, o que mantém cada artigo em uma URL própria e compartilhável " +
        "e dispensa qualquer configuração de servidor no GitHub Pages.</p>" +
        "<p>Todas as demonstrações rodam localmente no navegador com a API 2D do <code>canvas</code>, sobre uma " +
        "cena desenhada proceduralmente, nenhuma imagem externa é carregada, o que evita restrições de CORS na " +
        "leitura de pixels. As ilustrações dos artigos são SVGs autorais.</p>" +

        "<h2 id='biblio'>Bibliografia</h2>" +
        "<p class='muted'>Referências indicadas no plano de ensino e usadas como base conceitual dos textos.</p>" +
        "<h3>Básica</h3><ul class='refs'>" +
        "<li>NIELSEN, F. <em>Visual Computing: Geometry, Graphics and Vision</em>. New York: Charles River Media, 2013.</li>" +
        "<li>PHARR, M.; JAKOB, W.; HUMPHREYS, G. <em>Physically Based Rendering: From Theory to Implementation</em>. 3. ed. New York: Morgan Kaufmann, 2016.</li>" +
        "<li>HUGHES, J. F. et al. <em>Computer Graphics: Principles and Practice</em>. 3. ed. Boston: Addison-Wesley, 2013.</li>" +
        "</ul><h3>Complementar</h3><ul class='refs'>" +
        "<li>ANGEL, E. <em>Interactive Computer Graphics: A Top-Down Approach with OpenGL</em>. 6. ed. Reading: Addison-Wesley, 2012.</li>" +
        "<li>CONCI, A.; AZEVEDO, E.; LETA, F. R. <em>Computação Gráfica, Geração de Imagens</em>. Rio de Janeiro: Elsevier, 2008.</li>" +
        "<li>FORSYTH, D. A.; PONCE, J. <em>Computer Vision: A Modern Approach</em>. New York: Pearson, 2011.</li>" +
        "<li>HILL, F. S. <em>Computer Graphics Using OpenGL</em>. 2. ed. Upper Saddle River: Prentice Hall PTR, 2001.</li>" +
        "<li>WATT, A. H.; WATT, M. <em>Advanced Animation and Rendering Techniques: Theory and Practice</em>. Reading: Addison-Wesley, 2005.</li>" +
        "</ul>" +

        "<h2 id='disciplina'>A disciplina</h2>" +
        "<p>" + esc(SITE.course) + ". Professor " + esc(SITE.professor) + ". Sétima etapa, 2º semestre de 2026, " +
        "4 h/a semanais (2 presenciais e 2 a distância), núcleo temático de Tecnologia e Infraestrutura.</p>" +
      "</div>" +
    "</div></section>";
  }

  function view404() {
    return '<div class="empty"><h2>Página não encontrada</h2>' +
      "<p>O endereço acessado não corresponde a nenhum artigo.</p>" +
      '<p><a class="btn btn-primary" href="#/">Voltar ao início</a></p></div>';
  }

  function viewPost(slug) {
    var idx = postIndex(slug);
    if (idx < 0) return view404();
    var post = PUB[idx];
    var prev = PUB[idx - 1], next = PUB[idx + 1];

    // sumário a partir dos h2 do corpo
    var tmp = document.createElement("div");
    tmp.innerHTML = post.body;
    var heads = Array.prototype.slice.call(tmp.querySelectorAll("h2[id]"));
    var toc = heads.length
      ? '<aside class="toc"><strong>Neste artigo</strong>' +
        heads.map(function (hd) {
          return '<a href="#/post/' + post.slug + "~" + hd.id + '" data-scroll="' + hd.id + '">' + esc(hd.textContent) + "</a>";
        }).join("") + "</aside>"
      : "<aside></aside>";

    var pager = '<nav class="pager" aria-label="Navegação entre artigos">' +
      (prev ? '<a href="#/post/' + prev.slug + '"><span class="dir">← Artigo anterior</span><span class="ttl">' + esc(prev.title) + "</span></a>" : "") +
      (next ? '<a class="next" href="#/post/' + next.slug + '"><span class="dir">Próximo artigo →</span><span class="ttl">' + esc(next.title) + "</span></a>" : "") +
      "</nav>";

    return '' +
    '<article class="post">' +
      '<header class="post-hero"><div class="wrap"><div class="post-hero-inner">' +
        '<span class="kicker">' + esc(topicName(post.topic)) + "</span>" +
        "<h1>" + esc(post.title) + "</h1>" +
        '<p class="lead">' + esc(post.lead) + "</p>" +
        '<div class="meta">' +
          "<span>Por " + esc(SITE.author) + "</span><span class='dot'></span>" +
          '<time datetime="' + post.date + '">' + fmtDate(post.date) + "</time>" +
          "<span class='dot'></span><span>" + readingTime(post) + " min de leitura</span>" +
          (post.demo ? "<span class='dot'></span><span class=\"badge-demo\">com demo interativa</span>" : "") +
        "</div>" +
      "</div></div></header>" +

      '<div class="wrap" style="padding-top:1.8rem">' +
        '<figure class="post-figure"><img src="' + post.image + '" alt="' + esc(post.alt) + '"></figure>' +
      "</div>" +

      '<div class="wrap post-layout">' +
        '<div class="prose" id="post-body">' + post.body +
          '<div class="post-foot">' +
            '<div class="tag-list">' + post.tags.map(function (t) {
              return '<a class="tag" href="#/tag/' + encodeURIComponent(t) + '">#' + esc(t) + "</a>";
            }).join("") + "</div>" +
            '<div class="share-row">' +
              '<button class="btn btn-ghost" id="copy-link" type="button">Copiar link do artigo</button>' +
              '<a class="btn btn-ghost" href="#/trilha">Ver a trilha</a>' +
              '<span id="copy-msg" class="copy-ok" hidden>Link copiado!</span>' +
            "</div>" +
          "</div>" +
          pager +
        "</div>" +
        toc +
      "</div>" +
    "</article>";
  }

  /* ---------------- roteador ---------------- */

  function parseHash() {
    var raw = location.hash.replace(/^#/, "");
    if (!raw || raw === "/") return { path: ["" ], route: "/", query: {}, section: null };
    var query = {}, qi = raw.indexOf("?");
    if (qi >= 0) {
      raw.slice(qi + 1).split("&").forEach(function (kv) {
        var p = kv.split("=");
        query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " "));
      });
      raw = raw.slice(0, qi);
    }
    var section = null, si = raw.indexOf("~");
    if (si >= 0) { section = raw.slice(si + 1); raw = raw.slice(0, si); }
    var parts = raw.replace(/^\//, "").replace(/\/$/, "").split("/").map(decodeURIComponent);
    return { path: parts, query: query, section: section };
  }

  function setMeta(title, desc) {
    document.title = title ? title + " · " + SITE.title : SITE.title + ", blog de Computação Visual";
    var m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute("content", desc);
  }

  function markNav(key) {
    var links = document.querySelectorAll(".site-nav a[data-nav]");
    Array.prototype.forEach.call(links, function (a) {
      if (a.getAttribute("data-nav") === key) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function render() {
    var r = parseHash();
    var p0 = r.path[0] || "", html, nav = "home", title = "", desc = SITE.description;

    if (window.Demos) window.Demos.dispose();

    if (p0 === "" || p0 === "inicio") { html = viewHome(); nav = "home"; }
    else if (p0 === "artigos") { html = viewArtigos(r.query); nav = "artigos"; title = "Todos os artigos"; }
    else if (p0 === "topicos") { html = viewTopicos(); nav = "topicos"; title = "Tópicos"; }
    else if (p0 === "topico") { html = viewTopico(r.path[1]); nav = "topicos"; title = topicName(r.path[1]); }
    else if (p0 === "tag") { html = viewTag(r.path[1] || ""); nav = "artigos"; title = "Etiqueta " + (r.path[1] || ""); }
    else if (p0 === "trilha") { html = viewTrilha(); nav = "trilha"; title = "Trilha de estudo"; }
    else if (p0 === "sobre") { html = viewSobre(); nav = "sobre"; title = "Sobre"; }
    else if (p0 === "post") {
      var i = postIndex(r.path[1]);
      html = viewPost(r.path[1]);
      nav = "artigos";
      if (i >= 0) { title = PUB[i].title; desc = PUB[i].lead; }
      else title = "Não encontrado";
    } else { html = view404(); title = "Não encontrado"; }

    app.innerHTML = html;
    setMeta(title, desc);
    markNav(nav);
    closeMenu();

    if (window.Demos) window.Demos.mount(app);
    wirePage(r);

    // posiciona a rolagem
    if (r.section) {
      var target = document.getElementById(r.section);
      if (target) { target.scrollIntoView(); window.scrollBy(0, -70); return; }
    }
    window.scrollTo(0, 0);
  }

  /* ---------------- interações da página renderizada ---------------- */

  function wirePage(r) {
    // busca
    var q = document.getElementById("q");
    if (q) {
      var t = null;
      q.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(function () {
          var v = q.value.trim();
          var pos = q.selectionStart;
          history.replaceState(null, "", "#/artigos" + (v ? "?q=" + encodeURIComponent(v) : ""));
          render();
          var nq = document.getElementById("q");
          if (nq) { nq.focus(); nq.setSelectionRange(pos, pos); }
        }, 220);
      });
    }

    // copiar link
    var btn = document.getElementById("copy-link");
    if (btn) {
      btn.addEventListener("click", function () {
        var url = location.href;
        var done = function () {
          var msg = document.getElementById("copy-msg");
          if (msg) { msg.hidden = false; setTimeout(function () { msg.hidden = true; }, 2200); }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copie o link:", url); });
        } else {
          window.prompt("Copie o link:", url);
        }
      });
    }

    // sumário: rola sem recarregar a página
    var tocLinks = document.querySelectorAll(".toc a[data-scroll]");
    Array.prototype.forEach.call(tocLinks, function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var id = a.getAttribute("data-scroll");
        var el = document.getElementById(id);
        if (el) {
          history.replaceState(null, "", a.getAttribute("href"));
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    setupTocSpy();
  }

  var spy = null;
  function setupTocSpy() {
    if (spy) { spy.disconnect(); spy = null; }
    var links = document.querySelectorAll(".toc a[data-scroll]");
    if (!links.length || !window.IntersectionObserver) return;
    var map = {};
    Array.prototype.forEach.call(links, function (a) { map[a.getAttribute("data-scroll")] = a; });
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Array.prototype.forEach.call(links, function (a) { a.classList.remove("active"); });
        var a = map[e.target.id];
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------------- cromo do site ---------------- */

  var navEl = document.getElementById("site-nav");
  var navBtn = document.getElementById("nav-toggle");

  function closeMenu() {
    if (!navEl) return;
    navEl.classList.remove("open");
    if (navBtn) navBtn.setAttribute("aria-expanded", "false");
  }
  if (navBtn) {
    navBtn.addEventListener("click", function () {
      var open = navEl.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // tema
  var THEME_KEY = "pixel-luz-tema";
  function applyTheme(v) {
    if (v === "dark" || v === "light") document.documentElement.setAttribute("data-theme", v);
    else document.documentElement.removeAttribute("data-theme");
  }
  function currentTheme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (e) { /* modo privado */ }

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignora */ }
      if (window.Demos) window.Demos.refreshTheme(app);
    });
  }

  // barra de progresso de leitura
  var bar = document.getElementById("progress");
  function updateProgress() {
    if (!bar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  /* ---------------- inicialização ---------------- */

  window.addEventListener("hashchange", function () { render(); updateProgress(); });
  if (!location.hash) location.replace("#/");
  render();
  updateProgress();
})();
