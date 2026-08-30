// ===================== CONFIGURAÇÃO GERAL =====================
const CONFIG = {
  whatsappNumero: "5586981949977",
  pixChave: "86981949977", 
  pixNomeRecebedor: "Francisco das Chagas Gomes", //
  pixCidade: "PEDRO II",
  taxaEntrega: 2.00,
  apiUrl: "https://script.google.com/macros/s/AKfycbxHTowPSlJ_fvKNFYJprhugOyLBhdA4rdvUWjz4wWFWCVDx-Jbwdr71aO7Q2vee7pxWNw/exec"
};

// PREÇOS SALADA GOURMET
const GOURMET_PRECOS = {
  "Dulce Fit": { "400": 14.00, "500": 16.00 },
  "Iogurte Natural": { "400": 12.00, "500": 15.00 },
  "Iogurte + Whey": { "400": 14.00, "500": 16.00 },
  "Creme de Whey": { "400": 12.00, "500": 15.00 },
  "Creme de Ninho": { "400": 10.00, "500": 14.00 },
  "Nutella": { "400": 10.00, "500": 14.00 }
};

const SACOLAO_DADOS = [
  {
    categoria: "Frutas Essenciais",
    itens: [
      { id: "banana_nanica", nome: "Banana Nanica (unid)", preco: 0.80 },
      { id: "banana_prata", nome: "Banana Prata (unid)", preco: 0.80 },
      { id: "maca_fuji", nome: "Maçã Fuji (unid)", preco: 1.50 },
      { id: "maca_gala", nome: "Maçã Gala (unid)", preco: 1.50 },
      { id: "laranja_pera", nome: "Laranja Pêra (unid)", preco: 0.90 },
      { id: "mamao_formosa", nome: "Mamão Formosa (unid)", preco: 6.00 },
      { id: "mamao_papaya", nome: "Mamão Papaya (unid)", preco: 4.50 },
      { id: "limao_taiti", nome: "Limão Taiti (unid)", preco: 0.50 }
    ]
  },
  {
    categoria: "Legumes e Frutos",
    itens: [
      { id: "tomate_salada", nome: "Tomate Salada (unid)", preco: 1.20 },
      { id: "tomate_italiano", nome: "Tomate Italiano (unid)", preco: 1.30 },
      { id: "batata_branca", nome: "Batata Branca (unid)", preco: 1.00 },
      { id: "cebola", nome: "Cebola (unid)", preco: 0.90 },
      { id: "cenoura", nome: "Cenoura (unid)", preco: 1.20 },
      { id: "abobrinha", nome: "Abobrinha (unid)", preco: 2.00 },
      { id: "pimentao", nome: "Pimentão (unid)", preco: 1.50 }
    ]
  },
  {
    categoria: "Verduras e Folhosos",
    itens: [
      { id: "alface_crespa", nome: "Alface Crespa (pé)", preco: 3.50 },
      { id: "alface_americana", nome: "Alface Americana (pé)", preco: 4.00 },
      { id: "couve_fatiada", nome: "Couve Fatiada (pct)", preco: 4.00 },
      { id: "couve_maco", nome: "Couve em Maço (maço)", preco: 3.50 },
      { id: "repolho_verde", nome: "Repolho Verde (unid)", preco: 4.50 },
      { id: "repolho_roxo", nome: "Repolho Roxo (unid)", preco: 5.00 }
    ]
  },
  {
    categoria: "Temperos e Ervas",
    itens: [
      { id: "alho", nome: "Alho (cabeça)", preco: 1.50 },
      { id: "coentro", nome: "Coentro (maço)", preco: 2.50 }
    ]
  }
];

const ADICIONAIS_DISPONIVEIS = [
  "Granola", "Leite em Pó", "Mel", "Chia", "Aveia", "Gotas de Chocolate", "Coco Ralado"
];

// ===================== CATÁLOGO CENTRAL DE FRUTAS =====================
// Fonte ÚNICA de frutas do sistema. Usada por: Salada Simples, Salada Gourmet,
// Salada por Peso, Suco Natural e Painel Admin. Para adicionar uma nova fruta,
// basta incluir um novo objeto aqui (ou pelo Painel Admin) — ela aparecerá
// automaticamente em todos os lugares que usam o catálogo.
// tipoPreco: "normal" | "especial" — hoje só o Morango é "especial", mas a
// regra NÃO fica presa ao nome "Morango": qualquer fruta marcada como
// "especial" passa a usar as regras de preço especial (item 7 do briefing).
const CATALOGO_FRUTAS_PADRAO = [
  { nome: "Morango",  emoji: "🍓", ativo: true, tipoPreco: "especial" },
  { nome: "Banana",   emoji: "🍌", ativo: true, tipoPreco: "normal" },
  { nome: "Maçã",     emoji: "🍎", ativo: true, tipoPreco: "normal" },
  { nome: "Uva",      emoji: "🍇", ativo: true, tipoPreco: "normal" },
  { nome: "Kiwi",     emoji: "🥝", ativo: true, tipoPreco: "normal" },
  { nome: "Manga",    emoji: "🥭", ativo: true, tipoPreco: "normal" },
  { nome: "Abacaxi",  emoji: "🍍", ativo: true, tipoPreco: "normal" },
  { nome: "Mamão",    emoji: "🍑", ativo: true, tipoPreco: "normal" },
  { nome: "Melancia", emoji: "🍉", ativo: true, tipoPreco: "normal" },
  { nome: "Melão",    emoji: "🍈", ativo: true, tipoPreco: "normal" }
];

