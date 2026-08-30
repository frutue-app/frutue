// Autenticação da sessão
(function verificarAcesso() {
  const autorizacao = sessionStorage.getItem('admin_autenticado');
  if (!autorizacao) {
    const senha = prompt("Acesso restrito. Digite a senha do Administrador:");
    if (senha === "Frutue@2026") {
      sessionStorage.setItem('admin_autenticado', 'true');
    } else {
      alert("❌ Senha incorreta!");
      window.location.href = "index.html";
    }
  }
})();

// Lista de produtos gerenciáveis que NÃO são frutas. As FRUTAS não aparecem
// mais aqui: elas vêm do catálogo central (CATALOGO_FRUTAS_PADRAO / obterCatalogoFrutas(),
// definido em app.js), que é a ÚNICA fonte de frutas do sistema (item 10 do
// briefing — nada de lista duplicada).
const produtosPadrao = [
  // Categorias de Saladas
  { id: "salada_simples", nome: "Salada Simples", categoria: "Saladas", disponivel: true },
  { id: "salada_peso", nome: "Salada por Peso", categoria: "Saladas", disponivel: true },
  { id: "dulce_fit", nome: "Dulce Fit", categoria: "Saladas Gourmet", disponivel: true },
  { id: "iogurte_natural", nome: "Iogurte Natural", categoria: "Saladas Gourmet", disponivel: true },
  { id: "iogurte_whey", nome: "Iogurte + Whey", categoria: "Saladas Gourmet", disponivel: true },
  { id: "creme_whey", nome: "Creme de Whey", categoria: "Saladas Gourmet", disponivel: true },
  { id: "creme_ninho", nome: "Creme de Ninho", categoria: "Saladas Gourmet", disponivel: true },
  { id: "nutella", nome: "Nutella", categoria: "Saladas Gourmet", disponivel: true },

  // Outros Produtos
  { id: "frango_desfiado", nome: "Frango Desfiado", categoria: "Proteínas", disponivel: true },
  { id: "sanduiche_natural", nome: "Sanduíche Natural", categoria: "Sanduíches", disponivel: true },
  { id: "suco_detox", nome: "Suco Detox", categoria: "Bebidas", disponivel: true },
  { id: "agua_de_coco", nome: "Água de Coco", categoria: "Bebidas", disponivel: true },
  { id: "suco_natural", nome: "Suco Natural", categoria: "Bebidas", disponivel: true }
];

// ===================== ESTOQUE (produtos não-fruta) =====================

function obterEstoqueGeral() {
  if (window.estoqueAtual) return window.estoqueAtual;
  const salvo = localStorage.getItem('frutue_estoque_geral');
  return salvo ? JSON.parse(salvo) : produtosPadrao;
}

function salvarEstoqueGeral(estoque) {
  window.estoqueAtual = estoque;
  localStorage.setItem('frutue_estoque_geral', JSON.stringify(estoque));

  if (typeof CONFIG === 'undefined' || !CONFIG.apiUrl) {
    console.warn('[Frutue][estoque] CONFIG.apiUrl não encontrado — a alteração ficou salva só neste navegador e não chegará aos clientes.');
    return;
  }

  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'atualizarEstoque', estoque: estoque })
  }).catch(err => {
    console.error('[Frutue][estoque] Falha ao sincronizar estoque com o servidor:', err);
    alert('⚠️ Não foi possível salvar essa alteração no servidor. Os clientes podem não ver essa mudança. Verifique sua internet e tente novamente.');
  });
}

// ===================== CATÁLOGO DE FRUTAS (fonte única, item 4/10) =====================
// obterCatalogoFrutas() e normalizarNomeProduto() vêm de app.js.

function salvarCatalogoFrutas(catalogo) {
  window.catalogoFrutasAtual = catalogo;
  localStorage.setItem('frutue_catalogo_frutas', JSON.stringify(catalogo));

  if (typeof CONFIG === 'undefined' || !CONFIG.apiUrl) {
    console.warn('[Frutue][frutas] CONFIG.apiUrl não encontrado — a alteração ficou salva só neste navegador.');
    return;
  }

  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'atualizarCatalogoFrutas', catalogoFrutas: catalogo })
  }).catch(err => {
    console.error('[Frutue][frutas] Falha ao sincronizar catálogo de frutas com o servidor:', err);
    alert('⚠️ Não foi possível salvar essa alteração no servidor. Os clientes podem não ver essa mudança. Verifique sua internet e tente novamente.');
  });
}

