// ===================== CONFIGURAÇÃO GERAL =====================
const CONFIG = {
  whatsappNumero: "558695948843",
  pixChave: "loja@exemplo.com",
  pixNomeRecebedor: "FRUTUE",
  pixCidade: "SAO PAULO",
  apiUrl: "https://script.google.com/macros/s/AKfycbxHTowPSlJ_fvKNFYJprhugOyLBhdA4rdvUWjz4wWFWCVDx-Jbwdr71aO7Q2vee7pxWNw/exec"
};

// ESTRUTURA DO SACOLÃO
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

const FRUTAS_DISPONIVEIS_PESO = [
  "Morango 🍓", "Banana 🍌", "Maçã 🍎", "Uva 🍇", "Kiwi 🥝",
  "Manga 🥭", "Abacaxi 🍍", "Mamão 🍑", "Melancia 🍉", "Melão 🍈"
];

let carrinho = [];
let montadorQtd = 1;
let gourmetTipoAtual = '';
let sacolaoQtds = {};

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  renderizarListaFrutasPeso();
  renderizarSacolao();
  atualizarCarrinhoUI();
});

// ===================== CARRINHO LATERAL =====================
function toggleCartDrawer(open) {
  document.getElementById('cartOverlay').classList.toggle('show', open);
  document.getElementById('cartDrawer').classList.toggle('open', open);
}