const SABORES_SUCO_NATURAL = ["Normal", "Com Leite"];

// ===================== CONFIGURAÇÃO CENTRAL DE PREÇOS =====================
// TODOS os valores editáveis pelo Admin ficam aqui dentro. O Painel Admin lê e
// grava neste mesmo formato (ver admin.js). Para alterar um preço "na unha"
// (sem usar o Admin), basta editar os valores abaixo.
const CONFIG_PRECOS_PADRAO = {
  // Limite de acompanhamentos grátis (item 5 do briefing)
  maxAcompanhamentos: 3,

  // Salada por Peso — preço por grama (item 8)
  precoPorGramaPadrao: 0.035,   // demais frutas (equivalente a R$ 35,00/kg, valor já usado antes)
  precoPorGramaEspecial: 0.05, // frutas com tipoPreco "especial" (hoje: Morango) — R$ 0,05/g

  // Água de Coco (item 1)
  aguaDeCoco: {
    "200ml": 6.00,
    "500ml": 8.00
  },

  // Suco Natural (item 2)
  sucoNatural: {
    "300ml": 7.00,
    "500ml": 9.00
  },

  // Salada Simples — preço especial quando a ÚNICA fruta escolhida é uma
  // fruta "especial" (item 6). Chave = mesmo rótulo usado no seletor de
  // tamanho/plano (ver copoSubModal em index.html).
  // Valor obrigatório do briefing: 400ml (Unid.) = R$ 12,00.
  // Os demais valores abaixo são estimativas de referência — ajuste-os no
  // Painel Admin (ou aqui) quando tiver os valores definitivos.
  saladaSimplesFrutaEspecial: {
    "250ml (Unid.)": 9.00,
    "400ml (Unid.)": 12.00,
    "500ml (Unid.)": 15.00,
    "250ml (Semanal)": 22.00,
    "400ml (Semanal)": 30.00,
    "500ml (Semanal)": 40.00
  }
};

let carrinho = [];
let montadorQtd = 1;
let gourmetTipoAtual = '';
let sacolaoQtds = {};
window.pedidoAtualId = null;
window.estoqueAtual = null;
window.catalogoFrutasAtual = null;
window.configPrecosAtual = null;

// Busca o estoque/disponibilidade atual no servidor (planilha). Isso é o que
// garante que a disponibilidade definida pelo Admin apareça para TODOS os
// clientes, não só no navegador de quem editou.
function carregarEstoqueDoServidor() {
  if (!CONFIG.apiUrl) return Promise.resolve(null);

  return fetch(`${CONFIG.apiUrl}?action=estoque`)
    .then(res => res.json())
    .then(data => {
      if (data && data.ok && Array.isArray(data.estoque)) {
        window.estoqueAtual = data.estoque;
        // Mantém uma cópia local só como fallback caso a rede falhe depois.
        localStorage.setItem('frutue_estoque_geral', JSON.stringify(data.estoque));
      }
      return window.estoqueAtual;
    })
    .catch(err => {
      console.warn('[Frutue][estoque] Falha ao buscar estoque do servidor, usando cache local (se houver).', err);
      const cache = localStorage.getItem('frutue_estoque_geral');
      window.estoqueAtual = cache ? JSON.parse(cache) : null;
      return window.estoqueAtual;
    });
}

// Busca no servidor o catálogo de frutas e a configuração de preços definidos
// pelo Admin (mesma lógica/mesmo endpoint usado para o estoque). Enquanto não
// há resposta do servidor (ou se a rede falhar), usa o cache local e, por
// último, os valores padrão definidos acima.
function carregarConfigGeralDoServidor() {
  if (!CONFIG.apiUrl) return Promise.resolve(null);

  return fetch(`${CONFIG.apiUrl}?action=configGeral`)
    .then(res => res.json())
    .then(data => {
      if (data && data.ok) {
        if (Array.isArray(data.catalogoFrutas) && data.catalogoFrutas.length) {
          window.catalogoFrutasAtual = data.catalogoFrutas;
          localStorage.setItem('frutue_catalogo_frutas', JSON.stringify(data.catalogoFrutas));
        }
        if (data.configPrecos) {
          window.configPrecosAtual = data.configPrecos;
          localStorage.setItem('frutue_config_precos', JSON.stringify(data.configPrecos));
        }
      }
      return { catalogo: window.catalogoFrutasAtual, precos: window.configPrecosAtual };
    })
    .catch(err => {
      console.warn('[Frutue][config] Falha ao buscar configuração do servidor, usando cache local (se houver).', err);
      const cacheFrutas = localStorage.getItem('frutue_catalogo_frutas');
      const cachePrecos = localStorage.getItem('frutue_config_precos');
      window.catalogoFrutasAtual = cacheFrutas ? JSON.parse(cacheFrutas) : window.catalogoFrutasAtual;
      window.configPrecosAtual = cachePrecos ? JSON.parse(cachePrecos) : window.configPrecosAtual;
      return { catalogo: window.catalogoFrutasAtual, precos: window.configPrecosAtual };
    });
}

