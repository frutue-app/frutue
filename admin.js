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
  const salvo = localStorage.getItem('frutue_estoque_geral');
  return salvo ? JSON.parse(salvo) : produtosPadrao;
}

function salvarEstoqueGeral(estoque) {
  localStorage.setItem('frutue_estoque_geral', JSON.stringify(estoque));
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

document.addEventListener('DOMContentLoaded', renderizarPainelAdmin);