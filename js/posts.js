/* =========================================================
   posts.js, conteúdo do blog
   Cada post é um objeto; o corpo é HTML puro renderizado pelo app.
   Marcadores <div class="demo" data-demo="nome"></div> são
   substituídos pelas demonstrações interativas de demos.js.
   ========================================================= */

window.SITE = {
  title: "Pixel & Luz",
  tagline: "Da captura ao render: a jornada de um pixel",
  description:
    "Blog da disciplina de Computação Visual. Um fio condutor: seguir um pixel desde o fóton que o cria, " +
    "passando pelos filtros que o transformam, pela geometria que o reposiciona, até o pipeline que o desenha na tela.",
  author: "Luis Fernando",
  course: "Computação Visual · Ciência da Computação · Universidade Presbiteriana Mackenzie",
  professor: "André Kishimoto"
};

window.TOPICS = [
  { id: "fundamentos",  name: "Fundamentos",              desc: "Amostragem, quantização e representação" },
  { id: "imagem",       name: "Processamento de imagem",  desc: "Convolução, filtragem, frequência, bordas" },
  { id: "geometria",    name: "Computação visual geométrica", desc: "Transformações, câmeras, estéreo" },
  { id: "radiometria",  name: "Radiometria e cor",        desc: "Luz, espectro e espaços de cor" },
  { id: "sintese",      name: "Síntese de imagem",        desc: "Pipeline gráfico e rasterização" },
  { id: "aplicacoes",   name: "Aplicações e ética",       desc: "Medicina, segurança e senso crítico" }
];