function obterCatalogoFrutas() {
  if (window.catalogoFrutasAtual) return window.catalogoFrutasAtual;
  const salvo = localStorage.getItem('frutue_catalogo_frutas');
  return salvo ? JSON.parse(salvo) : CATALOGO_FRUTAS_PADRAO;
}

function obterFrutasAtivas() {
  return obterCatalogoFrutas().filter(f => f.ativo !== false);
}

function obterConfigPrecos() {
  if (window.configPrecosAtual) return window.configPrecosAtual;
  const salvo = localStorage.getItem('frutue_config_precos');
  // Faz merge raso com o padrão para garantir que chaves novas (adicionadas
  // em atualizações futuras) sempre tenham um valor, mesmo que o cache salvo
  // seja antigo.
  const base = salvo ? JSON.parse(salvo) : {};
  return Object.assign({}, CONFIG_PRECOS_PADRAO, base);
}

// Renderiza uma lista de checkboxes (ou radios) de frutas dentro de um
// container, sempre a partir do catálogo central de frutas ATIVAS. Assim,
// Salada Simples, Salada Gourmet e Suco Natural nunca ficam com listas
// divergentes ou desatualizadas.
function renderizarFrutasContainer(containerId, tipoInput, nomeGrupoRadio) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const frutas = obterFrutasAtivas();

  container.innerHTML = frutas.map(f => {
    const inputAttrs = tipoInput === 'radio'
      ? `type="radio" name="${nomeGrupoRadio}"`
      : `type="checkbox"`;
    return `
      <label class="opt-card">
        <input ${inputAttrs} value="${f.nome}">
        ${f.nome} ${f.emoji || ''}
      </label>
    `;
  }).join('');
}

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  carregarConfigGeralDoServidor().then(() => {
    renderizarListaFrutasPeso();
  });
  // renderizarSacolao(); // Removido para evitar Uncaught ReferenceError
  carregarEstoqueDoServidor().then(() => aplicarDisponibilidadeEstoque());
  atualizarCarrinhoUI();
});

// Função auxiliar de diagnóstico. Abra o Console do navegador (F12) e rode:
// debugEstoqueFrutue()
window.debugEstoqueFrutue = function () {
  console.log('URL atual:', window.location.href);
  console.log('window.estoqueAtual (o que a página está usando agora):', window.estoqueAtual);
  if (window.estoqueAtual) console.table(window.estoqueAtual);
  carregarEstoqueDoServidor().then(estoque => {
    console.log('Resposta atual do servidor (Google Sheets):', estoque);
    if (estoque) console.table(estoque);
  });
};

// ===================== CONTROLE DE DISPONIBILIDADE (ADMIN) =====================

// Remove emojis, espaços extras e diferenças de maiúsculas/minúsculas para
// permitir comparar "Morango" (valor usado nos checkboxes dos modais) com
// "Morango 🍓" (nome cadastrado no Painel Admin).
function normalizarNomeProduto(str) {
  return (str || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function aplicarDisponibilidadeEstoque() {
  if (!window.estoqueAtual) {
    // Ainda não carregou do servidor (ex: modal aberto muito rápido). Busca
    // e reaplica assim que chegar.
    carregarEstoqueDoServidor().then(estoque => {
      if (estoque) aplicarDisponibilidadeEstoque();
    });
    return;
  }

  const estoque = window.estoqueAtual;
  console.log('[Frutue][estoque] Aplicando disponibilidade com:', estoque);

  document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    const val = normalizarNomeProduto(input.value);
    if (!val) return;
    const itemEstoque = estoque.find(e => {
      const nomeEstoque = normalizarNomeProduto(e.nome);
      return nomeEstoque === val || val.includes(nomeEstoque) || nomeEstoque.includes(val);
    });

    if (itemEstoque) {
      const parent = input.closest('.opt-card') || input.closest('.peso-item-row') || input.parentElement;
      if (!itemEstoque.disponivel) {
        input.disabled = true;
        input.checked = false;
        if (parent) {
          parent.style.opacity = '0.4';
          parent.style.pointerEvents = 'none';
          parent.title = 'Indisponível hoje';
        }
      } else {
        input.disabled = false;
        if (parent) {
          parent.style.opacity = '1';
          parent.style.pointerEvents = 'auto';
          parent.title = '';
        }
      }
    }
  });

  document.querySelectorAll('[data-produto-nome]').forEach(btn => {
    const nomeProd = normalizarNomeProduto(btn.getAttribute('data-produto-nome'));
    const itemEstoque = estoque.find(e => normalizarNomeProduto(e.nome) === nomeProd);
    if (itemEstoque && !itemEstoque.disponivel) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.innerText = 'Indisponível';
    } else if (itemEstoque) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  });
}

function toggleCartDrawer(open) {
  document.getElementById('cartOverlay').classList.toggle('show', open);
  document.getElementById('cartDrawer').classList.toggle('open', open);
}

function adicionarItemDireto(nome, preco) {
  const estoque = window.estoqueAtual;
  if (estoque) {
    const nomeNormalizado = normalizarNomeProduto(nome);
    const item = estoque.find(e => {
      const nomeEstoque = normalizarNomeProduto(e.nome);
      return nomeEstoque === nomeNormalizado || nomeNormalizado.includes(nomeEstoque) || nomeEstoque.includes(nomeNormalizado);
    });
    if (item && !item.disponivel) {
      alert(`Desculpe, o item "${nome}" está indisponível hoje.`);
      return;
    }
  }

  const itemExistente = carrinho.find(item => item.nome === nome && !item.detalhes);
  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    carrinho.push({
      id: Date.now() + Math.random(),
      nome: nome,
      detalhes: '',
      precoUnitario: parseFloat(preco),
      qtd: 1
    });
  }
  atualizarCarrinhoUI();
  toggleCartDrawer(true);
}

