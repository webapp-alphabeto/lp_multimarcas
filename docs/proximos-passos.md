# Leitura do projeto e próximos passos

Atualizado em: 2026-07-20

## Visão geral

Este repositório é uma landing page estática da Alphabeto Multimarcas. Não há build local, framework JavaScript ou `package.json`; o deploy deve publicar os arquivos diretamente a partir da raiz do repositório.

Arquivos principais:

- `index.html`: página única responsiva da LP.
- `styles.css`: estilos desktop e ajustes mobile em `@media (max-width: 768px)`.
- `scripts.js`: carrossel, expansão de blocos, validação do formulário, carregamento de UF/cidade via IBGE e envio do prospect para a API externa.
- `netlify/functions/receive-prospect.js`: proxy seguro da LP para o webhook CRM GEOvendas/IBTech.
- `_redirects`: redirects legados do Netlify para mandar URLs antigas da divisão mobile/desktop de volta para `/`.
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

### 2026-07-15 — Campos dinâmicos de integração

Após conferência da tela de Campos de Integração do Portal GEO, o formulário passou a enviar também as keys dinâmicas cadastradas:

- `faturamento_mensal`: valor selecionado no dropdown de faturamento médio;
- `lead_source`: origem fixa do lead, usando `LP Multimarcas`;
- `loja_fisica`: enviado como `Sim`, pois o formulário exige a cidade da loja física;
- `utm_campaign`: campanha da URL, usando `utm_campaign` quando existir ou `SEM UTM` como fallback;
- `utm_content`: conteúdo da URL, usando `utm_content` quando existir ou `SEM UTM` como fallback;
- `utm_source`: origem da URL, usando `utm_source` quando existir ou `SEM UTM` como fallback.

O payload também passou a enviar o Instagram em duas keys:

- `instagram`;
- `instagram_`.

Isso mantém compatibilidade com o campo antigo e aumenta a chance de mapeamento correto no Portal GEO/IBTech.

Observação histórica: antes da unificação responsiva, o `index.html` redirecionava para páginas separadas mobile/desktop e precisou preservar `querystring` e `hash` para não perder UTMs. Esse redirecionamento foi removido em 2026-07-20.

Também foi melhorado o tratamento de erro do envio: quando a API retorna uma mensagem, como duplicidade de CNPJ/e-mail, o alerta do site passa a exibir a mensagem real em vez de mostrar apenas `Erro ao enviar os dados.`. Para o endpoint novo, o front também exibe `error` quando a resposta usa esse campo em vez de `message`.

### 2026-07-16 — Novo endpoint de webhook CRM

Foi identificado que o envio deve usar o endpoint:

- `https://alphabeto.geovendas.app/geovendas360/api/v1/webhook/crm/receive`

Esse endpoint exige o header:

- `X-Auth-Key`

Testes feitos:

- `OPTIONS` retornou sucesso e liberou `POST`;
- `POST` sem `X-Auth-Key` retornou `401` com mensagem `Header X-Auth-Key ausente`;
- testes com as credenciais antigas do endpoint `/IBTech_VirtualAge/rest/prospect/external` retornaram `Auth key invalida`.
- a Function do Netlify foi testada com chave inválida e repassou o retorno `401` do endpoint novo.
- em 2026-07-17, duas chaves informadas pelo time foram testadas como `X-Auth-Key`; ambas passaram da autenticação e retornaram `400` de validação com a mensagem `Pelo menos um identificador (cnpj, email ou email de contato) e obrigatorio`, confirmando que são chaves aceitas pelo endpoint. Os valores das chaves não devem ser versionados.
- em 2026-07-17, foi feito um envio real de teste usando uma das chaves. O primeiro payload com `cidade` como objeto `{ codIbge: ... }` foi rejeitado porque o webhook espera `cidade` como string. O segundo payload com `cidade` como string foi aceito e retornou `prospectId: 6887`.
- em 2026-07-20, foi testado o modelo de payload com `cnpj_qualified`, `razaoSocial`, `nomeFantasia`, `phone_number`, `whatsapp`, `contatos` e `camposIntegracao`. O primeiro envio falhou apenas por WhatsApp duplicado. O segundo envio, com telefone/WhatsApp únicos e `instagram_` + `faturamento_mensal` dentro de `camposIntegracao`, foi aceito e retornou `prospectId: 6891`.
- em 2026-07-20, foi feito novo envio real de teste com `instagram`, `instagram_` e `faturamento_mensal` dentro de `camposIntegracao`. O webhook aceitou o payload e retornou `prospectId: 6892`.
- em 2026-07-20, foi feito novo envio real de teste com `instagram` no primeiro nível do payload, como no envio antigo da LP, e `instagram_` + `faturamento_mensal` dentro de `camposIntegracao`. O webhook aceitou o payload e retornou `prospectId: 6893`. Esse é o formato adotado na LP.
- em 2026-07-20, foi feito novo envio real de teste com o formato atual da LP: `instagram` no primeiro nível e `instagram_`, `faturamento_mensal`, `utm_campaign`, `utm_content`, `utm_source`, `lead_source` e `loja_fisica` dentro de `camposIntegracao`. O webhook aceitou o payload e retornou `prospectId: 6895`.