// Converte o catálogo de frutas em "produtos" só para exibição no mesmo
// painel de disponibilidade usado pelos demais itens — sem criar uma segunda
// lista de dados, apenas uma projeção temporária para desenhar a tela.
function frutasComoProdutosParaExibicao() {
  return obterCatalogoFrutas().map(f => ({
    id: 'fruta_' + normalizarNomeProduto(f.nome).replace(/\s+/g, '_'),
    nome: `${f.nome} ${f.emoji || ''}`.trim(),
    categoria: 'Frutas',
    disponivel: f.ativo !== false
  }));
}

// ===================== RENDERIZAÇÃO DO PAINEL DE ESTOQUE/DISPONIBILIDADE =====================

function renderizarPainelAdmin() {
  const container = document.getElementById('adminCategoriasContainer');
  const itens = [...frutasComoProdutosParaExibicao(), ...obterEstoqueGeral()];

  const categorias = [...new Set(itens.map(i => i.categoria))];

  container.innerHTML = categorias.map(cat => `
    <div class="sec-header">${cat}</div>
    ${itens.filter(i => i.categoria === cat).map(item => `
      <div class="item-row">
        <span>${item.nome}</span>
        <label class="switch">
          <input type="checkbox" ${item.disponivel ? 'checked' : ''} onchange="alterarStatus('${item.id}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>
    `).join('')}
  `).join('');
}

function alterarStatus(id, status) {
  // Itens de fruta (prefixo "fruta_") atualizam o catálogo central de
  // frutas; os demais continuam usando o estoque geral, como antes.
  if (id.indexOf('fruta_') === 0) {
    const catalogo = obterCatalogoFrutas();
    const idSemPrefixo = id.replace('fruta_', '');
    const fruta = catalogo.find(f => normalizarNomeProduto(f.nome).replace(/\s+/g, '_') === idSemPrefixo);
    if (fruta) {
      fruta.ativo = status;
      salvarCatalogoFrutas(catalogo);
    }
    return;
  }

  const estoque = obterEstoqueGeral();
  const item = estoque.find(i => i.id === id);
  if (item) {
    item.disponivel = status;
    salvarEstoqueGeral(estoque);
  }
}

// ===================== PAINEL DE PREÇOS E CONFIGURAÇÕES (item 9/12) =====================
// Tudo aqui lê/grava no mesmo formato usado por obterConfigPrecos() em
// app.js, então uma alteração aqui já vale para todo o site — nenhum preço
// fica "solto" ou duplicado em outro arquivo.

function salvarConfigPrecos(config) {
  window.configPrecosAtual = config;
  localStorage.setItem('frutue_config_precos', JSON.stringify(config));

  if (typeof CONFIG === 'undefined' || !CONFIG.apiUrl) {
    console.warn('[Frutue][preços] CONFIG.apiUrl não encontrado — a alteração ficou salva só neste navegador.');
    alert('⚠️ Preços salvos apenas neste navegador (sem servidor configurado).');
    return;
  }

  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'atualizarConfigPrecos', configPrecos: config })
  }).then(() => {
    alert('✅ Preços salvos com sucesso! Já valem para todos os clientes.');
  }).catch(err => {
    console.error('[Frutue][preços] Falha ao sincronizar preços com o servidor:', err);
    alert('⚠️ Não foi possível salvar no servidor. Os clientes podem não ver essa mudança. Verifique sua internet e tente novamente.');
  });
}

function campoPrecoHtml(label, inputId, valor, passo) {
  return `
    <div class="field" style="margin-bottom:10px;">
      <label style="font-size:0.85rem;">${label}</label>
      <input type="number" id="${inputId}" value="${valor}" step="${passo || '0.01'}" min="0" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">
    </div>
  `;
}