function alterarQtdItemCarrinho(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  item.qtd += delta;
  if (item.qtd <= 0) {
    carrinho = carrinho.filter(i => i.id !== id);
  }
  atualizarCarrinhoUI();
}

function removerItemCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  atualizarCarrinhoUI();
}

function atualizarTaxaEntregaUI() {
  atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
  const listEl = document.getElementById('cartList');
  if (!listEl) return;
  listEl.innerHTML = '';
  let subtotal = 0;
  let totalItens = 0;

  if (carrinho.length === 0) {
    listEl.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Seu carrinho está vazio.</p>';
  } else {
    carrinho.forEach(item => {
      const itemTotal = item.precoUnitario * item.qtd;
      subtotal += itemTotal;
      totalItens += item.qtd;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-title">
          <span>${item.nome}</span>
          <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
        </div>
        ${item.detalhes ? `<div class="cart-item-desc">${item.detalhes}</div>` : ''}
        <div class="cart-item-footer">
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="alterarQtdItemCarrinho(${item.id}, -1)">-</button>
            <span class="qty-val">${item.qtd}</span>
            <button type="button" class="qty-btn" onclick="alterarQtdItemCarrinho(${item.id}, 1)">+</button>
          </div>
          <button type="button" class="cart-item-remove" onclick="removerItemCarrinho(${item.id})">Remover</button>
        </div>
      `;
      listEl.appendChild(itemEl);
    });
  }

  const tipoRecebimentoEl = document.getElementById('tipoRecebimentoSelect');
  const ehEntrega = tipoRecebimentoEl ? tipoRecebimentoEl.value === 'Entrega' : true;
  const taxaEntrega = (ehEntrega && carrinho.length > 0) ? CONFIG.taxaEntrega : 0;
  const totalGeral = subtotal + taxaEntrega;

  document.getElementById('cartCount').textContent = totalItens;
  document.getElementById('cartSubtotal').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');

  const taxaRow = document.getElementById('cartTaxaEntregaRow');
  if (taxaRow) {
    taxaRow.style.display = ehEntrega ? 'flex' : 'none';
  }

  const cartTotalGeralEl = document.getElementById('cartTotalGeral');
  if (cartTotalGeralEl) {
    cartTotalGeralEl.textContent = 'R$ ' + totalGeral.toFixed(2).replace('.', ',');
  }

  const totalBarra = document.getElementById('totalValorBarra');
  if (totalBarra) totalBarra.textContent = 'R$ ' + totalGeral.toFixed(2).replace('.', ',');

  // gerarDadosPixDinamico(totalGeral); // Removido para evitar Uncaught ReferenceError
}

// ===================== GERADOR DE PAYLOAD PIX (EMV / BR Code) =====================
function montarPayloadPix(chave, nomeRecebedor, cidade, valor, txid) {
  const removerAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const campo = (id, valor) => {
    const tamanho = String(valor.length).padStart(2, '0');
    return `${id}${tamanho}${valor}`;
  };

  const gui = campo('00', 'br.gov.bcb.pix');
  const chaveCampo = campo('01', chave);
  const merchantAccountInfo = campo('26', gui + chaveCampo);

  const merchantCategoryCode = campo('52', '0000');
  const transactionCurrency = campo('53', '986'); // BRL
  const transactionAmount = (valor && valor > 0) ? campo('54', valor.toFixed(2)) : '';
  const countryCode = campo('58', 'BR');

  let nomeLimpo = removerAcentos(nomeRecebedor).toUpperCase().substring(0, 25);
  let cidadeLimpa = removerAcentos(cidade).toUpperCase().substring(0, 15);
  const merchantName = campo('59', nomeLimpo);
  const merchantCity = campo('60', cidadeLimpa);

  const txidValor = (txid || '***').substring(0, 25);
  const additionalDataField = campo('62', campo('05', txidValor));

  let payload =
    campo('00', '01') +
    campo('01', '11') +
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalDataField +
    '6304';

  payload += calcularCRC16(payload);
  return payload;
}

function calcularCRC16(payload) {
  let polinomio = 0x1021;
  let resultado = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    resultado ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((resultado & 0x8000) !== 0) {
        resultado = ((resultado << 1) ^ polinomio) & 0xFFFF;
      } else {
        resultado = (resultado << 1) & 0xFFFF;
      }
    }
  }

  return resultado.toString(16).toUpperCase().padStart(4, '0');
}

function alterarQtdSacolao(itemId, delta) {
  sacolaoQtds[itemId] = (sacolaoQtds[itemId] || 0) + delta;
  if (sacolaoQtds[itemId] < 0) sacolaoQtds[itemId] = 0;

  const el = document.getElementById(`sacolao_qty_${itemId}`);
  if (el) el.textContent = sacolaoQtds[itemId];
}

function confirmarItensSacolao() {
  let adicionouAlgum = false;

  SACOLAO_DADOS.forEach(grupo => {
    grupo.itens.forEach(item => {
      const qtd = sacolaoQtds[item.id] || 0;
      if (qtd > 0) {
        adicionouAlgum = true;

        const itemExistente = carrinho.find(c => c.nome === item.nome && c.detalhes === 'Item do Sacolão');
        if (itemExistente) {
          itemExistente.qtd += qtd;
        } else {
          carrinho.push({
            id: Date.now() + Math.random(),
            nome: item.nome,
            detalhes: 'Item do Sacolão',
            precoUnitario: item.preco,
            qtd: qtd
          });
        }

        sacolaoQtds[item.id] = 0;
        const el = document.getElementById(`sacolao_qty_${item.id}`);
        if (el) el.textContent = '0';
      }
    });
  });

  if (!adicionouAlgum) {
    document.getElementById('erroSacolao').style.display = 'block';
    return;
  }

  document.getElementById('erroSacolao').style.display = 'none';
  if(typeof fecharSacolaoModal === 'function') fecharSacolaoModal();
  atualizarCarrinhoUI();
  toggleCartDrawer(true);
}

// ===================== SALADA POR PESO =====================
function abrirSaladaPesoModal() {
  document.getElementById('erroSaladaPeso').style.display = 'none';
  document.getElementById('saladaPesoModal').classList.add('show');
  aplicarDisponibilidadeEstoque();
  calcularTotalSaladaPeso();
}

function fecharSaladaPesoModal() {
  document.getElementById('saladaPesoModal').classList.remove('show');
}

// Preço por grama de uma fruta específica, considerando a regra de preço
// especial (item 7/8 do briefing). Não fica presa ao nome "Morango": qualquer
// fruta marcada como tipoPreco "especial" no catálogo usa esse valor.
function obterPrecoPorGrama(nomeFruta) {
  const config = obterConfigPrecos();
  const fruta = obterCatalogoFrutas().find(f => normalizarNomeProduto(f.nome) === normalizarNomeProduto(nomeFruta));
  if (fruta && fruta.tipoPreco === 'especial') {
    return config.precoPorGramaEspecial;
  }
  return config.precoPorGramaPadrao;
}

function renderizarListaFrutasPeso() {
  const container = document.getElementById('pesoFrutasList');
  if (!container) return;
  container.innerHTML = '';

  const frutas = obterFrutasAtivas();

  frutas.forEach((fruta, idx) => {
    const row = document.createElement('div');
    row.className = 'peso-item-row';
    row.innerHTML = `
      <label class="peso-item-label" for="pesoFruta_${idx}">
        <input type="checkbox" id="pesoFruta_${idx}" data-fruta-nome="${fruta.nome}" value="${fruta.nome} ${fruta.emoji || ''}" onchange="togglePesoInput(${idx}); calcularTotalSaladaPeso();">
        <span>${fruta.nome} ${fruta.emoji || ''}</span>
      </label>
      <div class="peso-item-input-wrap">
        <input type="number" id="pesoGramas_${idx}" min="0" step="10" placeholder="0" disabled oninput="calcularTotalSaladaPeso()">
        <span style="font-size:0.8rem; color:#666;">g</span>
      </div>
    `;
    container.appendChild(row);
  });
}

function togglePesoInput(idx) {
  const chk = document.getElementById(`pesoFruta_${idx}`);
  const input = document.getElementById(`pesoGramas_${idx}`);
  input.disabled = !chk.checked;
  if (!chk.checked) input.value = '';
}

function calcularTotalSaladaPeso() {
  const frutas = obterFrutasAtivas();
  let pesoTotalGramos = 0;
  let valorTotal = 0;

  frutas.forEach((fruta, idx) => {
    const chk = document.getElementById(`pesoFruta_${idx}`);
    const input = document.getElementById(`pesoGramas_${idx}`);
    if (chk && chk.checked) {
      const val = parseFloat(input.value) || 0;
      pesoTotalGramos += val;
      valorTotal += val * obterPrecoPorGrama(fruta.nome);
    }
  });

  document.getElementById('pesoTotalGrams').textContent = `${pesoTotalGramos} g`;
  document.getElementById('pesoTotalValor').textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

  return { pesoTotalGramos, valorTotal };
}

function confirmarSaladaPeso() {
  const { pesoTotalGramos, valorTotal } = calcularTotalSaladaPeso();
  const frutas = obterFrutasAtivas();
  let detalheFrutas = [];

  frutas.forEach((fruta, idx) => {
    const chk = document.getElementById(`pesoFruta_${idx}`);
    const input = document.getElementById(`pesoGramas_${idx}`);
    if (chk && chk.checked) {
      const val = parseFloat(input.value) || 0;
      if (val > 0) {
        detalheFrutas.push(`${fruta.nome}: ${val}g`);
      }
    }
  });

  if (pesoTotalGramos < 50 || detalheFrutas.length === 0) {
    document.getElementById('erroSaladaPeso').style.display = 'block';
    return;
  }
  document.getElementById('erroSaladaPeso').style.display = 'none';

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Salada por Peso (${pesoTotalGramos}g)`,
    detalhes: `Frutas: ${detalheFrutas.join(', ')}`,
    precoUnitario: valorTotal,
    qtd: 1
  });

  frutas.forEach((_, idx) => {
    const chk = document.getElementById(`pesoFruta_${idx}`);
    const input = document.getElementById(`pesoGramas_${idx}`);
    if (chk) chk.checked = false;
    if (input) { input.value = ''; input.disabled = true; }
  });

  fecharSaladaPesoModal();
  atualizarCarrinhoUI();
  toggleCartDrawer(true);
}

// ===================== SALADA SIMPLES =====================
function abrirMontadorSalada() {
  montadorQtd = 1;
  document.getElementById('montadorQtdVal').textContent = montadorQtd;
  document.querySelectorAll('#saladaModal input[type="radio"]').forEach(r => r.checked = false);
  document.querySelectorAll('#saladaModal input[type="checkbox"]').forEach(c => c.checked = false);

  renderizarFrutasContainer('frutasContainer', 'checkbox');
  document.querySelectorAll('#frutasContainer input').forEach(inp => {
    inp.setAttribute('onchange', 'atualizarLabelsSalada()');
  });

  renderizarAdicionaisGratuitos('adicionaisContainer');

  atualizarLabelsSalada();
  document.getElementById('erroMontador').style.display = 'none';
  document.getElementById('saladaModal').classList.add('show');
  aplicarDisponibilidadeEstoque();
}

function fecharSaladaModal() {
  document.getElementById('saladaModal').classList.remove('show');
}

function alterarQtdMontador(delta) {
  montadorQtd += delta;
  if (montadorQtd < 1) montadorQtd = 1;
  document.getElementById('montadorQtdVal').textContent = montadorQtd;
}

function abrirSubModal(id) { 
  aplicarDisponibilidadeEstoque();
  document.getElementById(id).classList.add('show'); 
}

function fecharSubModal(id) { 
  document.getElementById(id).classList.remove('show'); 
}

function renderizarAdicionaisGratuitos(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = ADICIONAIS_DISPONIVEIS.map(adc => `
    <label class="opt-card">
      <input type="checkbox" value="${adc}" onchange="verificarLimiteAcompanhamentos('${containerId}', this)">
      <span>${adc}</span>
      <span class="price-tag" style="color:#2e7d32; font-weight:bold;">Grátis</span>
    </label>
  `).join('');
}

// Limite central de acompanhamentos (item 5 do briefing). O valor máximo vem
// da configuração central (obterConfigPrecos().maxAcompanhamentos), então
// para mudar o limite basta alterar essa configuração — nada fica "solto" no
// código. Bloqueia a 4ª seleção e mostra uma mensagem clara ao cliente.
function verificarLimiteAcompanhamentos(containerId, inputAlterado) {
  const max = obterConfigPrecos().maxAcompanhamentos || 3;
  const container = document.getElementById(containerId);
  if (!container) return;

  const marcados = container.querySelectorAll('input:checked').length;
  if (inputAlterado.checked && marcados > max) {
    inputAlterado.checked = false;
    alert(`Você pode escolher no máximo ${max} acompanhamentos.`);
  }
}

function atualizarLabelsSalada() {
  const copoChecked = document.querySelector('input[name="tempCopo"]:checked');
  const frutasChecked = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);
  const adicionaisChecked = [...document.querySelectorAll('#adicionaisContainer input:checked')].map(a => a.value);

  document.getElementById('lblCopo').textContent = copoChecked ? copoChecked.value.split('|')[0] : 'Escolher tamanho *';
  document.getElementById('lblFrutas').textContent = frutasChecked.length ? frutasChecked.join(', ') : 'Escolher frutas *';
  document.getElementById('lblAdicionais').textContent = adicionaisChecked.length ? adicionaisChecked.join(', ') : 'Opcional';
}