function adicionarItemDireto(nome, preco) {
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

function atualizarCarrinhoUI() {
  const listEl = document.getElementById('cartList');
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

  document.getElementById('cartCount').textContent = totalItens;
  document.getElementById('cartSubtotal').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
  document.getElementById('totalValorBarra').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
}

// ===================== MODAL SACOLÃO =====================
function abrirSacolaoModal() {
  document.getElementById('erroSacolao').style.display = 'none';
  document.getElementById('sacolaoModal').classList.add('show');
}

function fecharSacolaoModal() {
  document.getElementById('sacolaoModal').classList.remove('show');
}

function renderizarSacolao() {
  const container = document.getElementById('sacolaoCategoriasList');
  if (!container) return;
  container.innerHTML = '';

  SACOLAO_DADOS.forEach(grupo => {
    const grupoEl = document.createElement('div');
    grupoEl.className = 'sacolao-grupo';

    let gridHtml = `<div class="sacolao-grid">`;
    grupo.itens.forEach(item => {
      sacolaoQtds[item.id] = 0;
      gridHtml += `
        <div class="sacolao-card">
          <div class="sacolao-info">
            <span class="sacolao-nome">${item.nome}</span>
            <span class="sacolao-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="alterarQtdSacolao('${item.id}', -1)">-</button>
            <span class="qty-val" id="sacolao_qty_${item.id}">0</span>
            <button type="button" class="qty-btn" onclick="alterarQtdSacolao('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
    });
    gridHtml += `</div>`;

    grupoEl.innerHTML = `<h4>${grupo.categoria}</h4>${gridHtml}`;
    container.appendChild(grupoEl);
  });
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
  fecharSacolaoModal();
  atualizarCarrinhoUI();
  toggleCartDrawer(true);
}

// ===================== SALADA POR PESO =====================
function abrirSaladaPesoModal() {
  document.getElementById('erroSaladaPeso').style.display = 'none';
  document.getElementById('saladaPesoModal').classList.add('show');
  calcularTotalSaladaPeso();
}

function fecharSaladaPesoModal() {
  document.getElementById('saladaPesoModal').classList.remove('show');
}

function renderizarListaFrutasPeso() {
  const container = document.getElementById('pesoFrutasList');
  if (!container) return;
  container.innerHTML = '';

  FRUTAS_DISPONIVEIS_PESO.forEach((fruta, idx) => {
    const row = document.createElement('div');
    row.className = 'peso-item-row';
    row.innerHTML = `
      <label class="peso-item-label" for="pesoFruta_${idx}">
        <input type="checkbox" id="pesoFruta_${idx}" onchange="togglePesoInput(${idx}); calcularTotalSaladaPeso();">
        <span>${fruta}</span>
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
  const precoPorKg = 35.00;
  let pesoTotalGramos = 0;

  FRUTAS_DISPONIVEIS_PESO.forEach((_, idx) => {
    const chk = document.getElementById(`pesoFruta_${idx}`);
    const input = document.getElementById(`pesoGramas_${idx}`);
    if (chk && chk.checked) {
      const val = parseFloat(input.value) || 0;
      pesoTotalGramos += val;
    }
  });

  const valorTotal = (pesoTotalGramos / 1000) * precoPorKg;

  document.getElementById('pesoTotalGrams').textContent = `${pesoTotalGramos} g`;
  document.getElementById('pesoTotalValor').textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;

  return { pesoTotalGramos, valorTotal };
}

function confirmarSaladaPeso() {
  const { pesoTotalGramos, valorTotal } = calcularTotalSaladaPeso();
  let detalheFrutas = [];

  FRUTAS_DISPONIVEIS_PESO.forEach((fruta, idx) => {
    const chk = document.getElementById(`pesoFruta_${idx}`);
    const input = document.getElementById(`pesoGramas_${idx}`);
    if (chk && chk.checked) {
      const val = parseFloat(input.value) || 0;
      if (val > 0) {
        detalheFrutas.push(`${fruta.replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim()}: ${val}g`);
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

  FRUTAS_DISPONIVEIS_PESO.forEach((_, idx) => {
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
  atualizarLabelsSalada();
  document.getElementById('erroMontador').style.display = 'none';
  document.getElementById('saladaModal').classList.add('show');
}

function fecharSaladaModal() {
  document.getElementById('saladaModal').classList.remove('show');
}

function alterarQtdMontador(delta) {
  montadorQtd += delta;
  if (montadorQtd < 1) montadorQtd = 1;
  document.getElementById('montadorQtdVal').textContent = montadorQtd;
}

function abrirSubModal(id) { document.getElementById(id).classList.add('show'); }
function fecharSubModal(id) { document.getElementById(id).classList.remove('show'); }

function atualizarLabelsSalada() {
  const copoChecked = document.querySelector('input[name="tempCopo"]:checked');
  const frutasChecked = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);
  const adicionaisChecked = [...document.querySelectorAll('#adicionaisContainer input:checked')].map(a => a.value);

  document.getElementById('lblCopo').textContent = copoChecked ? copoChecked.value.split('|')[0] + 'ml' : 'Escolher tamanho *';
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

  const [tamanhoMl, precoCopo] = copoSel.value.split('|');
  let precoUnitario = parseFloat(precoCopo);
  const tamanho = `${tamanhoMl}ml`;

  const adicionaisNodes = [...document.querySelectorAll('#adicionaisContainer input:checked')];
  let adicionaisNomes = [];
  adicionaisNodes.forEach(node => {
    precoUnitario += parseFloat(node.dataset.preco || 0);
    adicionaisNomes.push(node.value);
  });

  let detalheTexto = `Frutas: ${frutasSel.join(', ')}`;
  if (adicionaisNomes.length) detalheTexto += `<br>Adicionais: ${adicionaisNomes.join(', ')}`;

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Salada Simples (${tamanho})`,
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
  document.querySelectorAll('#gourmetFrutasContainer input').forEach(c => c.checked = false);
  document.getElementById('erroGourmet').style.display = 'none';
  document.getElementById('gourmetModal').classList.add('show');
}

function fecharGourmetModal() {
  document.getElementById('gourmetModal').classList.remove('show');
}

function confirmarSaladaGourmet() {
  const copoSel = document.querySelector('input[name="gourmetCopo"]:checked');
  const frutasSel = [...document.querySelectorAll('#gourmetFrutasContainer input:checked')].map(f => f.value);

  if (frutasSel.length === 0) {
    document.getElementById('erroGourmet').style.display = 'block';
    return;
  }

  const tamanho = copoSel.value.split('|')[0] + 'ml';
  const precoUnitario = parseFloat(copoSel.value.split('|')[1]);

  carrinho.push({
    id: Date.now() + Math.random(),
    nome: `Salada Gourmet - ${gourmetTipoAtual} (${tamanho})`,
    detalhes: `Frutas: ${frutasSel.join(', ')}`,
    precoUnitario: precoUnitario,
    qtd: 1
  });

  atualizarCarrinhoUI();
  fecharGourmetModal();
  toggleCartDrawer(true);
}

// ===================== SUCO PERSONALIZADO =====================
function abrirSucoModal() {
  document.getElementById('sucoModal').classList.add('show');
}
function fecharSucoModal() {
  document.getElementById('sucoModal').classList.remove('show');
}
function confirmarSucoPersonalizado() {
  const frutaSel = document.querySelector('input[name="sucoFruta"]:checked').value;
  adicionarItemDireto(`Suco de ${frutaSel} (500ml)`, 7.50);
  fecharSucoModal();
}

// ===================== GEOLOCALIZAÇÃO =====================
function obterLocalizacaoGPS() {
  const status = document.getElementById('locationStatus');
  if (!navigator.geolocation) {
    status.textContent = '❌ Geolocalização não suportada pelo seu navegador.';
    return;
  }

  status.textContent = '📍 Capturando coordenadas...';
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const linkMapas = `https://www.google.com/maps?q=${lat},${lng}`;
      document.getElementById('localizacaoHidden').value = linkMapas;
      status.textContent = '✅ Localização capturada com sucesso!';
    },
    (error) => {
      console.error(error);
      status.textContent = '❌ Erro ao capturar localização. Verifique as permissões de GPS.';
    }
  );
}