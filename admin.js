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

// Lista geral de todos os produtos gerenciáveis
const produtosPadrao = [
  // Frutas
  { id: "morango", nome: "Morango 🍓", categoria: "Frutas", disponivel: true },
  { id: "banana", nome: "Banana 🍌", categoria: "Frutas", disponivel: true },
  { id: "maca", nome: "Maçã 🍎", categoria: "Frutas", disponivel: true },
  { id: "uva", nome: "Uva 🍇", categoria: "Frutas", disponivel: true },
  { id: "kiwi", nome: "Kiwi 🥝", categoria: "Frutas", disponivel: true },
  { id: "manga", nome: "Manga 🥭", categoria: "Frutas", disponivel: true },
  { id: "abacaxi", nome: "Abacaxi 🍍", categoria: "Frutas", disponivel: true },
  { id: "mamao", nome: "Mamão 🍑", categoria: "Frutas", disponivel: true },
  { id: "melancia", nome: "Melancia 🍉", categoria: "Frutas", disponivel: true },
  { id: "melao", nome: "Melão 🍈", categoria: "Frutas", disponivel: true },

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
  { id: "suco_detox", nome: "Suco Detox", categoria: "Bebidas", disponivel: true }
];

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

function renderizarPainelAdmin() {
  const container = document.getElementById('adminCategoriasContainer');
  const estoque = obterEstoqueGeral();

  const categorias = [...new Set(estoque.map(i => i.categoria))];

  container.innerHTML = categorias.map(cat => `
    <div class="sec-header">${cat}</div>
    ${estoque.filter(i => i.categoria === cat).map(item => `
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
  const estoque = obterEstoqueGeral();
  const item = estoque.find(i => i.id === id);
  if (item) {
    item.disponivel = status;
    salvarEstoqueGeral(estoque);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const finalizarCarregamento = () => {
    if (!window.estoqueAtual || window.estoqueAtual.length === 0) {
      // Primeira vez que o Admin roda: usa a lista padrão e já grava no
      // servidor para estabelecer a base que os clientes vão consultar.
      window.estoqueAtual = produtosPadrao;
      salvarEstoqueGeral(window.estoqueAtual);
    }
    renderizarPainelAdmin();
  };

  if (typeof carregarEstoqueDoServidor === 'function') {
    carregarEstoqueDoServidor().then(finalizarCarregamento);
  } else {
    console.warn('[Frutue][estoque] carregarEstoqueDoServidor não encontrado — confirme que app.js foi incluído em admin.html antes de admin.js.');
    finalizarCarregamento();
  }
});