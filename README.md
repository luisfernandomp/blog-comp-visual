# Pixel & Luz, blog de Computação Visual

Blog estático sobre **Computação Visual**, Ciência da Computação, Faculdade de
Computação e Informática, Universidade Presbiteriana Mackenzie. Professor André Kishimoto,
7ª etapa, 2º semestre de 2026.

**Tema escolhido:** *Da captura ao render, a jornada de um pixel*. Em vez de tratar cada item da
ementa isoladamente, os nove artigos seguem o caminho da informação visual: um sinal contínuo é
amostrado e quantizado, filtrado no espaço e na frequência, tem seus aspectos detectados, é
reposicionado por transformações geométricas, projetado por um modelo de câmera, interpretado como
cor e, por fim, sintetizado do zero pelo pipeline gráfico. O último artigo fecha o percurso com a
discussão de senso crítico exigida pelo plano de ensino (medicina, segurança e perícia).

Cada artigo traz uma **demonstração interativa** que executa o algoritmo de verdade, em `canvas`,
no navegador do leitor.

## Artigos

| # | Artigo | Item do plano de ensino | Demo |
|---|--------|-------------------------|------|
| 1 | Do fóton ao pixel | 1.1 / 1.2 Aspectos e técnicas básicas | amostragem e quantização |
| 2 | Convolução | 2.1 Convolução e filtragem espacial | bancada de kernels + ruído |
| 3 | Domínio da frequência | 2.2 Filtragem no domínio da frequência | DFT 2D com filtro por raio |
| 4 | Detecção de bordas | 2.3 Detecção de aspectos | Sobel / Prewitt / Roberts / Laplaciano |
| 5 | Transformações geométricas | 3.1 Transformações geométricas | composição de matrizes 3×3 |
| 6 | Modelos de câmera | 3.2 Modelos de câmeras | projeção pinhole e dolly zoom |
| 7 | Luz e cor | 4.1 / 4.2 Luz e reprodução de cores | canais RGB e HSV |
| 8 | O pipeline gráfico | 5.1 / 5.2 Pipeline gráfico interativo | rasterizador em software |
| 9 | Senso crítico | Aplicações em medicina e segurança | limiarização e Otsu |

## Estrutura

```
index.html          página única; carrega os três scripts na ordem
404.html            devolve endereços desconhecidos para a raiz
css/style.css       tokens de tema, layout e componentes
js/posts.js         conteúdo: SITE, TOPICS e POSTS (HTML de cada artigo)
js/demos.js         as nove demonstrações em canvas, sem dependências
js/app.js           roteador por hash, renderização e interações
assets/img/*.svg    ilustrações autorais (uma por artigo) e identidade visual
```

Sem framework, sem etapa de build e sem dependências externas além da fonte do Google Fonts.

## URLs

A navegação usa **roteamento por hash**, então cada página tem endereço próprio e compartilhável,
sem nenhuma configuração de servidor:

```
#/                          início
#/artigos                   lista completa       #/artigos?q=fourier  busca
#/topicos                   índice de eixos      #/topico/geometria   um eixo
#/tag/convolução            por etiqueta
#/trilha                    ordem de leitura
#/sobre                     sobre e bibliografia
#/post/imagem-digital       um artigo
#/post/pipeline-grafico~zbuffer   artigo, direto em uma seção
```

## Rodando localmente

Abrir `index.html` direto no navegador funciona. Para ficar idêntico ao ambiente publicado,
sirva por HTTP:

```bash
python -m http.server 8080
# depois: http://localhost:8080
```

## Publicando no GitHub Pages

```bash
git add -A
git commit -m "Blog de Computação Visual"
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
branch `main`, pasta `/ (root)`. O site fica em
`https://<usuario>.github.io/<repositorio>/`.

Todos os caminhos são relativos, então o site funciona igualmente na raiz de um domínio ou em
subpasta. O arquivo `.nojekyll` desliga o processamento do Jekyll, desnecessário aqui.

## Adicionando um artigo

Acrescente um objeto ao final do array `window.POSTS`, em `js/posts.js`:

```js
{
  slug:  "novo-artigo",              // vira #/post/novo-artigo
  title: "Título do artigo",
  lead:  "Uma ou duas frases de resumo.",
  date:  "2026-09-15",               // AAAA-MM-DD
  topic: "imagem",                   // id existente em window.TOPICS
  tags:  ["etiqueta-1", "etiqueta-2"],
  image: "assets/img/post-novo.svg",
  alt:   "Descrição da ilustração para leitores de tela.",
  demo:  "convolucao",               // opcional; nome definido em js/demos.js
  body:  `<p>HTML do texto. Use <h2 id="secao">…</h2> para entrar no sumário.</p>
          <div class="demo" data-demo="convolucao"></div>`
}
```

O tempo de leitura, o sumário, a paginação anterior/próximo, as etiquetas e a listagem por
tópico são gerados automaticamente. A ordem do array define a trilha de leitura; a listagem de
artigos ordena por data.

---

Textos, ilustrações e código por **Luis Fernando**, para a disciplina de Computação Visual.
