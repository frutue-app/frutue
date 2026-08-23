# Frutue — Sistema de Pedidos + Gestão (Etapa 1 e 2)

Esta etapa entrega:
- ✅ Estrutura das planilhas (banco de dados) no Google Sheets
- ✅ Backend (Google Apps Script) que recebe pedidos e grava tudo automaticamente
- ✅ Frontend do cliente enviando pedidos para o backend, **sem remover** carrinho, montador de salada, WhatsApp e Pix

As próximas mensagens vão trazer: painel admin (`admin.html`), financeiro manual, estoque, relatórios e fechamento mensal — construídos em cima do que já estiver funcionando aqui.

## Estrutura de pastas entregue

```
frutue/
├── index.html
├── css/style.css
├── js/app.js         (carrinho + montador de saladas)
├── js/pedidos.js      (finalizar pedido + envio para API + WhatsApp + Pix)
├── apps-script/Code.gs (backend)
└── img/               (coloque aqui logo.jpg e fundo.jpg, como já usava)
```

## Passo 1 — Criar a planilha (banco de dados)

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco.
2. Dê um nome, por exemplo **"Frutue - Banco de Dados"**.
3. Vá em **Extensões > Apps Script**.
4. Apague o conteúdo padrão do arquivo `Code.gs` que abrir, e cole o conteúdo do arquivo `apps-script/Code.gs` deste projeto.
5. No topo do editor, no menu de funções (dropdown ao lado do ícone ▶️), selecione **setupSheets** e clique em **Executar**.
   - Na primeira vez, o Google vai pedir autorização — aceite (é a sua própria conta, sem custo).
6. Volte na planilha: você verá as abas **PEDIDOS, ITENS_PEDIDO, CLIENTES, PRODUTOS, MOVIMENTACOES_ESTOQUE, FINANCEIRO, CATEGORIAS_FINANCEIRAS, CONTAS**, já com os cabeçalhos certos.

### Cadastre seus produtos (opcional nesta etapa)

Na aba **PRODUTOS**, adicione uma linha por produto que você quer controlar estoque, por exemplo:

| id | nome | categoria | preco_venda | custo_unitario | estoque_atual | estoque_minimo | ativo | controla_estoque |
|---|---|---|---|---|---|---|---|---|
| (deixe vazio, é só referência) | Suco de Laranja | Suco | 7 | 2.5 | 20 | 5 | TRUE | TRUE |

Só produtos com `controla_estoque = TRUE` e nome **exatamente igual** ao nome enviado pelo carrinho terão baixa automática de estoque. Itens sem correspondência (ex: saladas personalizadas) simplesmente não afetam estoque nesta etapa — isso será refinado quando o cadastro de produtos ficar administrável pelo admin.html.

## Passo 2 — Publicar o Apps Script como Web App

1. Ainda no editor do Apps Script, clique em **Implantar > Nova implantação**.
2. Em "Tipo", escolha **App da Web**.
3. Configure:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
4. Clique em **Implantar**, autorize novamente se pedido.
5. Copie a **URL do app da Web** (algo como `https://script.google.com/macros/s/AAAA.../exec`).

⚠️ Sempre que você editar o `Code.gs`, é preciso ir em **Implantar > Gerenciar implantações > editar (ícone de lápis) > Nova versão > Implantar** para as mudanças valerem na URL publicada.

## Passo 3 — Configurar a URL no frontend

Abra `js/app.js` e edite:

```js
apiUrl: "COLE_AQUI_A_URL_DO_APPS_SCRIPT"
```

Cole a URL copiada no passo anterior, terminada em `/exec`.

## Passo 4 — Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `frutue`).
2. Suba todo o conteúdo desta pasta `frutue/` (menos `apps-script/`, que não precisa ir para o site — pode manter só para referência/versionamento).
3. No repositório, vá em **Settings > Pages**.
4. Em "Branch", selecione `main` (ou `master`) e pasta `/root`, salve.
5. Após alguns segundos, o GitHub mostrará a URL pública, ex: `https://seuusuario.github.io/frutue/`.

## Passo 5 — Testar

1. Abra a URL do GitHub Pages.
2. Monte uma salada e/ou adicione um sanduíche/suco.
3. Preencha nome e endereço.
4. Clique em **Finalizar Pedido**.
5. Deve aparecer, embaixo do botão, a mensagem **"✅ Pedido registrado no sistema."**
6. Volte na planilha: confira se surgiram linhas em **PEDIDOS**, **ITENS_PEDIDO**, **CLIENTES** e **FINANCEIRO**.
7. O fluxo de WhatsApp e Pix continuam funcionando normalmente, como antes.

### Se aparecer "⚠️ Não foi possível registrar automaticamente..."

- Confirme que `apiUrl` foi colada corretamente em `js/app.js` (sem espaços, terminando em `/exec`).
- Confirme que a implantação está com acesso "Qualquer pessoa".
- Abra o console do navegador (F12) para ver a mensagem de erro exata.
- O pedido continua podendo ser enviado pelo WhatsApp normalmente mesmo se a API falhar — nada trava para o cliente.

## Sobre segurança (Etapa 12, parcialmente já aplicada aqui)

- Não há nenhuma senha nem credencial no código público: o Apps Script roda com a permissão da sua própria conta Google, e só expõe as ações que o `Code.gs` implementa (`criarPedido`, por enquanto).
- A URL do Web App **não é secreta** (não deve ser tratada como senha), mas também não expõe a planilha inteira — só o que o script decide devolver. Nesta etapa, o `doGet` só devolve um "ping"; nenhuma leitura de dados financeiros está exposta publicamente ainda.
- Quando criarmos o `admin.html` (Etapa 3), vou implementar uma autenticação simples por token/senha validada **no próprio Apps Script** (não apenas no navegador), já explicando as limitações desse modelo gratuito.

## Próximos passos (não incluídos ainda)

- `admin.html` com login e dashboard
- Financeiro manual (lançar despesas)
- Cadastro de produtos pela interface (sem editar a planilha na mão)
- Estoque com alertas de "estoque baixo"
- Relatórios com gráficos
- Fechamento mensal
- Exportação para CSV

Me avise quando tiver testado esta etapa (Passo 5) e seguimos para o painel administrativo.