Como a landing page é estática e o `X-Auth-Key` não deve ficar exposto no JavaScript público, o envio do formulário foi alterado para chamar uma Function do Netlify:

- `/.netlify/functions/receive-prospect`

A Function encaminha o payload para o endpoint novo da GEOvendas/IBTech usando `X-Auth-Key` obtido da variável de ambiente:

- `GEOVENDAS_WEBHOOK_AUTH_KEY`

Antes de publicar em produção, configurar essa variável no painel do Netlify com a chave correta fornecida pela IBTech.

### 2026-07-20 — Troca das imagens do carrossel

As imagens do carrossel mobile e desktop foram trocadas para arquivos locais da campanha `Lançamento Alto Verão 26`.

Novos arquivos:

- `img/carrossel-alto-verao-26-1.jpeg`;
- `img/carrossel-alto-verao-26-2.jpeg`;
- `img/carrossel-alto-verao-26-3.jpeg`.

Também foi removido um indicador excedente no carrossel mobile, que tinha 4 indicadores para 3 imagens.

### 2026-07-20 — Unificação responsiva da LP

A LP deixou de usar o redirecionamento por JavaScript que dividia a navegação entre `index-mobile.html` e `index-desktop.html`.

Nova estrutura:

- `index.html` passou a conter a página completa;
- `styles.css` passou a concentrar o estilo desktop e os ajustes mobile dentro de `@media (max-width: 768px)`;
- `index-mobile.html`, `index-desktop.html`, `styles-mobile.css` e `styles-dektop.css` foram removidos;
- as UTMs agora permanecem naturalmente na URL raiz, sem depender de redirecionamento;
- o footer mantém layout aberto no desktop e comportamento de acordeão no mobile.

Também foi feita uma limpeza no `scripts.js` para evitar inicialização duplicada do carrossel e para tornar o acordeão do footer compatível com o HTML único.

Foi criado o arquivo `_redirects` para preservar compatibilidade com links antigos:

- `/index-mobile.html` redireciona para `/`;
- `/index-desktop.html` redireciona para `/`.

Durante a validação local, também foi removida a chamada CSS para `img/estrelas.png`, que já não existia no repositório e gerava `404`. A seção usa a imagem real `img/estrelas-forms-removebg-preview.png` quando necessário.

### 2026-07-20 — Correção mobile após unificação

Após a unificação da LP, foram ajustados dois pontos específicos no mobile:

- o carrossel deixou de herdar `height: 93vh` e `overflow: hidden` do desktop, evitando que a imagem começasse cortada/acima da tela;
- o passo a passo deixou de herdar as margens laterais grandes do desktop, evitando deslocamento e corte na parte inferior da seção.

Também foi reforçado no CSS que cada imagem do carrossel ocupa 100% da largura do slide, deixando a navegação por `translateX` consistente.

### 2026-07-20 — Regra de UTMs patrocinadas

O envio do formulário passou a tratar UTMs de forma explícita:

- `utm_campaign`: usa o valor da URL quando existir, ou `SEM UTM` quando não existir;
- `utm_content`: usa o valor da URL quando existir, ou `SEM UTM` quando não existir;
- `utm_source`: usa o valor da URL quando existir, ou `SEM UTM` quando não existir;
- `lead_source`: sempre envia `LP Multimarcas`.

A leitura dos parâmetros da URL também passou a aceitar variações de caixa, como `utm_campaign` ou `UTM_CAMPAIGN`.

### 2026-07-21 — Modal de erro no envio do cadastro

Os erros retornados durante o envio do formulário para a integração deixaram de exibir o alerta genérico do navegador. Agora, qualquer erro de resposta da integração ou falha de conexão abre um modal com a mensagem fixa:

> Você já possui um cadastro conosco!
>
> Clique no WhatsApp para falar com nossa equipe.

O modal possui botão direcionando para o WhatsApp `32 9845-3823`, usando o link `https://wa.me/553298453823`.

As validações feitas antes do envio, como campos obrigatórios e CNPJ inválido, continuam exibindo os alertas próprios, porque ainda não são erros retornados pela integração.

### 2026-07-20 — Ajuste responsivo do carrossel desktop

O carrossel desktop foi ajustado para reduzir diferenças visuais entre computadores e monitores:

- a seção inicial deixou de depender de uma altura fixa com corte rígido;
- o carrossel passou a respeitar a proporção real das imagens `1414 / 950`;
- foi definido limite máximo de largura para evitar banners grandes demais em telas ultrawide;
- o bloco carrossel + formulário passou a ter largura máxima e centralização no desktop;
- o formulário também ganhou largura máxima para não abrir demais em monitores grandes;
- as imagens passaram a usar `object-fit: contain` no desktop, mantendo o banner inteiro visível em vez de cortar áreas diferentes conforme a resolução.

## Hospedagem e deploy

O histórico do projeto indica que ele já foi hospedado na Azure e depois migrado para Netlify.

No repositório ainda existe o workflow legado:

- `.github/workflows/azure-static-web-apps-delightful-desert-0d0b88f0f.yml`

Esse workflow usa `Azure/static-web-apps-deploy@v1` e dispara em push/PR na branch `main`. Como a hospedagem atual foi migrada para Netlify, esse arquivo deve ser tratado como legado da hospedagem anterior, a menos que ainda exista algum uso ativo na Azure.

Há configuração Netlify versionada para Functions:

- `netlify.toml` define `netlify/functions` como diretório de Functions.

Ainda não há configuração versionada completa de build/deploy:

- Não existe pasta `.netlify/`.
- Não existe arquivo `_headers`.
- Existe `_redirects` apenas para compatibilidade das URLs antigas `index-mobile.html` e `index-desktop.html`.

Com isso, a configuração de build/publish do Netlify provavelmente continua feita diretamente no painel do Netlify, conectado ao GitHub, usando:

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
  - via Netlify Function local: `/.netlify/functions/receive-prospect`
  - destino final: `https://alphabeto.geovendas.app/geovendas360/api/v1/webhook/crm/receive`

O envio do formulário monta um payload no modelo do webhook CRM com `cnpj_qualified`, `razaoSocial`, `nomeFantasia`, `email`, `phone_number`, `whatsapp`, `instagram` no primeiro nível, `city`, `state`, `contatos` e `camposIntegracao`. O `instagram_`, `faturamento_mensal`, `lead_source`, `loja_fisica`, `utm_campaign`, `utm_content` e `utm_source` são enviados dentro de `camposIntegracao`.

## Validação local feita

O site foi servido localmente com `python3 -m http.server` e os arquivos principais responderam:

- `/`: `200 OK`;
- `/styles.css`: `200 OK`;
- `/scripts.js`: `200 OK`.

Ainda existem fontes locais referenciadas que não estão no repositório:

- `./fonts/futura.woff2`;
- `./fonts/futura.woff`;
- `./fonts/futura.ttf`.

O site ainda pode funcionar com fallback de fonte, mas o ideal é corrigir para evitar ruído no deploy e diferenças visuais caso a fonte local seja exigida.

## Teste da API de prospect

### 2026-07-15 — Validação do envio com `faturamento_mensal`

Foi testado um POST direto para:

- `https://alphabeto.geovendas.app/IBTech_VirtualAge/rest/prospect/external`

Resultado:

- A API aceitou payload contendo o campo `faturamento_mensal`.
- A resposta de sucesso foi `201` com mensagem de prospect criado.
- Ao repetir o mesmo CNPJ/e-mail, a API respondeu `409` informando duplicidade de prospect.

Conclusão:

- O campo `faturamento_mensal` não quebrou a API.
- O alerta genérico `Erro ao enviar os dados.` pode estar escondendo uma mensagem real da API, como duplicidade de CNPJ/e-mail.
- Próxima melhoria recomendada: ajustar `scripts.js` para exibir a mensagem retornada pela API quando o status for diferente de `201`.

## Pontos de atenção

1. O workflow da Azure pode confundir manutenção futura ou até continuar executando se os secrets antigos ainda existirem.
2. A configuração real do Netlify não está no código, então uma pessoa nova no projeto não consegue confirmar o deploy apenas pelo repositório.
3. Há referências CSS para fontes e imagem inexistentes.
4. O arquivo `README.md` está em UTF-16 e tem conteúdo mínimo; pode ser melhor substituí-lo por uma documentação simples em UTF-8.
5. Os HTMLs são grandes e têm SVG/base64 embutido; isso dificulta manutenção manual.
6. O arquivo `styles.css` ainda carrega regras antigas herdadas das versões separadas; a LP já está unificada, mas uma refatoração futura pode reduzir bastante o CSS.

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
   - ou remover o `@font-face` e usar apenas fontes externas/fallback.

5. Atualizar o `README.md` para UTF-8 com:
   - descrição do projeto;
   - fluxo GitHub → Netlify;
   - como testar localmente;
   - principais integrações externas;
   - cuidados antes de publicar.

6. Fazer uma validação visual em mobile e desktop depois de qualquer ajuste, conferindo:
   - layout responsivo da raiz `/`;
   - carrossel;
   - formulário;
   - carregamento de UF/cidade;
   - envio para API externa;
   - eventos do Google Tag Manager, se aplicável.
