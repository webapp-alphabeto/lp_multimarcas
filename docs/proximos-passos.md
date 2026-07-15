# Leitura do projeto e próximos passos

Atualizado em: 2026-07-15

## Visão geral

Este repositório é uma landing page estática da Alphabeto Multimarcas. Não há build local, framework JavaScript ou `package.json`; o deploy deve publicar os arquivos diretamente a partir da raiz do repositório.

Arquivos principais:

- `index.html`: entrada inicial. Detecta a largura da tela e redireciona para a versão mobile ou desktop.
- `index-mobile.html`: página mobile.
- `index-desktop.html`: página desktop.
- `styles-mobile.css`: estilos da versão mobile.
- `styles-dektop.css`: estilos da versão desktop. O nome está escrito como `dektop`, e o HTML desktop usa exatamente esse nome.
- `scripts.js`: carrossel, expansão de blocos, validação do formulário, carregamento de UF/cidade via IBGE e envio do prospect para a API externa.
- `img/`: imagens locais usadas pela landing page.

## Alterações realizadas

### 2026-07-15 — Campo de faturamento médio

Foi adicionado o campo obrigatório `Faturamento médio` nos formulários mobile e desktop.

Opções do dropdown:

- Até R$ 20.000;
- De R$ 20.000 a R$ 50.000;
- De R$ 50.000 a R$ 100.000;
- Acima de R$ 100.000.

O valor selecionado é enviado no payload da API de prospect usando o campo:

- `faturamento_mensal`

## Hospedagem e deploy

O histórico do projeto indica que ele já foi hospedado na Azure e depois migrado para Netlify.

No repositório ainda existe o workflow legado:

- `.github/workflows/azure-static-web-apps-delightful-desert-0d0b88f0f.yml`

Esse workflow usa `Azure/static-web-apps-deploy@v1` e dispara em push/PR na branch `main`. Como a hospedagem atual foi migrada para Netlify, esse arquivo deve ser tratado como legado da hospedagem anterior, a menos que ainda exista algum uso ativo na Azure.

Não há configuração Netlify versionada no repositório:

- Não existe `netlify.toml`.
- Não existe pasta `.netlify/`.
- Não existem arquivos `_redirects` ou `_headers`.

Com isso, a configuração atual do Netlify provavelmente está feita diretamente no painel do Netlify, conectado ao GitHub, usando:

- branch: `main`;
- publish directory: raiz do repositório (`/` ou `.`);
- build command: vazio/nenhum.

Esses pontos ainda precisam ser confirmados no painel do Netlify se for necessário garantir o fluxo de produção.

## Integrações externas

O site carrega:

- Google Tag Manager: `GTM-NH8P7SBJ`;
- fontes externas do Google Fonts;
- Font Awesome via CDN;
- imagens remotas hospedadas no Google Cloud Storage;
- vídeo incorporado do YouTube;
- API do IBGE para estados e cidades;
- API de prospect:
  - `https://alphabeto.geovendas.app/IBTech_VirtualAge/rest/prospect/external`

O envio do formulário monta um payload com nome fantasia, e-mail, celular, Instagram, cidade por código IBGE, CNPJ e token Base64.

## Validação local feita

O site foi servido localmente com `python3 -m http.server` e os arquivos principais responderam:

- `/`: `200 OK`;
- `/index-mobile.html`: `200 OK`;
- `/index-desktop.html`: `200 OK`;
- `/scripts.js`: `200 OK`.

Foram encontrados recursos locais referenciados que não existem no repositório:

- `./fonts/futura.woff2`;
- `./fonts/futura.woff`;
- `./fonts/futura.ttf`;
- `./img/estrelas.png`.

Esses recursos geram `404` quando solicitados. O site ainda pode funcionar com fallback de fonte/imagem, mas o ideal é corrigir para evitar ruído no deploy e diferenças visuais.

## Pontos de atenção

1. O workflow da Azure pode confundir manutenção futura ou até continuar executando se os secrets antigos ainda existirem.
2. A configuração real do Netlify não está no código, então uma pessoa nova no projeto não consegue confirmar o deploy apenas pelo repositório.
3. Há referências CSS para fontes e imagem inexistentes.
4. O arquivo `README.md` está em UTF-16 e tem conteúdo mínimo; pode ser melhor substituí-lo por uma documentação simples em UTF-8.
5. Os HTMLs são grandes e têm SVG/base64 embutido; isso dificulta manutenção manual.
6. O `scripts.js` contém lógica duplicada de carrossel em escopo global e dentro do `DOMContentLoaded`. Funciona no cenário atual porque o script é carregado no fim da página, mas vale limpar em uma próxima melhoria.

## Próximos passos recomendados

1. Confirmar no painel do Netlify:
   - site conectado ao repositório `webapp-alphabeto/lp_multimarcas`;
   - branch de produção `main`;
   - publish directory raiz;
   - build command vazio;
   - URL/domínio atual de produção.

2. Depois de confirmar que o Netlify é o único deploy ativo, decidir se o workflow legado da Azure deve ser removido ou desabilitado.

3. Adicionar um `netlify.toml` simples para deixar a configuração de deploy versionada, se fizer sentido para o time. Exemplo esperado para site estático:

   ```toml
   [build]
     publish = "."
     command = ""
   ```

4. Corrigir recursos ausentes:
   - adicionar os arquivos da fonte Futura em `fonts/`, se a marca exigir essa fonte local;
   - ou remover o `@font-face` e usar apenas fontes externas/fallback;
   - adicionar `img/estrelas.png` ou ajustar o CSS para usar a imagem existente correta.

5. Atualizar o `README.md` para UTF-8 com:
   - descrição do projeto;
   - fluxo GitHub → Netlify;
   - como testar localmente;
   - principais integrações externas;
   - cuidados antes de publicar.

6. Fazer uma validação visual em mobile e desktop depois de qualquer ajuste, conferindo:
   - redirecionamento inicial;
   - carrossel;
   - formulário;
   - carregamento de UF/cidade;
   - envio para API externa;
   - eventos do Google Tag Manager, se aplicável.
