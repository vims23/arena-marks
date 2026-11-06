# Arena Marks — Primeira versão das telas

Interface Next.js, React e TypeScript baseada no PDF `Arena_Marks_Documento_Tecnico_Arquitetura_Requisitos.pdf` (24/10/2026) e nas seis referências visuais enviadas pelo usuário.

## Subir com Docker

No diretório do projeto, com Docker Desktop iniciado:

```powershell
Copy-Item .env.example .env
# Preencha ARENA_DB_PASSWORD e ARENA_ADMIN_KEY com valores longos e distintos.
docker compose up -d --build --wait
```

Não sobrescreva um `.env` já configurado. Ele não deve ser versionado ou compartilhado. A senha do banco é usada na criação do volume; alterar só o arquivo depois não troca a senha no PostgreSQL.

- Portal: http://localhost:3101/
- Inscrição: http://localhost:3101/inscricao
- Análise: http://localhost:3101/inscricoes (digite a chave `ARENA_ADMIN_KEY`)
- API interativa: http://localhost:8000/docs (somente neste computador)

Na mesma rede, use o IP do computador no lugar de `localhost` na porta 3101. Em caso de bloqueio, confira o firewall do Windows. Esta pilha é para testes em rede confiável, não para expor à internet: o painel de inscrições usa uma chave compartilhada, sem contas individuais, e o Compose não termina HTTPS.

O Compose inicia Next.js, FastAPI e PostgreSQL. Só a web fica acessível pela rede; a API é encaminhada pela própria origem da web. As migrações SQL versionadas em `backend/migrations` são aplicadas na inicialização da API. O volume `arena_pgdata` preserva os dados após `docker compose down`; não use `down -v` se quiser preservá-los.

### Contratos da API

| Método e rota | Acesso | Resultado |
|---|---|---|
| `GET /health` | Local | Confirma disponibilidade da API e do banco |
| `POST /registrations` | Público | Salva inscrição e foto, retorna protocolo |
| `GET /admin/registrations` | Bearer da organização | Lista inscrições e dados privados |
| `PATCH /admin/registrations/{id}` | Bearer da organização | Aprova ou rejeita inscrição |

A edição inicial tem 32 vagas configuradas no PostgreSQL, independentemente das configurações de demonstração. O banco impede duplicatas ativas por e-mail na mesma edição, e o envio valida os aceites e normaliza a foto antes de persistir. O rascunho continua apenas no navegador. A sincronização do painel de inscrições é feita pelo botão **Atualizar inscrições**.

## Frontend em desenvolvimento

Com o servidor iniciado: http://localhost:3100

Nesta máquina, também é possível abrir `INICIAR_ARENA.bat`. O iniciador reutiliza o servidor quando ele já está disponível na porta 3100.

```powershell
pnpm install
pnpm dev
```

Alternativa, quando as dependências já estiverem instaladas:

```powershell
node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port 3100
```

## Páginas

| URL | Tela |
|---|---|
| `/` ou `/portal` | Portal da Champions Marks League II |
| `/inscricao` ou `/inscrever` | Inscrição em quatro etapas, foto e rascunho |
| `/campeonato` | Apresentação, parâmetros da edição e parceiros a confirmar |
| `/atletas` | Participantes aprovados e busca |
| `/classificacao` | Grupos, mata-mata e artilharia |
| `/jogos` | Partidas e resultados públicos |
| `/admin` | Painel administrativo |
| `/inscricoes` | Análise, aprovação e rejeição |
| `/jogadores` | Cadastro e edição de participantes |
| `/sorteio` | Simulação reproduzível de grupos |
| `/partidas` | Operação e resultados das partidas |
| `/controle-da-partida` | Console completo de gols, cartões e cronômetro |
| `/grupos` | Classificação administrativa |
| `/rankings` | Rankings e indicação demonstrativa de MVP |
| `/telao` | Seleção da partida e cena |
| `/live` | Telão sem menus administrativos |
| `/broadcast` | URLs independentes de overlays |
| `/overlay/score` | Placar sobre fundo transparente |
| `/overlay/match` | Cena da partida |
| `/overlay/groups` | Cena da classificação |
| `/configuracoes` | Capacidade, grupos, estações, data e pontuação |

## Escopo real desta entrega

A inscrição e sua análise usam a API. Dashboard, jogadores, sorteio, partidas, configurações e transmissão ainda usam dados de demonstração em `localStorage`. Aprovar uma inscrição no banco não a coloca automaticamente no sorteio demonstrativo. Os dados locais antigos não são importados.

Não usar para inscrições oficiais ou dados pessoais reais antes de acrescentar autenticação individual, HTTPS e controles operacionais de privacidade e segurança. Ainda não há envio de e-mail, armazenamento S3 ou WebSocket entre dispositivos.

O navegador interno do OBS não compartilha o `localStorage` do navegador de operação. As URLs de overlay são prévias visuais; a sincronização real com OBS depende da API futura. O Telão já permite validar o comportamento entre abas.

## Fluxos implementados

- Inscrever com foto, WhatsApp, e-mail, cidade/UF; salvar/recuperar rascunho; revisar; aceitar regulamento e imagem; receber protocolo; analisar e aprovar no painel.
- Buscar participantes e editar nome, apelido, clube e fotografia.
- Simular sorteio dos elegíveis com seed estável. A serpentina não representa balanceamento por habilidade. A publicação está bloqueada na demonstração quando existem partidas já iniciadas.
- Registrar gols e cartões, pausar/retomar, anular evento com motivo no console completo, encerrar e confirmar resultado.
- Recalcular grupos e artilharia somente com resultados confirmados.
- Selecionar partida/cena e acompanhar o Telão em outra aba.
- Exibir chave eliminatória com vagas reservadas, sem inventar critérios de classificação ainda não homologados.

O banco de inscrições começa vazio. Os participantes de exemplo continuam apenas no frontend de demonstração. Datas indefinidas não geram contagem regressiva fictícia.

## Verificações

```powershell
pnpm check
pnpm build
```

Validação realizada em navegador Chromium: inscrição/foto/rascunho/aprovação/persistência; gols/cartões/anulação/pausa/confirmação; sincronização do Telão; telas desktop e mobile. Build de produção e checagem TypeScript.

## Arquivos

- `components/reference-pages.tsx`: páginas públicas, dashboard, console da partida e Telão inspirados nos modelos.
- `components/arena-app.tsx`: estado local, navegação e telas administrativas.
- `lib/model.ts`: modelos, dados de demonstração, classificação e sorteio.
- `app/reference.css`: identidade azul, dourado e preto e layouts de referência.
- `app/globals.css`: componentes de base e responsividade administrativa.
- `public/arena-event.jpg`: fundo original de arena criado para esta versão; veja `ASSETS.md`.

## Próxima etapa técnica

Integrar os inscritos aprovados à gestão de jogadores e ao sorteio, migrar partidas e eventos para tabelas relacionais, aplicar autenticação individual e permissões, e ligar o Telão ao WebSocket.