function confirmarSaladaEAdicionar() {
  const copoSel = document.querySelector('input[name="tempCopo"]:checked');
  const frutasSel = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);

  if (!copoSel || frutasSel.length === 0) {
    document.getElementById('erroMontador').style.display = 'block';
    return;
  }
  document.getElementById('erroMontador').style.display = 'none';

  const [tamanhoLabel, precoCopo] = copoSel.value.split('|');
  let precoUnitario = parseFloat(precoCopo);

  // Regra do item 6/7: se a ÚNICA fruta escolhida for uma fruta "especial"
  // (hoje, Morango), usa o preço especial configurado para esse tamanho.
  if (frutasSel.length === 1) {
    const catalogo = obterCatalogoFrutas();
    const frutaObj = catalogo.find(f => normalizarNomeProduto(f.nome) === normalizarNomeProduto(frutasSel[0]));
    if (frutaObj && frutaObj.tipoPreco === 'especial') {
      const precosEspeciais = obterConfigPrecos().saladaSimplesFrutaEspecial || {};
      if (precosEspeciais[tamanhoLabel] != null) {
        precoUnitario = precosEspeciais[tamanhoLabel];
      }
    }
  }

  const adicionaisSel = [...document.querySelectorAll('#adicionaisContainer input:checked')].map(a => a.value);

  let detalheTexto = `Frutas: ${frutasSel.join(', ')}`;
  if (adicionaisSel.length) detalheTexto += `<br>Adicionais (Grátis): ${adicionaisSel.join(', ')}`;

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Salada Simples (${tamanhoLabel})`,
    detalhes: detalheTexto,
    precoUnitario: precoUnitario,
    qtd: montadorQtd
  });

  atualizarCarrinhoUI();
  fecharSaladaModal();
  toggleCartDrawer(true);
}

// ===================== SALADA GOURMET PRONTA =====================
function abrirGourmetModal(tipo) {
  gourmetTipoAtual = tipo;
  document.getElementById('gourmetModalTitle').textContent = `✨ Gourmet: ${tipo}`;
  
  const containerPrecos = document.getElementById('gourmetPrecosContainer');
  const precos = GOURMET_PRECOS[tipo] || { "400": 10.00, "500": 14.00 };

  containerPrecos.innerHTML = `
    <label class="opt-card">
      <input type="radio" name="gourmetCopo" value="400|${precos["400"]}" checked> 
      400ml <span class="price-tag">R$ ${precos["400"].toFixed(2).replace('.', ',')}</span>
    </label>
    <label class="opt-card">
      <input type="radio" name="gourmetCopo" value="500|${precos["500"]}"> 
      500ml <span class="price-tag">R$ ${precos["500"].toFixed(2).replace('.', ',')}</span>
    </label>
  `;

  // Corrige o bug de mostrar só 5 frutas: renderiza TODAS as frutas ativas
  // do catálogo central (item 3 do briefing), sempre já desmarcadas.
  renderizarFrutasContainer('gourmetFrutasContainer', 'checkbox');

  renderizarAdicionaisGratuitos('gourmetAdicionaisContainer');

  aplicarDisponibilidadeEstoque();
  document.getElementById('erroGourmet').style.display = 'none';
  document.getElementById('gourmetModal').classList.add('show');
}

function fecharGourmetModal() {
  document.getElementById('gourmetModal').classList.remove('show');
}

function confirmarSaladaGourmet() {
  const copoSel = document.querySelector('input[name="gourmetCopo"]:checked');
  const frutasSel = [...document.querySelectorAll('#gourmetFrutasContainer input:checked')].map(f => f.value);
  const adicionaisSel = [...document.querySelectorAll('#gourmetAdicionaisContainer input:checked')].map(a => a.value);

  if (frutasSel.length === 0) {
    document.getElementById('erroGourmet').style.display = 'block';
    return;
  }

  const tamanho = copoSel.value.split('|')[0] + 'ml';
  const precoUnitario = parseFloat(copoSel.value.split('|')[1]);

  let detalheTexto = `Frutas: ${frutasSel.join(', ')}`;
  if (adicionaisSel.length) detalheTexto += `<br>Adicionais (Grátis): ${adicionaisSel.join(', ')}`;

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Salada Gourmet - ${gourmetTipoAtual} (${tamanho})`,
    detalhes: detalheTexto,
    precoUnitario: precoUnitario,
    qtd: 1
  });

  atualizarCarrinhoUI();
  fecharGourmetModal();
  toggleCartDrawer(true);
}