function renderizarPainelPrecos() {
  const container = document.getElementById('adminPrecosContainer');
  if (!container) return; // admin.html antigo sem essa seção — não quebra nada

  const config = obterConfigPrecos();

  let html = '<div class="sec-header">⚙️ Regras Gerais</div>';
  html += campoPrecoHtml('Máximo de acompanhamentos grátis', 'cfgMaxAcompanhamentos', config.maxAcompanhamentos, '1');
  html += campoPrecoHtml('Salada por Peso — preço por grama (demais frutas)', 'cfgPrecoGramaPadrao', config.precoPorGramaPadrao, '0.001');
  html += campoPrecoHtml('Salada por Peso — preço por grama (frutas especiais, ex.: Morango)', 'cfgPrecoGramaEspecial', config.precoPorGramaEspecial, '0.001');

  html += '<div class="sec-header">🥥 Água de Coco</div>';
  Object.keys(config.aguaDeCoco || {}).forEach(tamanho => {
    const id = 'cfgAguaCoco_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    html += campoPrecoHtml(`Água de Coco — ${tamanho}`, id, config.aguaDeCoco[tamanho]);
  });

  html += '<div class="sec-header">🧃 Suco Natural</div>';
  Object.keys(config.sucoNatural || {}).forEach(tamanho => {
    const id = 'cfgSuco_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    html += campoPrecoHtml(`Suco Natural — ${tamanho}`, id, config.sucoNatural[tamanho]);
  });

  html += '<div class="sec-header">🍓 Salada Simples — Preço Especial (fruta especial, ex.: Morango)</div>';
  Object.keys(config.saladaSimplesFrutaEspecial || {}).forEach(tamanho => {
    const id = 'cfgSaladaEspecial_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    html += campoPrecoHtml(`Salada Simples — ${tamanho}`, id, config.saladaSimplesFrutaEspecial[tamanho]);
  });

  html += `
    <button type="button" class="btn-primary" style="width:100%; margin-top:14px;" onclick="salvarPrecosDoFormulario()">
      💾 Salvar Preços e Configurações
    </button>
  `;

  container.innerHTML = html;
}

function salvarPrecosDoFormulario() {
  const config = obterConfigPrecos();

  const novoConfig = Object.assign({}, config, {
    maxAcompanhamentos: parseInt(document.getElementById('cfgMaxAcompanhamentos').value, 10) || config.maxAcompanhamentos,
    precoPorGramaPadrao: parseFloat(document.getElementById('cfgPrecoGramaPadrao').value) || config.precoPorGramaPadrao,
    precoPorGramaEspecial: parseFloat(document.getElementById('cfgPrecoGramaEspecial').value) || config.precoPorGramaEspecial,
    aguaDeCoco: {},
    sucoNatural: {},
    saladaSimplesFrutaEspecial: {}
  });

  Object.keys(config.aguaDeCoco || {}).forEach(tamanho => {
    const id = 'cfgAguaCoco_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    novoConfig.aguaDeCoco[tamanho] = el ? (parseFloat(el.value) || 0) : config.aguaDeCoco[tamanho];
  });

  Object.keys(config.sucoNatural || {}).forEach(tamanho => {
    const id = 'cfgSuco_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    novoConfig.sucoNatural[tamanho] = el ? (parseFloat(el.value) || 0) : config.sucoNatural[tamanho];
  });

  Object.keys(config.saladaSimplesFrutaEspecial || {}).forEach(tamanho => {
    const id = 'cfgSaladaEspecial_' + tamanho.replace(/[^a-zA-Z0-9]/g, '_');
    const el = document.getElementById(id);
    novoConfig.saladaSimplesFrutaEspecial[tamanho] = el ? (parseFloat(el.value) || 0) : config.saladaSimplesFrutaEspecial[tamanho];
  });

  salvarConfigPrecos(novoConfig);
}

// ===================== INICIALIZAÇÃO =====================

document.addEventListener('DOMContentLoaded', () => {
  const finalizarCarregamento = () => {
    if (!window.estoqueAtual || window.estoqueAtual.length === 0) {
      // Primeira vez que o Admin roda: usa a lista padrão e já grava no
      // servidor para estabelecer a base que os clientes vão consultar.
      window.estoqueAtual = produtosPadrao;
      salvarEstoqueGeral(window.estoqueAtual);
    }
    renderizarPainelAdmin();
    renderizarPainelPrecos();
  };

  const carregarEstoque = typeof carregarEstoqueDoServidor === 'function'
    ? carregarEstoqueDoServidor()
    : Promise.resolve(null);

  const carregarConfigGeral = typeof carregarConfigGeralDoServidor === 'function'
    ? carregarConfigGeralDoServidor()
    : Promise.resolve(null);

  if (typeof carregarEstoqueDoServidor !== 'function' || typeof carregarConfigGeralDoServidor !== 'function') {
    console.warn('[Frutue] Funções de app.js não encontradas — confirme que app.js foi incluído em admin.html antes de admin.js.');
  }

  Promise.all([carregarEstoque, carregarConfigGeral]).then(finalizarCarregamento);
});