window.POSTS = [
/* ------------------------------------------------------------------ 1 */
{
  slug: "imagem-digital",
  draft: false,          // oculto: remova esta linha para publicar
  title: "Do fóton ao pixel: como nasce uma imagem digital",
  lead: "Antes de filtrar, transformar ou renderizar qualquer coisa, é preciso entender o que exatamente estamos manipulando. Amostragem, quantização e as duas resoluções que definem uma imagem.",
  date: "2026-08-04",
  topic: "fundamentos",
  tags: ["amostragem", "quantização", "aliasing", "fundamentos"],
  image: "assets/img/post-imagem-digital.svg",
  alt: "Ilustração de um sinal contínuo sendo amostrado em uma grade de pixels quadrados",
  demo: "amostragem",
  featured: true,
  body: `
<p>Uma cena real é um sinal <strong>contínuo</strong> em duas dimensões espaciais, em comprimento de onda e em tempo.
Um sensor digital não guarda nada disso: ele guarda uma tabela de números. Toda a Computação Visual mora nessa
distância entre o mundo contínuo e a tabela discreta, e quase todo artefato visual que você já viu (serrilhado,
banding, moiré, ruído) é consequência direta de como essa conversão foi feita.</p>

<h2 id="dois-passos">Dois passos, duas perdas</h2>
<p>A digitalização acontece em dois momentos independentes, e cada um descarta um tipo diferente de informação:</p>
<ul>
  <li><strong>Amostragem (sampling)</strong>, discretiza o <em>domínio</em>. O plano contínuo (x, y) vira uma grade
  finita de posições. Define a <strong>resolução espacial</strong>: quantos pixels descrevem a cena.</li>
  <li><strong>Quantização</strong>, discretiza o <em>contradomínio</em>. A intensidade contínua vira um inteiro
  dentro de uma faixa. Define a <strong>resolução radiométrica</strong>: quantos tons cada pixel pode assumir.</li>
</ul>
<p>Uma imagem de 8 bits em tons de cinza, portanto, é uma função discreta:</p>
<div class="formula">f : { 0 … L-1 } &times; { 0 … A-1 } &rarr; { 0, 1, …, 255 }</div>
<p>Nada mais que isso. Um filtro é uma função que recebe esse arranjo e devolve outro; um algoritmo de visão
computacional é uma função que recebe esse arranjo e devolve uma <em>descrição</em> (uma borda, uma caixa, uma classe).</p>

<h2 id="experimento">Experimento: destruindo uma imagem em duas direções</h2>
<p>A demo abaixo aplica os dois processos de forma independente sobre a mesma imagem sintética. Reduza a resolução
espacial e observe estruturas finas desaparecerem ou se transformarem em padrões falsos; reduza os níveis de
quantização e observe o gradiente do céu quebrar em faixas visíveis (<em>banding</em>).</p>

<div class="demo" data-demo="amostragem"></div>

<h2 id="aliasing">Aliasing: o erro que não dá para desfazer</h2>
<p>O teorema da amostragem de Nyquist-Shannon diz que um sinal só é reconstruível se a taxa de amostragem for maior
que o dobro da sua maior frequência. Em imagens, a "maior frequência" é o detalhe mais fino da cena, a textura de
um tecido, as linhas de uma grade, os cabelos numa foto.</p>
<div class="formula">f<sub>amostragem</sub> &gt; 2 &middot; f<sub>máx</sub>&nbsp;&nbsp;&nbsp;(frequência de Nyquist)</div>
<p>Quando essa condição é violada, frequências altas não somem: elas se <strong>disfarçam</strong> de frequências
baixas. É por isso que uma camisa listrada vira um borrão colorido ondulado na câmera, e por isso que uma roda
girando rápido parece girar para trás no cinema. O nome disso é <em>aliasing</em>, e o ponto crucial é que ele é
<strong>irreversível</strong>: depois que a frequência falsa entrou nos dados, nenhum filtro sabe distinguir o que
era real do que é impostor.</p>
<div class="callout">
  <span class="ico">⚠️</span>
  <div>
    <span class="callout-title">A ordem importa</span>
    <p>Por isso todo redimensionamento decente <em>borra antes de reduzir</em>: aplica-se um filtro passa-baixa
    (tipicamente gaussiano) para remover as frequências que a nova grade não conseguirá representar, e só então
    descarta-se pixels. Reduzir primeiro e tentar corrigir depois não funciona.</p>
  </div>
</div>

<h2 id="radiometrica">Resolução radiométrica e o olho humano</h2>
<p>Oito bits por canal (256 níveis) viraram padrão não por acaso: em condições normais de visualização, o olho humano
distingue algo em torno de 100 a 200 níveis de cinza numa mesma cena. Mas isso muda radicalmente conforme a aplicação:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Contexto</th><th>Profundidade típica</th><th>Por quê</th></tr></thead>
  <tbody>
    <tr><td>Foto para web</td><td>8 bits/canal</td><td>Suficiente para exibição direta</td></tr>
    <tr><td>Tomografia / raio-X (DICOM)</td><td>12 a 16 bits</td><td>Faixa enorme de densidades; o diagnóstico depende de diferenças sutis</td></tr>
    <tr><td>Sensoriamento remoto</td><td>12 a 16 bits + N bandas</td><td>Bandas fora do visível carregam a informação útil</td></tr>
    <tr><td>Renderização / HDR</td><td>32 bits (ponto flutuante)</td><td>Luz tem faixa dinâmica praticamente ilimitada</td></tr>
  </tbody>
</table>
</div>
<p>Em uma tomografia, o médico não olha os 65 mil níveis de uma vez: aplica-se uma <em>janela</em> (window/level),
que é uma transformação de intensidade mapeando uma faixa estreita de interesse, tecido mole, osso, pulmão, para
os 256 níveis da tela. É o exemplo mais direto de por que estudar transformações de intensidade tem consequência prática.</p>

<h2 id="vizinhanca">Vizinhança: a base de tudo que vem depois</h2>
<p>Um pixel isolado quase não carrega informação. O que dá sentido a ele é a <strong>vizinhança</strong>, e a escolha
da vizinhança define o comportamento de praticamente todo algoritmo dos próximos artigos:</p>
<ul>
  <li><strong>N4</strong>, os 4 vizinhos que compartilham aresta (cima, baixo, esquerda, direita).</li>
  <li><strong>N8</strong>, os 8 vizinhos, incluindo diagonais.</li>
</ul>
<p>A escolha não é cosmética: em segmentação, usar N4 pode separar um objeto que é conectado apenas na diagonal,
enquanto N8 pode fundir dois objetos que só se tocam por um canto. O clássico "paradoxo de conectividade" resolve-se
usando conectividades opostas para objeto e fundo.</p>

<hr>
<p><strong>No próximo artigo:</strong> a operação que percorre exatamente essa vizinhança e produz quase todos os
filtros clássicos, a convolução.</p>
`
},

/* ------------------------------------------------------------------ 2 */
{
  slug: "convolucao-filtragem",
  draft: false,          // oculto: remova esta linha para publicar
  title: "Convolução: o motor da filtragem espacial",
  lead: "Uma janela pequena deslizando sobre a imagem, uma soma ponderada em cada posição. Dessa operação minúscula saem o desfoque, a nitidez, o realce de bordas e a primeira camada de qualquer rede neural convolucional.",
  date: "2026-08-07",
  topic: "imagem",
  tags: ["convolução", "filtros", "ruído", "kernel"],
  image: "assets/img/post-convolucao.svg",
  alt: "Máscara 3x3 deslizando sobre uma grade de pixels e produzindo um pixel de saída",
  demo: "convolucao",
  featured: true,
  body: `
<p>Se existe uma única operação que resume o processamento de imagens no domínio espacial, é a convolução. A ideia
cabe em uma frase: <strong>cada pixel de saída é uma soma ponderada dos pixels vizinhos na entrada</strong>. Os pesos
formam uma matriz pequena, o <em>kernel</em>, ou máscara, e trocar essa matriz troca completamente o efeito.</p>

<h2 id="definicao">A definição</h2>
<p>Para um kernel <code>w</code> de tamanho (2a+1) &times; (2b+1) aplicado sobre a imagem <code>f</code>:</p>
<div class="formula">g(x, y) = &sum;<sub>s=-a..a</sub> &sum;<sub>t=-b..b</sub> w(s, t) &middot; f(x - s, y - t)</div>
<p>Repare no sinal negativo: na convolução formal o kernel é <strong>espelhado</strong> nos dois eixos antes de ser
aplicado. Se você usar o sinal positivo, a operação se chama <em>correlação cruzada</em>. Para kernels simétricos
(média, gaussiano, laplaciano) as duas coincidem, e por isso muita biblioteca, incluindo boa parte das que chamam
suas camadas de "convolucionais", implementa correlação e ninguém reclama. Para kernels assimétricos, como o Sobel,
a diferença inverte o sinal da resposta.</p>

<h2 id="bancada">Bancada de filtros</h2>
<p>Troque o kernel e observe o resultado. Note especialmente o comportamento com ruído ativado: a mediana, que
<em>não</em> é uma convolução, por não ser linear, elimina ruído sal-e-pimenta sem destruir as bordas, algo que
nenhuma média ponderada consegue fazer.</p>

<div class="demo" data-demo="convolucao"></div>

<h2 id="familias">As três famílias de kernel</h2>

<h3>Suavização (passa-baixa)</h3>
<p>Todos os pesos positivos, somando 1. Atenuam variações bruscas e, com elas, ruído, ao custo de borrar bordas.</p>
<ul>
  <li><strong>Média (box)</strong>, todos os pesos iguais. Barato, mas produz artefatos direcionais em objetos retos.</li>
  <li><strong>Gaussiano</strong>, pesos caindo conforme <code>exp(-(x²+y²)/2σ²)</code>. É isotrópico, não introduz
  oscilações e tem uma propriedade decisiva: é <strong>separável</strong>.</li>
</ul>
<div class="callout">
  <span class="ico">⚡</span>
  <div>
    <span class="callout-title">Separabilidade paga a conta</span>
    <p>Um kernel n&times;n custa n² multiplicações por pixel. Se ele puder ser escrito como o produto de dois vetores
    (um 1&times;n e um n&times;1), aplica-se um depois do outro e o custo cai para 2n. Para um gaussiano 15&times;15
    isso é 225 &rarr; 30 operações por pixel: <strong>7,5&times; mais rápido</strong>, com resultado matematicamente idêntico.</p>
  </div>
</div>

<h3>Realce (passa-alta)</h3>
<p>Pesos somando 0 (detecção pura de variação) ou 1 (imagem + variação). O laplaciano é o exemplo canônico:</p>
<pre><code>Laplaciano (4-vizinhos)      Sharpen = identidade - laplaciano
   0  -1   0                     0  -1   0
  -1   4  -1                    -1   5  -1
   0  -1   0                     0  -1   0</code></pre>
<p>O <em>unsharp masking</em> generaliza isso: subtrai-se da imagem uma versão borrada dela mesma para isolar o
detalhe, e soma-se esse detalhe de volta amplificado por um fator <code>k</code>.</p>
<div class="formula">g = f + k &middot; ( f - suavizada(f) )</div>

<h3>Derivadas direcionais</h3>
<p>Kernels antissimétricos que estimam a taxa de variação em uma direção. São a base da detecção de bordas e ganham
um artigo inteiro mais adiante.</p>

<h2 id="bordas-da-imagem">O problema das bordas da imagem</h2>
<p>Na primeira linha da imagem, o kernel pede pixels que não existem. As estratégias usuais:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Estratégia</th><th>Comportamento</th><th>Risco</th></tr></thead>
  <tbody>
    <tr><td>Zero padding</td><td>Assume preto fora da imagem</td><td>Cria uma borda escura artificial</td></tr>
    <tr><td>Réplica (clamp)</td><td>Repete o pixel da margem</td><td>Padrão; distorce pouco</td></tr>
    <tr><td>Espelhamento</td><td>Reflete a vizinhança</td><td>Melhor continuidade; padrão em wavelets</td></tr>
    <tr><td>Recorte</td><td>Saída menor que a entrada</td><td>Muda as dimensões, atenção em pipelines</td></tr>
  </tbody>
</table>
</div>

<h2 id="ruido">Escolher o filtro é escolher o ruído</h2>
<p>Não existe "melhor filtro", existe filtro adequado ao ruído presente:</p>
<ul>
  <li><strong>Gaussiano (aditivo)</strong>, variação suave em torno do valor real, típico de sensor com pouca luz.
  Responde bem à média e ao filtro gaussiano.</li>
  <li><strong>Sal e pimenta (impulsivo)</strong>, pixels isolados em 0 ou 255, típico de erro de transmissão.
  A média espalha o defeito; a <strong>mediana</strong> o elimina.</li>
  <li><strong>Speckle (multiplicativo)</strong>, ruído proporcional ao sinal, típico de ultrassom e radar.
  Exige filtros específicos (Lee, Frost) ou trabalho no domínio logarítmico.</li>
</ul>
<p>Diagnosticar o ruído antes de escolher a máscara é o que separa processamento de imagem de tentativa e erro.</p>

<h2 id="codigo">Implementação de referência</h2>
<pre><code>function convolve(src, w, h, kernel, k) {
  const out = new Float32Array(w * h);
  const r = (k - 1) / 2;
  for (let y = 0; y &lt; h; y++) {
    for (let x = 0; x &lt; w; x++) {
      let acc = 0;
      for (let j = -r; j &lt;= r; j++) {
        for (let i = -r; i &lt;= r; i++) {
          // clamp: replica o pixel da margem
          const sx = Math.min(w - 1, Math.max(0, x + i));
          const sy = Math.min(h - 1, Math.max(0, y + j));
          acc += src[sy * w + sx] * kernel[(j + r) * k + (i + r)];
        }
      }
      out[y * w + x] = acc;
    }
  }
  return out;
}</code></pre>
<p>Guardar o acumulador em ponto flutuante e só recortar para [0, 255] no fim é essencial: kernels de derivada
produzem valores negativos, e truncar cedo perde metade da informação.</p>

<hr>
<p><strong>No próximo artigo:</strong> essa mesma convolução, vista de outro ângulo, vira uma simples multiplicação —
basta trocar de domínio.</p>
`
},

/* ------------------------------------------------------------------ 3 */
{
  slug: "dominio-frequencia",
  draft: true,          // oculto: remova esta linha para publicar
  title: "Domínio da frequência: quando a imagem vira onda",
  lead: "Toda imagem pode ser escrita como uma soma de senoides. Nessa representação, filtrar deixa de ser deslizar uma janela e passa a ser apagar regiões de um espectro, e a convolução vira multiplicação.",
  date: "2026-08-11",
  topic: "imagem",
  tags: ["Fourier", "DFT", "espectro", "filtros"],
  image: "assets/img/post-frequencia.svg",
  alt: "Espectro de Fourier em anéis concêntricos ao lado de ondas senoidais",
  demo: "frequencia",
  body: `
<p>Existe uma segunda maneira, completamente equivalente, de descrever uma imagem. Em vez de dizer "o pixel (12, 40)
vale 173", diz-se <em>quais padrões ondulatórios, com quais amplitudes e fases, somados, reproduzem a imagem inteira</em>.
Essa é a representação em frequência, e ela torna óbvias operações que no domínio espacial parecem arbitrárias.</p>

<h2 id="intuicao">O que é "frequência" em uma imagem</h2>
<ul>
  <li><strong>Baixas frequências</strong>, variações lentas: o brilho geral, o gradiente do céu, grandes regiões
  homogêneas. Concentram-se no <em>centro</em> do espectro.</li>
  <li><strong>Altas frequências</strong>, variações abruptas: bordas, texturas finas, ruído. Ocupam as
  <em>extremidades</em>.</li>
</ul>
<p>A Transformada Discreta de Fourier (DFT) faz a conversão:</p>
<div class="formula">F(u, v) = &sum;<sub>x</sub> &sum;<sub>y</sub> f(x, y) &middot; e<sup>-j2&pi;(ux/L + vy/A)</sup></div>
<p>Cada <code>F(u,v)</code> é um número complexo: o módulo é a <strong>amplitude</strong> daquele padrão ondulatório,
e o ângulo é a <strong>fase</strong>. O que se costuma exibir como "espectro" é apenas o módulo, normalmente em escala
logarítmica porque o coeficiente central (a média da imagem) é ordens de grandeza maior que o resto.</p>
<div class="callout">
  <span class="ico">🔍</span>
  <div>
    <span class="callout-title">A fase carrega a estrutura</span>
    <p>Um experimento clássico: troque o módulo de duas imagens mantendo as fases. O resultado se parece com a imagem
    que doou a <em>fase</em>, não a amplitude. Amplitude diz "quanta" textura existe; fase diz <em>onde</em> ela está.
    É por isso que descartar fase em compressão é catastrófico.</p>
  </div>
</div>

<h2 id="demo">Filtrando no espectro</h2>
<p>A demo calcula a DFT 2D de uma imagem 64&times;64, permite zerar coeficientes por raio e reconstrói a imagem com a
transformada inversa. Um passa-baixa mantém só o miolo do espectro (borra); um passa-alta mantém só a periferia
(sobram as bordas). Repare no <em>ringing</em> quando o corte é abrupto.</p>

<div class="demo" data-demo="frequencia"></div>

<h2 id="teorema">O teorema da convolução</h2>
<p>Aqui está a razão de tudo isso importar na prática:</p>
<div class="formula">f * h &nbsp;&nbsp;&harr;&nbsp;&nbsp; F &middot; H</div>
<p>Convolução no espaço é multiplicação ponto a ponto na frequência. Uma convolução com kernel n&times;n custa
O(n²) por pixel; a FFT custa O(log N) amortizado por pixel, independentemente do tamanho do kernel. O ponto de
virada fica por volta de kernels 15&times;15, abaixo disso o domínio espacial ainda vence, por conta do custo fixo
das transformadas.</p>

<h2 id="ringing">Por que filtro ideal é uma má ideia</h2>
<p>Um filtro "ideal" zera tudo além de um raio de corte. Como um corte retangular na frequência corresponde a uma
função <em>sinc</em> (que oscila infinitamente) no espaço, o resultado ganha ondulações fantasma em torno das bordas
— o <strong>ringing</strong>. Por isso usam-se transições suaves:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Filtro</th><th>Transição</th><th>Ringing</th></tr></thead>
  <tbody>
    <tr><td>Ideal</td><td>Degrau</td><td>Severo</td></tr>
    <tr><td>Butterworth (ordem n)</td><td>Controlada por n</td><td>Moderado, ajustável</td></tr>
    <tr><td>Gaussiano</td><td>Suave</td><td>Nenhum</td></tr>
  </tbody>
</table>
</div>
<p>A gaussiana é o único filtro que é gaussiano nos dois domínios, o que explica sua onipresença.</p>

<h2 id="aplicacoes">Onde isso resolve problemas reais</h2>
<ul>
  <li><strong>Remoção de padrões periódicos</strong>, interferência de rede elétrica em imagem de microscópio, ou
  a trama de meio-tom de um jornal digitalizado, aparecem como <em>picos isolados</em> no espectro. Apagar esses
  picos (filtro notch) remove o padrão sem tocar no resto da imagem, algo praticamente impossível espacialmente.</li>
  <li><strong>Compressão</strong>, o JPEG aplica a DCT (prima da DFT) em blocos 8&times;8 e quantiza mais
  agressivamente os coeficientes de alta frequência, aos quais o olho é menos sensível. Os "quadradinhos" de um JPEG
  muito comprimido são exatamente esses blocos.</li>
  <li><strong>Análise de textura</strong>, a distribuição de energia radial e angular do espectro descreve
  regularidade e orientação, base de descritores usados em sensoriamento remoto e em análise de tecidos.</li>
</ul>

<hr>
<p><strong>No próximo artigo:</strong> voltamos ao domínio espacial para uma tarefa específica e cheia de decisões
finas, encontrar bordas.</p>
`
},

/* ------------------------------------------------------------------ 4 */
{
  slug: "deteccao-bordas",
  draft: true,          // oculto: remova esta linha para publicar
  title: "Detecção de bordas: gradiente, Sobel e a lógica do Canny",
  lead: "Uma borda é uma descontinuidade de intensidade, ou seja, um pico da derivada. Do operador de 3×3 ao algoritmo de Canny, o percurso de transformar uma imagem em um mapa de contornos.",
  date: "2026-08-14",
  topic: "imagem",
  tags: ["bordas", "gradiente", "Sobel", "Canny", "visão"],
  image: "assets/img/post-bordas.svg",
  alt: "Contorno de um objeto destacado por vetores de gradiente apontando para fora",
  demo: "bordas",
  body: `
<p>Detectar bordas é o primeiro passo em que a computação visual deixa de <em>melhorar</em> a imagem e começa a
<strong>extrair informação</strong> dela. A saída não é mais uma imagem para o olho humano: é uma estrutura que
alimenta segmentação, reconhecimento de formas, calibração de câmera e reconstrução 3D.</p>

<h2 id="derivada">Borda é derivada</h2>
<p>Ao atravessar uma borda, a intensidade muda rápido. Logo, o gradiente, o vetor das derivadas parciais, tem
módulo alto ali, e aponta na direção de maior variação (perpendicular à borda):</p>
<div class="formula">&nabla;f = [ &part;f/&part;x , &part;f/&part;y ]&nbsp;&nbsp;&nbsp;
|&nabla;f| = &radic;(G<sub>x</sub>² + G<sub>y</sub>²)&nbsp;&nbsp;&nbsp;
&theta; = arctan(G<sub>y</sub> / G<sub>x</sub>)</div>
<p>Em uma grade discreta, a derivada vira diferença finita, e as diferenças finitas viram kernels:</p>
<pre><code>Sobel Gx            Sobel Gy            Prewitt Gx
-1  0  +1           -1 -2 -1            -1  0  +1
-2  0  +2            0  0  0            -1  0  +1
-1  0  +1           +1 +2 +1            -1  0  +1</code></pre>
<p>O Sobel dá peso 2 à linha central, o que equivale a suavizar levemente na direção perpendicular antes de derivar.
Não é detalhe: <strong>derivar amplifica ruído</strong>, então todo bom detector suaviza antes.</p>

<h2 id="demo">Comparando operadores</h2>
<p>Ajuste o limiar e alterne entre magnitude, componentes separadas e direção do gradiente. Ative o ruído para ver
por que o passo de suavização não é opcional.</p>

<div class="demo" data-demo="bordas"></div>

<h2 id="segunda">Segunda derivada: o laplaciano</h2>
<p>Se a primeira derivada tem um <em>pico</em> na borda, a segunda tem um <strong>cruzamento por zero</strong>
(zero-crossing) exatamente sobre ela. Isso dá localização mais precisa, mas o laplaciano é ainda mais sensível a
ruído, daí o <strong>LoG</strong> (Laplacian of Gaussian): borra com gaussiana e depois aplica o laplaciano, em
uma única convolução combinada. Sua aproximação por diferença de gaussianas (DoG) é a base do detector SIFT.</p>

<h2 id="canny">Canny: quatro etapas e um critério</h2>
<p>Publicado em 1986, o algoritmo de Canny continua sendo o padrão porque foi derivado de três critérios explícitos
— boa detecção, boa localização e resposta única por borda:</p>
<ol>
  <li><strong>Suavização gaussiana</strong>, o parâmetro σ define a escala: σ pequeno pega textura fina, σ grande
  pega só contornos dominantes.</li>
  <li><strong>Gradiente</strong>, magnitude e direção, tipicamente por Sobel.</li>
  <li><strong>Supressão não-máxima</strong>, em cada pixel, compara-se a magnitude com os dois vizinhos ao longo da
  direção do gradiente; se não for o máximo local, zera. É isso que transforma uma crista larga e borrada em uma
  linha de <strong>um pixel</strong> de espessura.</li>
  <li><strong>Histerese</strong>, dois limiares. Acima do alto, é borda definitiva. Entre os dois, só vira borda se
  estiver <em>conectada</em> a uma borda definitiva. Isso evita contornos interrompidos sem inundar a imagem de
  falsos positivos.</li>
</ol>
<div class="callout">
  <span class="ico">🎯</span>
  <div>
    <span class="callout-title">A ideia que sobrevive fora do Canny</span>
    <p>Supressão não-máxima e histerese são princípios gerais de decisão, não truques de imagem: o mesmo NMS aparece
    hoje na saída de detectores de objetos por rede neural, para eliminar caixas redundantes sobre o mesmo objeto.</p>
  </div>
</div>

<h2 id="depois">De bordas a estruturas</h2>
<p>Um mapa binário de bordas ainda é um conjunto de pontos soltos. Para virar geometria:</p>
<ul>
  <li><strong>Transformada de Hough</strong>, cada ponto de borda vota em todas as retas que passam por ele, no
  espaço de parâmetros (ρ, θ). Retas reais acumulam muitos votos e aparecem como picos. Funciona mesmo com contornos
  interrompidos e é o que detecta faixas de rodovia e bordas de documentos.</li>
  <li><strong>Contornos e cadeias</strong>, encadear pixels de borda vizinhos produz curvas fechadas, das quais se
  extraem perímetro, área, circularidade e momentos de Hu (descritores invariantes a rotação e escala).</li>
</ul>

<h2 id="escala">O parâmetro que ninguém pode escolher por você</h2>
<p>Não existe detecção de borda sem escolher uma <strong>escala</strong>. Em uma imagem de tecido, σ pequeno detecta
o contorno de cada célula; σ grande detecta o contorno da região inteira. As duas respostas estão corretas, o que
define qual serve é a pergunta que se quer responder. Explicitar essa escolha, em vez de aceitar o padrão da
biblioteca, é boa parte do senso crítico exigido na área.</p>

<hr>
<p><strong>No próximo artigo:</strong> saímos do conteúdo da imagem e passamos ao seu espaço, transformações
geométricas e coordenadas homogêneas.</p>
`
},

/* ------------------------------------------------------------------ 5 */
{
  slug: "transformacoes-geometricas",
  draft: true,          // oculto: remova esta linha para publicar
  title: "Transformações geométricas e coordenadas homogêneas",
  lead: "Rotacionar, escalar, cisalhar e transladar com uma única multiplicação de matrizes, e o detalhe que decide a qualidade do resultado: a interpolação e o mapeamento inverso.",
  date: "2026-08-18",
  topic: "geometria",
  tags: ["matrizes", "homogêneas", "interpolação", "warping"],
  image: "assets/img/post-transformacoes.svg",
  alt: "Quadrado sendo rotacionado, escalado e cisalhado com sua matriz de transformação ao lado",
  demo: "transformacoes",
  body: `
<p>Rotação, escala e cisalhamento são operações lineares e cabem numa matriz 2&times;2. Translação não é linear —
não preserva a origem, e por isso não cabe. Compor transformações vira então uma mistura desajeitada de
multiplicações e somas. As <strong>coordenadas homogêneas</strong> resolvem isso com um truque elegante.</p>

<h2 id="homogeneas">Uma dimensão a mais</h2>
<p>Representa-se o ponto (x, y) como (x, y, 1). Com isso, a translação vira multiplicação de matriz:</p>
<pre><code>Translação          Escala              Rotação (θ)
[1  0  tx]          [sx  0  0]          [cos -sin  0]
[0  1  ty]          [ 0 sy  0]          [sin  cos  0]
[0  0   1]          [ 0  0  1]          [  0    0  1]</code></pre>
<p>Todas as transformações afins passam a ser matrizes 3&times;3, e compô-las é simplesmente multiplicá-las. A
economia é real: em vez de transformar cada um dos milhões de pontos várias vezes, multiplicam-se as matrizes
<em>uma vez</em> e aplica-se a resultante.</p>
<div class="callout">
  <span class="ico">🔁</span>
  <div>
    <span class="callout-title">A ordem não é comutativa</span>
    <p><code>R · T</code> e <code>T · R</code> produzem resultados diferentes. Rotacionar em torno de um ponto
    arbitrário <em>p</em> é a composição clássica <code>T(p) · R(θ) · T(-p)</code>: leva-se p à origem, rotaciona-se,
    devolve-se. Metade dos bugs de transformação são erros de ordem, a outra metade é convenção de linha versus coluna.</p>
  </div>
</div>

<h2 id="demo">Compondo transformações</h2>
<p>Ajuste os controles e acompanhe a matriz resultante sendo recalculada. O contorno tracejado mostra a figura
original, e a alça de ordem inverte a composição para tornar o efeito visível.</p>

<div class="demo" data-demo="transformacoes"></div>

<h2 id="familias">A hierarquia das transformações 2D</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Classe</th><th>Graus de liberdade</th><th>Preserva</th><th>Uso típico</th></tr></thead>
  <tbody>
    <tr><td>Rígida (euclidiana)</td><td>3</td><td>Distâncias e ângulos</td><td>Registro de imagens médicas</td></tr>
    <tr><td>Similaridade</td><td>4</td><td>Ângulos e razões</td><td>Alinhamento com mudança de escala</td></tr>
    <tr><td>Afim</td><td>6</td><td>Paralelismo</td><td>Correção de cisalhamento, data augmentation</td></tr>
    <tr><td>Projetiva (homografia)</td><td>8</td><td>Retas</td><td>Retificação de planos, panoramas, realidade aumentada</td></tr>
  </tbody>
</table>
</div>
<p>A homografia é o caso em que a última linha da matriz deixa de ser [0 0 1]. Aí a divisão pela coordenada
homogênea <code>w</code> passa a importar, e é exatamente ela que produz a perspectiva, assunto do próximo artigo.
Fotografar uma folha de papel inclinada e "desentortá-la" é resolver uma homografia com quatro pares de pontos.</p>

<h2 id="inverso">Mapeamento direto x inverso</h2>
<p>Aplicar a transformação percorrendo os pixels da <em>origem</em> e jogando-os no destino (<em>forward mapping</em>)
gera dois defeitos: buracos, quando nenhum pixel de origem cai em um pixel de destino, e sobreposições, quando vários
caem no mesmo. A solução usada por todo software real é o <strong>mapeamento inverso</strong>:</p>
<ol>
  <li>Percorre-se cada pixel do <em>destino</em>.</li>
  <li>Aplica-se a matriz <strong>inversa</strong> para descobrir de onde ele veio na origem.</li>
  <li>Essa posição cai entre pixels, e é aí que entra a interpolação.</li>
</ol>

<h2 id="interpolacao">Interpolação: onde a qualidade é decidida</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Método</th><th>Amostras</th><th>Resultado</th><th>Quando usar</th></tr></thead>
  <tbody>
    <tr><td>Vizinho mais próximo</td><td>1</td><td>Serrilhado, blocos</td><td>Máscaras e rótulos, não pode inventar valores intermediários</td></tr>
    <tr><td>Bilinear</td><td>4</td><td>Suave, leve borrão</td><td>Padrão de tempo real e de GPU</td></tr>
    <tr><td>Bicúbica</td><td>16</td><td>Nítido, pode gerar halo</td><td>Ampliação de fotos, edição offline</td></tr>
    <tr><td>Lanczos</td><td>36+</td><td>Melhor preservação de detalhe</td><td>Redimensionamento de alta qualidade</td></tr>
  </tbody>
</table>
</div>
<p>Um caso decide sozinho a escolha: ao transformar uma <strong>máscara de segmentação</strong>, em que cada valor é
um identificador de classe, qualquer interpolação suave cria rótulos inexistentes, a média entre a classe 2 e a
classe 4 vira "classe 3", que pode ser outro órgão. Nesse cenário, vizinho mais próximo não é o método pior: é o
único correto.</p>

<h2 id="3d">Estendendo para 3D</h2>
<p>Tudo se repete com matrizes 4&times;4 e pontos (x, y, z, 1). Escala e translação são análogas diretas; rotação
ganha três matrizes básicas (uma por eixo), e a composição delas em ângulos de Euler sofre de <em>gimbal lock</em> —
motivo pelo qual motores gráficos representam orientação com <strong>quatérnions</strong> e convertem para matriz
apenas na hora de desenhar.</p>

<hr>
<p><strong>No próximo artigo:</strong> a transformação que projeta 3D em 2D e o modelo que descreve qualquer câmera real.</p>
`
},
/* ------------------------------------------------------------------ 6 */
{
  slug: "modelos-camera",
  draft: true,          // oculto: remova esta linha para publicar
  title: "Modelos de câmera: pinhole, calibração e visão estéreo",
  lead: "Como um ponto do mundo vira um pixel, e como, a partir de dois pixels, recupera-se a profundidade perdida na projeção.",
  date: "2026-08-21",
  topic: "geometria",
  tags: ["câmera", "projeção", "calibração", "estéreo"],
  image: "assets/img/post-camera.svg",
  alt: "Diagrama de câmera pinhole projetando um objeto sobre o plano de imagem",
  demo: "camera",
  body: `
<p>Uma câmera é uma máquina de perder informação: transforma um mundo tridimensional em uma matriz bidimensional e,
no caminho, descarta a profundidade. Modelar essa perda com precisão é o que permite fazer o caminho de volta, e
esse caminho de volta é o coração da visão computacional geométrica.</p>

<h2 id="pinhole">O modelo pinhole</h2>
<p>O modelo mais simples e mais usado: todos os raios de luz passam por um único ponto (o centro óptico) e atingem o
plano de imagem a uma distância <em>f</em>, a distância focal. Por semelhança de triângulos:</p>
<div class="formula">x = f &middot; X / Z&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y = f &middot; Y / Z</div>
<p>Toda a perspectiva está nessa divisão por <strong>Z</strong>: o mesmo objeto duas vezes mais longe ocupa metade do
tamanho, e retas paralelas convergem para pontos de fuga. Em coordenadas homogêneas, a divisão é justamente o passo
de normalização pela coordenada <em>w</em> que aparecia no artigo anterior, perspectiva é uma transformação
projetiva, não afim.</p>

<h2 id="demo">Brincando com a projeção</h2>
<p>Mova a distância focal e a posição do objeto e observe o efeito <em>dolly zoom</em>: aproximando a câmera e
reduzindo a focal (ou o contrário), o objeto principal mantém o tamanho enquanto o fundo se expande ou comprime.
É a demonstração mais direta de que "zoom" e "aproximar-se" não são a mesma operação.</p>

<div class="demo" data-demo="camera"></div>

<h2 id="intrinsecos">Parâmetros intrínsecos e extrínsecos</h2>
<p>A projeção completa de um ponto do mundo até o pixel é o produto de duas matrizes:</p>
<div class="formula">p = K &middot; [ R | t ] &middot; P<sub>mundo</sub></div>
<p><strong>Extrínsecos [R | t]</strong>, 6 graus de liberdade: onde a câmera está e para onde aponta. Levam o ponto
do sistema de coordenadas do mundo para o da câmera.</p>
<p><strong>Intrínsecos K</strong>, propriedades internas, independentes de posição:</p>
<pre><code>K = [ fx   s   cx ]
    [  0  fy   cy ]
    [  0   0    1 ]</code></pre>
<ul>
  <li><code>fx, fy</code>, distância focal em <em>pixels</em>. Diferem quando os fotossítios não são quadrados.</li>
  <li><code>cx, cy</code>, ponto principal: onde o eixo óptico fura o sensor. Raramente é o centro exato da imagem.</li>
  <li><code>s</code>, skew, não-ortogonalidade dos eixos do sensor. Zero em praticamente qualquer câmera moderna.</li>
</ul>

<h2 id="distorcao">Distorção: onde o modelo pinhole falha</h2>
<p>Lentes reais curvam raios. A distorção radial é modelada por um polinômio no raio <code>r</code> a partir do
centro:</p>
<div class="formula">x<sub>corr</sub> = x (1 + k<sub>1</sub>r² + k<sub>2</sub>r⁴ + k<sub>3</sub>r⁶)</div>
<p>Com <code>k1</code> negativo tem-se distorção em barril (grande-angular, GoPro); positivo, almofada (teleobjetiva).
Sem corrigir isso, retas do mundo aparecem curvas na imagem, e qualquer medida geométrica extraída dali fica errada,
com erro crescendo em direção às bordas.</p>

<h2 id="calibracao">Calibração: descobrindo K na prática</h2>
<p>O método de Zhang, padrão desde 2000, é notavelmente acessível:</p>
<ol>
  <li>Imprima um tabuleiro de xadrez e cole-o numa superfície rígida e plana.</li>
  <li>Fotografe-o em 15 a 20 orientações bem variadas, inclinações diferentes cobrindo todo o quadro.</li>
  <li>Detecte os cantos com precisão subpixel (a geometria conhecida do tabuleiro fornece a verdade de referência).</li>
  <li>Resolva o sistema para K, distorção e a pose de cada foto, minimizando o <strong>erro de reprojeção</strong>.</li>
</ol>
<div class="callout">
  <span class="ico">📐</span>
  <div>
    <span class="callout-title">O número que diz se deu certo</span>
    <p>O erro de reprojeção médio é a distância, em pixels, entre onde o canto foi detectado e onde o modelo calibrado
    diz que ele deveria estar. Abaixo de 0,5 px indica calibração confiável; acima de 1 px, algo está errado —
    normalmente poses pouco variadas ou o tabuleiro não estar realmente plano.</p>
  </div>
</div>

<h2 id="estereo">Visão estéreo: recuperando o Z</h2>
<p>Uma câmera perde a profundidade; duas a recuperam. Com duas câmeras paralelas separadas por uma linha de base
<em>b</em>, um mesmo ponto do mundo aparece em posições horizontais diferentes nas duas imagens. Essa diferença é a
<strong>disparidade</strong>:</p>
<div class="formula">Z = f &middot; b / d&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;( d = x<sub>esq</sub> - x<sub>dir</sub> )</div>
<p>A relação é inversa: objetos próximos têm disparidade grande, distantes têm disparidade pequena. Duas consequências
práticas saem direto da fórmula, a precisão cai com o <em>quadrado</em> da distância, e aumentar a linha de base
melhora a precisão ao longe mas piora o campo comum às duas câmeras.</p>
<p>O trabalho difícil é o <strong>problema de correspondência</strong>: dado um ponto na imagem esquerda, achar o
mesmo ponto na direita. A <strong>geometria epipolar</strong> reduz drasticamente a busca, o correspondente está
necessariamente sobre uma reta (a linha epipolar), e após retificar as imagens essa reta vira a mesma linha
horizontal. Uma busca 2D vira 1D. Ainda assim, regiões sem textura (uma parede branca) permanecem ambíguas, motivo
pelo qual sensores de profundidade ativos <em>projetam</em> um padrão para criar textura artificial.</p>

<h2 id="onde">Onde isso aparece</h2>
<ul>
  <li><strong>Realidade aumentada</strong>, estimar a pose da câmera a cada quadro para ancorar objetos virtuais.</li>
  <li><strong>Fotogrametria</strong>, reconstruir modelos 3D de construções ou terrenos a partir de fotos.</li>
  <li><strong>Endoscopia estéreo</strong>, medir distâncias reais dentro do corpo durante cirurgia.</li>
  <li><strong>Veículos autônomos</strong>, câmeras estéreo estimam profundidade densa complementando o LiDAR.</li>
</ul>

<hr>
<p><strong>No próximo artigo:</strong> da geometria para a radiometria, o que é, afinal, a cor que preenche cada pixel.</p>
`
},

/* ------------------------------------------------------------------ 7 */
{
  slug: "luz-e-cor",
  draft: true,          // oculto: remova esta linha para publicar
  title: "Luz e cor: do espectro contínuo aos três números do pixel",
  lead: "A cor não está no objeto nem na luz: é uma construção do sistema visual. Entender isso explica por que RGB é péssimo para segmentar, por que HSV existe e por que gamma nunca vai embora.",
  date: "2026-08-25",
  topic: "radiometria",
  tags: ["cor", "RGB", "HSV", "gamma", "percepção"],
  image: "assets/img/post-cor.svg",
  alt: "Prisma decompondo luz branca em espectro ao lado de círculos RGB sobrepostos",
  demo: "cores",
  body: `
<p>A luz visível é radiação eletromagnética entre aproximadamente 380 e 750 nm, e cada feixe carrega uma
<strong>distribuição espectral contínua</strong>, energia em cada comprimento de onda. Mas a retina humana tem
apenas três tipos de cone (S, M e L, com picos no azul, verde e vermelho). Um espectro inteiro é comprimido em três
números logo na entrada do sistema visual.</p>

<h2 id="metamerismo">Metamerismo: o bug que virou indústria</h2>
<p>Como três receptores não conseguem distinguir infinitos espectros, existem espectros fisicamente diferentes que
produzem estímulo idêntico nos cones. São os <strong>metâmeros</strong>, e é por causa deles que a tela à sua frente
funciona. O amarelo de um limão é um espectro contínuo em torno de 570 nm; o amarelo da tela é vermelho e verde
acesos simultaneamente, sem nenhuma energia em 570 nm. Fisicamente nada a ver; perceptualmente, iguais.</p>
<div class="callout">
  <span class="ico">💡</span>
  <div>
    <span class="callout-title">Consequência prática</span>
    <p>Duas tintas metâmeras sob luz de loja podem parecer idênticas e diferentes sob o sol, o metamerismo depende
    do iluminante. É por isso que controle de cor industrial especifica o iluminante junto com a cor.</p>
  </div>
</div>

<h2 id="rgb">RGB e suas limitações</h2>
<p>O modelo RGB é aditivo e mapeia direto no hardware: três canais, um por primária do display. Simples de armazenar
e de exibir, mas ruim para <em>raciocinar</em> sobre cor. O problema central é que os três canais são todos
correlacionados com o brilho: ao entrar uma sombra, os três caem juntos. Como "a cor do objeto" e "quanta luz bate
nele" estão misturados nos mesmos números, segmentar por cor em RGB quebra assim que a iluminação varia.</p>

<h2 id="hsv">HSV/HSL: separando cromaticidade de intensidade</h2>
<ul>
  <li><strong>H (matiz)</strong>, o ângulo no círculo cromático (0-360°): a identidade da cor.</li>
  <li><strong>S (saturação)</strong>, quão pura versus acinzentada.</li>
  <li><strong>V (valor)</strong>, o brilho.</li>
</ul>
<p>A vantagem é imediata: sob sombra, um objeto vermelho muda muito de V mas pouco de H. Segmentar por faixa de matiz
é dramaticamente mais robusto do que por faixa de RGB, e é o método básico de rastreamento por cor.</p>
<p>Duas armadilhas, no entanto: o matiz é <strong>circular</strong> (0° e 359° são vizinhos, então médias e limiares
ingênuos falham na faixa do vermelho), e ele se torna instável quando a saturação é baixa, o matiz de um cinza é
essencialmente ruído numérico.</p>

<h2 id="demo">Decompondo e manipulando</h2>
<p>A demo separa os canais nos dois espaços e permite rotacionar o matiz, alterar a saturação e ver como cada operação
se comporta. Compare o efeito de mexer no brilho em RGB (que dessatura) com fazê-lo em HSV.</p>

<div class="demo" data-demo="cores"></div>

<h2 id="espacos">Outros espaços que valem conhecer</h2>
<div class="table-scroll">
<table>
  <thead><tr><th>Espaço</th><th>Componentes</th><th>Uso</th></tr></thead>
  <tbody>
    <tr><td>CMYK</td><td>Ciano, magenta, amarelo, preto</td><td>Impressão, subtrativo; gamute menor que o RGB</td></tr>
    <tr><td>YCbCr</td><td>Luma + 2 crominâncias</td><td>JPEG e vídeo, permite subamostrar cor (4:2:0) sem perda visível</td></tr>
    <tr><td>CIE XYZ</td><td>Primárias imaginárias</td><td>Referência absoluta; base de toda conversão entre espaços</td></tr>
    <tr><td>CIE L*a*b*</td><td>Luminosidade + 2 eixos opostos</td><td>Perceptualmente uniforme: distância euclidiana ≈ diferença percebida</td></tr>
  </tbody>
</table>
</div>
<p>O L*a*b* merece destaque: em RGB, a distância numérica entre duas cores não corresponde à diferença que se vê.
Em L*a*b*, corresponde razoavelmente, motivo pelo qual algoritmos de quantização de cores, agrupamento e cálculo de
diferença (ΔE) trabalham nele.</p>

<h2 id="gamma">Gamma: a correção que todo mundo esquece</h2>
<p>Valores de pixel em imagens comuns <strong>não são proporcionais à luz</strong>. Eles estão codificados com uma
não-linearidade de aproximadamente <code>V<sup>2,2</sup></code>, herdada dos monitores CRT e mantida porque casa
convenientemente com a sensibilidade não-linear do olho, distribuindo melhor os 256 níveis nas sombras.</p>
<div class="formula">L<sub>linear</sub> &asymp; ( V<sub>codificado</sub> / 255 )<sup>2,2</sup></div>
<p>Isso quebra silenciosamente operações que assumem linearidade. Somar duas imagens, calcular uma média para
redimensionar ou fazer blending alfa sobre valores com gamma dá resultados perceptivelmente errados, o clássico é
o desfoque que escurece a imagem, ou a borda escura em torno de objetos claros compostos sobre fundo escuro.
O procedimento correto é: <strong>linearizar &rarr; operar &rarr; recodificar</strong>.</p>

<h2 id="constancia">Constância de cor</h2>
<p>Uma folha branca parece branca sob sol, sob lâmpada incandescente amarelada e sob LED frio, embora o espectro que
chega ao olho seja radicalmente diferente nos três casos. O cérebro desconta o iluminante. Câmeras tentam imitar isso
com <em>balanço de branco</em>, e algoritmos como Gray World (assume que a média da cena é cinza) ou White Patch
(assume que o pixel mais claro é branco) fazem essa estimativa automaticamente, com as falhas previsíveis quando a
cena viola a hipótese, como uma foto predominantemente verde de uma floresta.</p>

<hr>
<p><strong>No próximo artigo:</strong> deixamos de analisar imagens capturadas e passamos a <em>sintetizá-las</em>.</p>
`
},

/* ------------------------------------------------------------------ 8 */
{
  slug: "pipeline-grafico",
  draft: true,          // oculto: remova esta linha para publicar
  title: "O pipeline gráfico: da malha de triângulos ao pixel na tela",
  lead: "Sessenta vezes por segundo, milhões de vértices atravessam uma sequência fixa de estágios. Entender essa sequência é entender por que jogos são rápidos e por que certas coisas são caras.",
  date: "2026-08-28",
  topic: "sintese",
  tags: ["pipeline", "rasterização", "shaders", "z-buffer", "GPU"],
  image: "assets/img/post-pipeline.svg",
  alt: "Diagrama dos estágios do pipeline gráfico, de vértices a pixels sombreados",
  demo: "pipeline",
  featured: true,
  body: `
<p>Os artigos anteriores partiram de uma imagem existente. Agora o caminho é o inverso: partir de uma descrição
matemática de uma cena e <strong>produzir</strong> a imagem. O pipeline gráfico é a sequência padronizada de estágios
que faz isso, e sua estrutura explica boa parte das decisões de desempenho em aplicações interativas.</p>

<h2 id="estagios">Os estágios</h2>
<ol>
  <li><strong>Entrada de vértices</strong>, a geometria chega como listas de posições, normais, coordenadas de
  textura e índices, já residentes na memória da GPU.</li>
  <li><strong>Vertex shader</strong>, programável, executa uma vez por vértice. Sua tarefa central é aplicar a
  transformação MVP e levar o vértice ao espaço de recorte.</li>
  <li><strong>Montagem e recorte</strong>, vértices viram triângulos; o que está fora do frustum é cortado.</li>
  <li><strong>Divisão perspectiva e viewport</strong>, divide-se por <em>w</em> (aqui nasce a perspectiva) e mapeia-se
  para coordenadas de pixel.</li>
  <li><strong>Back-face culling</strong>, descarta triângulos de costas para a câmera, em um objeto
  fechado, metade ou mais da malha, por um simples teste de sinal de área.</li>
  <li><strong>Rasterização</strong>, fixo em hardware: determina quais pixels cada triângulo cobre e interpola os
  atributos dos vértices por coordenadas baricêntricas.</li>
  <li><strong>Fragment shader</strong>, programável, executa uma vez por fragmento. Calcula a cor final: texturas,
  iluminação, sombras.</li>
  <li><strong>Testes por fragmento</strong>, profundidade (z-buffer), stencil, blending; o sobrevivente é escrito.</li>
</ol>
<div class="formula">v<sub>clip</sub> = M<sub>projeção</sub> &middot; M<sub>visão</sub> &middot; M<sub>modelo</sub> &middot; v<sub>objeto</sub></div>

<h2 id="demo">Um rasterizador em software</h2>
<p>A demo abaixo implementa esse caminho inteiro em JavaScript, sem WebGL: transformação de vértices, projeção
perspectiva, culling, z-buffer e sombreamento. É lenta comparada à GPU, e essa lentidão é justamente a lição sobre
por que o hardware dedicado existe.</p>

<div class="demo" data-demo="pipeline"></div>

<h2 id="zbuffer">Z-buffer: a solução que venceu</h2>
<p>Determinar o que está na frente já foi feito ordenando polígonos por profundidade (algoritmo do pintor), mas isso
falha em interseções e em ciclos de oclusão, além de custar uma ordenação por quadro. O <strong>z-buffer</strong>
resolve por fragmento: guarda-se a profundidade de cada pixel e só se escreve quando o novo fragmento está mais perto.
É O(1) por fragmento, independe da ordem de desenho e cabe em hardware, por isso é universal.</p>
<div class="callout">
  <span class="ico">🎚️</span>
  <div>
    <span class="callout-title">Z-fighting e o plano near</span>
    <p>A profundidade armazenada não é linear: a precisão se concentra perto da câmera. Definir o plano <em>near</em>
    muito próximo de zero desperdiça quase toda a precisão disponível e faz superfícies coplanares distantes piscarem
    (<em>z-fighting</em>). Afastar o near costuma resolver mais do que aumentar os bits do buffer.</p>
  </div>
</div>

<h2 id="iluminacao">Modelos de sombreamento</h2>
<p>O modelo de Phong decompõe a resposta da superfície em três termos:</p>
<div class="formula">I = k<sub>a</sub>I<sub>a</sub> + k<sub>d</sub>I<sub>d</sub>(N&middot;L) + k<sub>s</sub>I<sub>s</sub>(R&middot;V)<sup>n</sup></div>
<p>O que muda muito o resultado é <em>onde</em> ele é avaliado:</p>
<div class="table-scroll">
<table>
  <thead><tr><th>Sombreamento</th><th>Avaliado</th><th>Resultado</th></tr></thead>
  <tbody>
    <tr><td>Flat</td><td>Uma vez por face</td><td>Facetas visíveis; barato</td></tr>
    <tr><td>Gouraud</td><td>Por vértice, interpolando cor</td><td>Suave, mas perde brilhos especulares pequenos</td></tr>
    <tr><td>Phong</td><td>Por fragmento, interpolando normais</td><td>Brilhos corretos; padrão atual</td></tr>
  </tbody>
</table>
</div>
<p>Renderizadores modernos substituíram os coeficientes empíricos de Phong por <strong>PBR</strong> (renderização
baseada em física), com parâmetros de significado físico, <em>albedo</em>, <em>metallic</em>, <em>roughness</em>, e
funções que conservam energia. A vantagem prática é que o mesmo material se comporta corretamente sob qualquer
iluminação, sem reajuste manual.</p>

<h2 id="tempo-real">Tempo real x offline</h2>
<div class="table-scroll">
<table>
  <thead><tr><th></th><th>Rasterização (tempo real)</th><th>Ray tracing (offline)</th></tr></thead>
  <tbody>
    <tr><td>Pergunta</td><td>Quais pixels este triângulo cobre?</td><td>O que este raio atinge?</td></tr>
    <tr><td>Orçamento</td><td>~16 ms por quadro</td><td>Minutos a horas por quadro</td></tr>
    <tr><td>Reflexos e sombras</td><td>Aproximações (mapas, SSR)</td><td>Naturalmente corretos</td></tr>
    <tr><td>Iluminação indireta</td><td>Pré-computada ou aproximada</td><td>Simulada por transporte de luz</td></tr>
  </tbody>
</table>
</div>
<p>A fronteira se dissolveu: GPUs atuais têm unidades dedicadas a interseção raio-triângulo, e o padrão virou híbrido
— rasterizar a visibilidade primária e traçar raios apenas para reflexos, sombras e oclusão, com <em>denoising</em>
por rede neural compensando a baixa quantidade de amostras. Reconstruir sinal a partir de poucas amostras ruidosas é,
novamente, processamento de imagem: o pipeline termina onde este blog começou.</p>

<hr>
<p><strong>No próximo artigo:</strong> o último, o que essas técnicas significam quando saem da tela e entram em um
diagnóstico ou em um processo judicial.</p>
`
},

/* ------------------------------------------------------------------ 9 */
{
  slug: "medicina-seguranca-etica",
  title: "Senso crítico: computação visual em medicina, segurança e o limite da manipulação",
  lead: "Onde as técnicas dos artigos anteriores encontram consequências reais, e por que “realçar” uma imagem nunca é uma operação neutra.",
  date: "2026-09-01",
  topic: "aplicacoes",
  tags: ["medicina", "segurança", "ética", "aplicações"],
  image: "assets/img/post-aplicacoes.svg",
  alt: "Corte tomográfico com região segmentada em destaque ao lado de um histograma com limiar",
  demo: "limiar",
  body: `
<p>Um filtro que borra uma foto de férias é inconsequente. O mesmo filtro aplicado a uma mamografia, a um exame de
retina ou a uma imagem de perícia participa de decisões sobre tratamento e sobre liberdade. Este artigo fecha a
série olhando para o que muda quando o resultado sai da tela.</p>

<h2 id="medicina">Medicina: realçar sem inventar</h2>
<p>As técnicas dos artigos anteriores reaparecem quase todas em imagem médica:</p>
<ul>
  <li><strong>Transformações de intensidade</strong>, o <em>windowing</em> em tomografia mapeia uma faixa estreita
  de unidades Hounsfield para a tela. Trocar a janela muda completamente o que é visível: tecido mole, osso ou pulmão.</li>
  <li><strong>Filtragem</strong>, redução de ruído permite tomografias com dose de radiação menor, um ganho clínico
  direto. Ultrassom depende de filtros de speckle.</li>
  <li><strong>Segmentação</strong>, delimitar um tumor define o volume que entra no planejamento de radioterapia.
  Um erro de contorno é um erro de dose.</li>
  <li><strong>Registro</strong>, alinhar exames de datas ou modalidades diferentes (PET com RM) é o que permite
  medir evolução ao longo do tempo.</li>
  <li><strong>Reconstrução 3D</strong>, a própria tomografia é um problema inverso: a imagem não é capturada, é
  <em>calculada</em> a partir de projeções em muitos ângulos.</li>
</ul>

<h2 id="demo">Limiarização e a fragilidade de um número</h2>
<p>A demo simula um corte tomográfico e aplica limiarização com histograma ao lado. Deslize o limiar e observe a área
segmentada crescer e encolher continuamente: <strong>não existe um valor obviamente correto</strong>. Compare com o
limiar automático de Otsu, que maximiza a separação entre as duas classes de intensidade.</p>

<div class="demo" data-demo="limiar"></div>

<p>A lição vale para além do exemplo. Em uma imagem real, ruído, artefatos de movimento e variação entre equipamentos
fazem o limiar "certo" mudar de exame para exame. Por isso métodos clínicos exigem validação contra anotação de
especialista, e por isso o número que importa não é a acurácia média, mas o comportamento nos casos difíceis.</p>

<h2 id="seguranca">Segurança e o risco do falso positivo</h2>
<p>Sistemas biométricos e de vigilância usam a mesma caixa de ferramentas, detecção de bordas para extrair minúcias
de impressão digital, descritores locais para reconhecimento facial, transformações geométricas para normalizar pose.
A diferença está no custo do erro, que é assimétrico e não recai sobre quem opera o sistema.</p>
<div class="callout">
  <span class="ico">⚖️</span>
  <div>
    <span class="callout-title">Taxas de erro têm nome e dono</span>
    <p>Um sistema com 99% de acurácia aplicado a 100 mil pessoas produz cerca de mil erros. Se a base de treinamento
    não representa igualmente todos os grupos, esses erros se concentram, e há registro de detenções indevidas
    decorrentes disso. Reportar apenas a métrica agregada esconde exatamente a informação que importa.</p>
  </div>
</div>

<h2 id="pericia">Perícia: melhorar não é revelar</h2>
<p>Existe uma distinção técnica que a ficção destruiu. Interpolar uma imagem de 40&times;40 pixels para 1000&times;1000
não recupera informação, a informação não está lá. Ferramentas generativas de super-resolução vão além: elas
<strong>sintetizam</strong> detalhes plausíveis a partir do que aprenderam, produzindo um rosto nítido que pode não
ser o rosto de ninguém presente na cena original.</p>
<p>Daí a fronteira usada em contexto forense: são aceitáveis operações <strong>reversíveis e documentáveis</strong>
que apenas tornam visível o que já estava registrado, ajuste de contraste, correção de gamma, deconvolução com
parâmetros declarados. Não são aceitáveis operações que <em>criam</em> conteúdo. E qualquer processamento exige
cadeia de custódia: preserva-se o original, registra-se cada passo e o resultado é reproduzível por terceiros.</p>

<h2 id="sintese">Do outro lado: quando a síntese é o problema</h2>
<p>O mesmo pipeline gráfico e as mesmas redes que geram imagens realistas produzem <em>deepfakes</em>. A detecção
recorre, apropriadamente, às ferramentas desta disciplina: análise espectral que revela assinaturas de upsampling
no domínio da frequência, inconsistências de iluminação entre regiões, ruído de sensor (PRNU) ausente ou uniforme
demais, e artefatos de compressão que não batem com a história declarada do arquivo.</p>
<p>É uma corrida de gato e rato em que nenhum detector é definitivo. Por isso o esforço se desloca para a
<strong>proveniência</strong>: assinar criptograficamente a origem e o histórico de edição de um arquivo, como
propõe o padrão C2PA. Autenticidade deixa de ser algo detectado na imagem e passa a ser algo atestado sobre ela.</p>

<h2 id="fechamento">O que fica</h2>
<p>Nove artigos depois, o percurso se fecha. Vimos um sinal contínuo virar grade de números, ser filtrado no espaço e
na frequência, ter suas bordas extraídas, ser reposicionado por matrizes, ser projetado por um modelo de câmera,
ganhar cor com sentido perceptual e, por fim, ser sintetizado do zero pelo pipeline gráfico.</p>
<p>O fio que costura tudo isso não é a matemática, é uma pergunta que reaparece em cada etapa: <strong>o que estou
descartando e o que estou inventando?</strong> Amostrar descarta frequências. Quantizar descarta níveis. Filtrar
descarta detalhe ou o realça acima do que o dado sustenta. Interpolar inventa valores intermediários. Renderizar
inventa a imagem inteira.</p>
<p>Saber operar as ferramentas é a parte ensinável. Saber o que cada operação custa em informação, e ter honestidade
para declará-lo quando a imagem vai embasar uma decisão sobre a vida de alguém, é a parte que a disciplina chama de
senso crítico, e é a que sobrevive à próxima mudança de tecnologia.</p>
`
}
];