// ===================== SANDUÍCHES =====================
let sanduicheAtual = { nome: '', precoUnid: 0, precoSemanal: null };

function abrirSanduicheModal(nome, precoUnid, precoSemanal) {
  sanduicheAtual = { nome, precoUnid, precoSemanal };
  document.getElementById('sanduicheModalTitle').innerText = nome;
  
  const container = document.getElementById('sanduicheOptionsContainer');
  document.getElementById('erroSanduiche').style.display = 'none';

  let html = `
    <label class="opt-card">
      <input type="radio" name="sanduicheOpt" value="Unidade|${precoUnid}">
      <span>Unidade</span>
      <span class="price-tag">R$ ${precoUnid.toFixed(2).replace('.', ',')}</span>
    </label>
  `;

  if (precoSemanal !== null) {
    html += `
      <label class="opt-card">
        <input type="radio" name="sanduicheOpt" value="Semanal|${precoSemanal}">
        <span>Plano Semanal</span>
        <span class="price-tag">R$ ${precoSemanal.toFixed(2).replace('.', ',')}</span>
      </label>
    `;
  }

  container.innerHTML = html;
  aplicarDisponibilidadeEstoque();
  document.getElementById('sanduicheModal').style.display = 'flex';
}

function fecharSanduicheModal() {
  document.getElementById('sanduicheModal').style.display = 'none';
}

