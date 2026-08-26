// Lista padrão de frutas
const frutasPadrao = [
  { id: 'morango', nome: 'Morango 🍓', disponivel: true },
  { id: 'banana', nome: 'Banana 🍌', disponivel: true },
  { id: 'maca', nome: 'Maçã 🍎', disponivel: true },
  { id: 'uva', nome: 'Uva 🍇', disponivel: true },
  { id: 'kiwi', nome: 'Kiwi 🥝', disponivel: true },
  { id: 'manga', nome: 'Manga 🥭', disponivel: true },
  { id: 'abacaxi', nome: 'Abacaxi 🍍', disponivel: true },
  { id: 'mamao', nome: 'Mamão 🍑', disponivel: true },
  { id: 'melancia', nome: 'Melancia 🍉', disponivel: true },
  { id: 'melao', nome: 'Melão 🍈', disponivel: true }
];
// Verifica a senha se tentar entrar diretamente pela URL
(function verificarAcessoDirecto() {
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
// Carrega ou inicializa a disponibilidade
function obterEstoqueFrutas() {
  const salvo = localStorage.getItem('frutue_estoque_frutas');
  return salvo ? JSON.parse(salvo) : frutasPadrao;
}

function salvarEstoqueFrutas(estoque) {
  localStorage.setItem('frutue_estoque_frutas', JSON.stringify(estoque));
}

// Renderiza a lista no Admin
function renderizarAdmin() {
  const container = document.getElementById('adminFrutasList');
  const estoque = obterEstoqueFrutas();
  
  container.innerHTML = estoque.map(item => `
    <div class="item-row">
      <span><strong>${item.nome}</strong></span>
      <label class="switch">
        <input type="checkbox" ${item.disponivel ? 'checked' : ''} onchange="alterarStatusFruta('${item.id}', this.checked)">
        <span class="slider"></span>
      </label>
    </div>
  `).join('');
}

function alterarStatusFruta(id, status) {
  const estoque = obterEstoqueFrutas();
  const fruta = estoque.find(f => f.id === id);
  if (fruta) {
    fruta.disponivel = status;
    salvarEstoqueFrutas(estoque);
  }
}

document.addEventListener('DOMContentLoaded', renderizarAdmin);