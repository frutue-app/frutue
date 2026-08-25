// ===================== CONFIGURAÇÃO GERAL =====================
// Nenhuma credencial sensível aqui - apenas dados públicos.
const CONFIG = {
  whatsappNumero: "558695948843",
  pixChave: "loja@exemplo.com",
  pixNomeRecebedor: "FRUTUE",
  pixCidade: "SAO PAULO",
  // Cole aqui a URL do seu Google Apps Script publicado como Web App (veja README.md)
  apiUrl: "https://script.google.com/macros/s/AKfycbxHTowPSlJ_fvKNFYJprhugOyLBhdA4rdvUWjz4wWFWCVDx-Jbwdr71aO7Q2vee7pxWNw/exec"
};

let carrinho = [];
let montadorQtd = 1;

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
      id: Date.now(),
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
    listEl.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Seu carrinho está vazio.</p>';
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
          <button class="cart-item-remove" onclick="removerItemCarrinho(${item.id})">Remover</button>
        </div>
      `;
      listEl.appendChild(itemEl);
    });
  }

  document.getElementById('cartCount').textContent = totalItens;
  document.getElementById('cartSubtotal').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
  document.getElementById('totalValorBarra').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
}

// ===================== MONTADOR DE SALADAS =====================

function abrirMontadorSalada() {
  montadorQtd = 1;
  document.getElementById('montadorQtdVal').textContent = montadorQtd;

  document.querySelectorAll('#saladaModal input[type="radio"]').forEach(r => r.checked = false);
  document.querySelectorAll('#saladaModal input[type="checkbox"]').forEach(c => c.checked = false);
  const defaultCobertura = document.querySelector('input[name="tempCobertura"][value="Nenhuma|0"]');
  if (defaultCobertura) defaultCobertura.checked = true;

  atualizarLabelsSalada();
  document.getElementById('erroMontador').style.display = 'none';
  document.getElementById('saladaModal').classList.add('show');

  // Dentro de abrirMontadorSalada():
const defaultGourmet = document.querySelector('input[name="tempGourmet"][value="Nenhuma|0"]');
if (defaultGourmet) defaultGourmet.checked = true;

// Em atualizarLabelsSalada():
function atualizarLabelsSalada() {
  const copoChecked = document.querySelector('input[name="tempCopo"]:checked');
  const frutasChecked = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);
  const adicionaisChecked = [...document.querySelectorAll('#adicionaisContainer input:checked')].map(a => a.value);
  const gourmetChecked = document.querySelector('input[name="tempGourmet"]:checked');

  document.getElementById('lblCopo').textContent = copoChecked ? copoChecked.value.split('|')[0] + 'ml' : 'Escolher tamanho *';
  document.getElementById('lblFrutas').textContent = frutasChecked.length ? frutasChecked.join(', ') : 'Escolher frutas *';
  document.getElementById('lblAdicionais').textContent = adicionaisChecked.length ? adicionaisChecked.join(', ') : 'Opcional';
  
  const lblGourmet = document.getElementById('lblGourmet');
  if (lblGourmet) {
    lblGourmet.textContent = gourmetChecked ? gourmetChecked.value.split('|')[0] : 'Opcional';
  }
}
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
  const coberturaChecked = document.querySelector('input[name="tempCobertura"]:checked');

  document.getElementById('lblCopo').textContent = copoChecked ? copoChecked.value.split('|')[0] + 'ml' : 'Escolher tamanho *';
  document.getElementById('lblFrutas').textContent = frutasChecked.length ? frutasChecked.join(', ') : 'Escolher frutas *';
  document.getElementById('lblAdicionais').textContent = adicionaisChecked.length ? adicionaisChecked.join(', ') : 'Opcional';
  document.getElementById('lblCobertura').textContent = coberturaChecked ? coberturaChecked.value.split('|')[0] : 'Opcional';
}

function confirmarSaladaEAdicionar() {
  const copoSel = document.querySelector('input[name="tempCopo"]:checked');
  const frutasSel = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);

  if (!copoSel || frutasSel.length === 0) {
    document.getElementById('erroMontador').style.display = 'block';
    return;
  }

  document.getElementById('erroMontador').style.display = 'none';

  let precoUnitario = parseFloat(copoSel.value.split('|')[1]);
  const tamanho = copoSel.value.split('|')[0] + 'ml';

  const adicionaisNodes = [...document.querySelectorAll('#adicionaisContainer input:checked')];
  let adicionaisNomes = [];
  adicionaisNodes.forEach(node => {
    precoUnitario += parseFloat(node.dataset.preco);
    adicionaisNomes.push(node.value);
  });

  const coberturaSel = document.querySelector('input[name="tempCobertura"]:checked');
  let coberturaNome = "Nenhuma";
  if (coberturaSel) {
    const parts = coberturaSel.value.split('|');
    coberturaNome = parts[0];
    precoUnitario += parseFloat(parts[1]);
  }

  let detalheTexto = `Frutas: ${frutasSel.join(', ')}`;
  if (adicionaisNomes.length) detalheTexto += `<br>Adicionais: ${adicionaisNomes.join(', ')}`;
  if (coberturaNome !== "Nenhuma") detalheTexto += `<br>Cobertura: ${coberturaNome}`;

  carrinho.push({
    id: Date.now(),
    nome: `Salada de Frutas (${tamanho})`,
    detalhes: detalheTexto,
    precoUnitario: precoUnitario,
    qtd: montadorQtd
  });

  atualizarCarrinhoUI();
  fecharSaladaModal();
  toggleCartDrawer(true);
}
function confirmarSaladaEAdicionar() {
  const copoSel = document.querySelector('input[name="tempCopo"]:checked');
  const frutasSel = [...document.querySelectorAll('#frutasContainer input:checked')].map(f => f.value);

  if (!copoSel || frutasSel.length === 0) {
    document.getElementById('erroMontador').style.display = 'block';
    return;
  }

  document.getElementById('erroMontador').style.display = 'none';

  let precoUnitario = parseFloat(copoSel.value.split('|')[1]);
  const tamanho = copoSel.value.split('|')[0] + 'ml';

  const adicionaisNodes = [...document.querySelectorAll('#adicionaisContainer input:checked')];
  let adicionaisNomes = [];
  adicionaisNodes.forEach(node => {
    precoUnitario += parseFloat(node.dataset.preco);
    adicionaisNomes.push(node.value);
  });

  // Leitura da opção Gourmet
  const gourmetSel = document.querySelector('input[name="tempGourmet"]:checked');
  let gourmetNome = "Nenhuma";
  if (gourmetSel) {
    const parts = gourmetSel.value.split('|');
    gourmetNome = parts[0];
    precoUnitario += parseFloat(parts[1]);
  }

  let detalheTexto = `Frutas: ${frutasSel.join(', ')}`;
  if (adicionaisNomes.length) detalheTexto += `<br>Adicionais: ${adicionaisNomes.join(', ')}`;
  if (gourmetNome !== "Nenhuma") detalheTexto += `<br>Gourmet: ${gourmetNome}`;

  carrinho.push({
    id: Date.now(),
    nome: `Salada de Frutas (${tamanho})`,
    detalhes: detalheTexto,
    precoUnitario: precoUnitario,
    qtd: montadorQtd
  });

  atualizarCarrinhoUI();
  fecharSaladaModal();
  toggleCartDrawer(true);
}