function confirmarSanduiche() {
  const selected = document.querySelector('input[name="sanduicheOpt"]:checked');
  if (!selected) {
    document.getElementById('erroSanduiche').style.display = 'block';
    return;
  }

  const [modalidade, precoStr] = selected.value.split('|');
  const preco = parseFloat(precoStr);
  const nomeItem = `${sanduicheAtual.nome} (${modalidade})`;

  adicionarItemDireto(nomeItem, preco);
  fecharSanduicheModal();
}

// ===================== ÁGUA DE COCO (item 1 do briefing) =====================
// Preços centralizados em CONFIG_PRECOS_PADRAO.aguaDeCoco / obterConfigPrecos().
function abrirAguaCocoModal() {
  const precos = obterConfigPrecos().aguaDeCoco || {};
  const container = document.getElementById('aguaCocoOptionsContainer');

  container.innerHTML = Object.keys(precos).map((tamanho, idx) => `
    <label class="opt-card">
      <input type="radio" name="aguaCocoOpt" value="${tamanho}|${precos[tamanho]}" ${idx === 0 ? 'checked' : ''}>
      <span>${tamanho}</span>
      <span class="price-tag">R$ ${Number(precos[tamanho]).toFixed(2).replace('.', ',')}</span>
    </label>
  `).join('');

  document.getElementById('erroAguaCoco').style.display = 'none';
  aplicarDisponibilidadeEstoque();
  document.getElementById('aguaCocoModal').classList.add('show');
}

