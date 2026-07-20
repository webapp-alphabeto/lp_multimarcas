# Leitura do projeto e próximos passos

Atualizado em: 2026-07-20

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

### 2026-07-15 — Campos dinâmicos de integração

Após conferência da tela de Campos de Integração do Portal GEO, o formulário passou a enviar também as keys dinâmicas cadastradas:

- `faturamento_mensal`: valor selecionado no dropdown de faturamento médio;
- `lead_source`: origem do lead, usando `utm_source` quando existir na URL ou `LP Multimarcas` como fallback;
- `loja_fisica`: enviado como `Sim`, pois o formulário exige a cidade da loja física;
- `utm_campaign`: campanha da URL, usando `utm_campaign` quando existir ou `SEM UTM` como fallback;
- `utm_content`: conteúdo da URL, usando `utm_content` quando existir ou `SEM UTM` como fallback;
- `utm_source`: origem da URL, usando `utm_source` quando existir ou `LP Multimarcas` como fallback.

O payload também passou a enviar o Instagram em duas keys:

- `instagram`;
- `instagram_`.

Isso mantém compatibilidade com o campo antigo e aumenta a chance de mapeamento correto no Portal GEO/IBTech.

O redirecionamento inicial de `index.html` também foi ajustado para preservar `querystring` e `hash`, evitando perda de UTMs ao mandar o usuário para `index-mobile.html` ou `index-desktop.html`.

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

## Hospedagem e deploy

O histórico do projeto indica que ele já foi hospedado na Azure e depois migrado para Netlify.

No repositório ainda existe o workflow legado:

- `.github/workflows/azure-static-web-apps-delightful-desert-0d0b88f0f.yml`

Esse workflow usa `Azure/static-web-apps-deploy@v1` e dispara em push/PR na branch `main`. Como a hospedagem atual foi migrada para Netlify, esse arquivo deve ser tratado como legado da hospedagem anterior, a menos que ainda exista algum uso ativo na Azure.

Há configuração Netlify versionada para Functions:

- `netlify.toml` define `netlify/functions` como diretório de Functions.

Ainda não há configuração versionada completa de build/deploy:

- Não existe pasta `.netlify/`.
- Não existem arquivos `_redirects` ou `_headers`.

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
- `/index-mobile.html`: `200 OK`;
- `/index-desktop.html`: `200 OK`;
- `/scripts.js`: `200 OK`.

Foram encontrados recursos locais referenciados que não existem no repositório:

- `./fonts/futura.woff2`;
- `./fonts/futura.woff`;
- `./fonts/futura.ttf`;
- `./img/estrelas.png`.

Esses recursos geram `404` quando solicitados. O site ainda pode funcionar com fallback de fonte/imagem, mas o ideal é corrigir para evitar ruído no deploy e diferenças visuais.

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