function fecharAguaCocoModal() {
  document.getElementById('aguaCocoModal').classList.remove('show');
}

function confirmarAguaCoco() {
  const selecionado = document.querySelector('input[name="aguaCocoOpt"]:checked');
  if (!selecionado) {
    document.getElementById('erroAguaCoco').style.display = 'block';
    return;
  }
  const [tamanho, precoStr] = selecionado.value.split('|');
  adicionarItemDireto(`Água de Coco (${tamanho})`, parseFloat(precoStr));
  fecharAguaCocoModal();
}

// ===================== SUCO NATURAL (item 2 do briefing) =====================
// Usa o MESMO catálogo central de frutas (nenhuma lista separada é criada).
// Preços centralizados em CONFIG_PRECOS_PADRAO.sucoNatural / obterConfigPrecos().
function abrirSucoModal() {
  const precos = obterConfigPrecos().sucoNatural || {};

  const containerTamanho = document.getElementById('sucoTamanhoContainer');
  containerTamanho.innerHTML = Object.keys(precos).map((tamanho, idx) => `
    <label class="opt-card">
      <input type="radio" name="sucoTamanho" value="${tamanho}|${precos[tamanho]}" ${idx === 0 ? 'checked' : ''}>
      <span>${tamanho}</span>
      <span class="price-tag">R$ ${Number(precos[tamanho]).toFixed(2).replace('.', ',')}</span>
    </label>
  `).join('');

  const containerSabor = document.getElementById('sucoSaborContainer');
  containerSabor.innerHTML = SABORES_SUCO_NATURAL.map((sabor, idx) => `
    <label class="opt-card">
      <input type="radio" name="sucoSabor" value="${sabor}" ${idx === 0 ? 'checked' : ''}>
      <span>${sabor}</span>
    </label>
  `).join('');

  // Mesmo catálogo central de frutas usado em toda a aplicação.
  renderizarFrutasContainer('sucoFrutaContainer', 'radio', 'sucoFruta');

  document.getElementById('erroSuco').style.display = 'none';
  aplicarDisponibilidadeEstoque();
  document.getElementById('sucoModal').classList.add('show');
}

function fecharSucoModal() {
  document.getElementById('sucoModal').classList.remove('show');
}

function confirmarSuco() {
  const tamanhoSel = document.querySelector('input[name="sucoTamanho"]:checked');
  const saborSel = document.querySelector('input[name="sucoSabor"]:checked');
  const frutaSel = document.querySelector('input[name="sucoFruta"]:checked');

  if (!tamanhoSel || !saborSel || !frutaSel) {
    document.getElementById('erroSuco').style.display = 'block';
    return;
  }
  document.getElementById('erroSuco').style.display = 'none';

  const [tamanho, precoStr] = tamanhoSel.value.split('|');
  const precoUnitario = parseFloat(precoStr);

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Suco Natural (${tamanho})`,
    detalhes: `Sabor: ${saborSel.value}<br>Fruta: ${frutaSel.value}`,
    precoUnitario: precoUnitario,
    qtd: 1
  });

  atualizarCarrinhoUI();
  fecharSucoModal();
  toggleCartDrawer(true);
}

// ===================== BOTÃO DIRETO WHATSAPP =====================
function abrirWhatsAppDireto() {
  const msg = encodeURIComponent("Olá! Gostaria de fazer um pedido pelo WhatsApp.");
  window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${msg}`, '_blank');
}

// ===================== ACESSO RESTRITO ADMIN =====================
function acessarAdmin() {
  const senhaCorreta = "Frutue@2026";
  const senhaInformada = prompt("Digite a senha do Administrador:");

  if (senhaInformada === senhaCorreta) {
    sessionStorage.setItem('admin_autenticado', 'true');
    window.location.href = "admin.html";
  } else if (senhaInformada !== null) {
    alert("❌ Senha incorreta! Acesso negado.");
  }
}
// ===================== GEOLOCALIZAÇÃO (GPS) =====================
function obterLocalizacaoGPS() {
  const inputEndereco = document.getElementById('clienteEndereco') || document.getElementById('enderecoInput');

  if (!navigator.geolocation) {
    alert("❌ Seu navegador ou dispositivo não suporta geolocalização.");
    return;
  }

  if (inputEndereco) {
    inputEndereco.placeholder = "Buscando sua localização...";
  }

  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      const lat = posicao.coords.latitude;
      const lng = posicao.coords.longitude;
      const linkMapas = `https://maps.google.com/?q=${lat},${lng}`;

      if (inputEndereco) {
        inputEndereco.value = `📍 Localização GPS: ${linkMapas}`;
      } else {
        alert(`Sua localização:\n${linkMapas}`);
      }
    },
    (erro) => {
      let mensagem = "Não foi possível obter sua localização.";
      switch (erro.code) {
        case erro.PERMISSION_DENIED:
          mensagem = "❌ Permissão de localização negada pelo usuário.";
          break;
        case erro.POSITION_UNAVAILABLE:
          mensagem = "❌ Informação de localização indisponível no momento.";
          break;
        case erro.TIMEOUT:
          mensagem = "❌ Tempo limite esgotado ao buscar localização.";
          break;
      }
      alert(mensagem);
      if (inputEndereco) {
        inputEndereco.placeholder = "Digite seu endereço completo (Rua, Número, Bairro)...";
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}