// ===================== CONFIGURAÇÃO GERAL =====================
const CONFIG = {
  whatsappNumero: "558695948843",
  pixChave: "09002037309", // Substitua pelo seu e-mail/CPF/CNPJ/Telefone cadastrado no PIX
  pixNomeRecebedor: "FRUTUE",
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

const FRUTAS_DISPONIVEIS_PESO = [
  "Morango 🍓", "Banana 🍌", "Maçã 🍎", "Uva 🍇", "Kiwi 🥝",
  "Manga 🥭", "Abacaxi 🍍", "Mamão 🍑", "Melancia 🍉", "Melão 🍈"
];

// ADICIONAIS GRATUITOS (Removidas Castanhas e Preços)
const ADICIONAIS_DISPONIVEIS = [
  "Granola", "Leite em Pó", "Mel", "Chia", "Aveia", "Gotas de Chocolate", "Coco Ralado"
];

let carrinho = [];
let montadorQtd = 1;
let gourmetTipoAtual = '';
let sacolaoQtds = {};

// ===================== INICIALIZAÇÃO =====================
document.addEventListener('DOMContentLoaded', () => {
  renderizarListaFrutasPeso();
  renderizarSacolao();
  aplicarDisponibilidadeEstoque();
  atualizarCarrinhoUI();
});

// ===================== CONTROLE DE DISPONIBILIDADE (ADMIN) =====================
function aplicarDisponibilidadeEstoque() {
  const estoqueSalvo = localStorage.getItem('frutue_estoque_geral');
  if (!estoqueSalvo) return;

  const estoque = JSON.parse(estoqueSalvo);

  // 1. Desabilitar/Ocultar Frutas e Itens por Input Checkbox ou Radio
  document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    const val = input.value;
    const itemEstoque = estoque.find(e => e.nome === val || val.includes(e.nome));

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

  // 2. Desabilitar Botões de Produtos Diretos
  document.querySelectorAll('[data-produto-nome]').forEach(btn => {
    const nomeProd = btn.getAttribute('data-produto-nome');
    const itemEstoque = estoque.find(e => e.nome === nomeProd);
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
  const estoqueSalvo = localStorage.getItem('frutue_estoque_geral');
  if (estoqueSalvo) {
    const estoque = JSON.parse(estoqueSalvo);
    const item = estoque.find(e => e.nome === nome);
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

  // Atualizar dados do PIX Dinâmico
  gerarDadosPixDinamico(totalGeral);
}

let pedidoAtualId = null;

// ===================== GERADOR DE PAYLOAD PIX (EMV / BR Code) =====================
// Monta o "Pix Copia e Cola" de verdade, no padrão exigido pelo Banco Central.
// É ISSO que precisa ir dentro do QR Code — não a chave Pix "crua".
function montarPayloadPix(chave, nomeRecebedor, cidade, valor, txid) {
  const removerAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const campo = (id, valor) => {
    const tamanho = String(valor.length).padStart(2, '0');
    return `${id}${tamanho}${valor}`;
  };

  // Sub-campo 26: Merchant Account Information (dados do Pix)
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
    campo('00', '01') +               // Payload Format Indicator
    campo('01', '11') +               // Point of Initiation Method (11 = estático)
    merchantAccountInfo +
    merchantCategoryCode +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalDataField +
    '6304';                           // CRC16 - id + tamanho fixo (o valor é calculado abaixo)

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

function gerarPedido() {
  const nome = document.getElementById('nomeInput').value.trim();
  const telefone = document.getElementById('telefoneInput').value.trim();
  const tipoRecebimento = document.getElementById('tipoRecebimentoSelect').value;
  const ehEntrega = tipoRecebimento === 'Entrega';
  const endereco = document.getElementById('enderecoInput').value.trim();
  const localizacao = document.getElementById('localizacaoHidden').value;
  const pagamento = document.getElementById('pagamentoSelect').value;
  const obs = document.getElementById('observacaoInput').value.trim();

  if (!nome || (ehEntrega && !endereco) || carrinho.length === 0) {
    document.getElementById('erroDados').style.display = 'block';
    return;
  }
  document.getElementById('erroDados').style.display = 'none';

  let subtotal = 0;
  let itensTexto = '';
  carrinho.forEach(item => {
    const totalItem = item.precoUnitario * item.qtd;
    subtotal += totalItem;
    itensTexto += `• ${item.qtd}x ${item.nome} - R$ ${totalItem.toFixed(2).replace('.', ',')}\n`;
    if (item.detalhes) {
      itensTexto += `   ${item.detalhes.replace(/<br>/g, ' | ')}\n`;
    }
  });

  const taxaEntrega = ehEntrega ? CONFIG.taxaEntrega : 0;
  const totalGeral = subtotal + taxaEntrega;

  let resumo = `🛒 *Novo Pedido - Frutue*\n\n`;
  resumo += `👤 Nome: ${nome}\n`;
  if (telefone) resumo += `📞 Telefone: ${telefone}\n`;
  resumo += `🚚 Recebimento: ${tipoRecebimento}\n`;
  if (ehEntrega) {
    resumo += `📍 Endereço: ${endereco}\n`;
    if (localizacao) resumo += `🗺️ Localização GPS: ${localizacao}\n`;
  }
  resumo += `💳 Pagamento: ${pagamento}\n`;
  if (obs) resumo += `📝 Observações: ${obs}\n`;
  resumo += `\n🧾 Itens:\n${itensTexto}\n`;
  resumo += `Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
  if (ehEntrega) {
    resumo += `Taxa de entrega: R$ ${taxaEntrega.toFixed(2).replace('.', ',')}\n`;
  }
  resumo += `💰 *Total: R$ ${totalGeral.toFixed(2).replace('.', ',')}*`;

  // Tela final
  document.getElementById('resumoTexto').textContent = resumo;
  document.getElementById('formArea').style.display = 'none';
  document.querySelector('.total-bar').style.display = 'none';
  document.getElementById('resultado').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // WhatsApp
  const mensagemWhats = encodeURIComponent(resumo);
  const linkWhats = `https://wa.me/${CONFIG.whatsappNumero}?text=${mensagemWhats}`;
  document.getElementById('btnWhats').onclick = () => window.open(linkWhats, '_blank');

  // QR Code (Pix)
  const qrArea = document.getElementById('qrArea');
  qrArea.innerHTML = '';
  if (pagamento === 'Pix') {
    qrArea.style.display = 'flex';
    qrArea.style.flexDirection = 'column';
    qrArea.style.alignItems = 'center';
    qrArea.style.textAlign = 'center';

    // Monta o payload Pix (EMV/BR Code) com o valor do pedido já embutido
    const payloadPix = montarPayloadPix(
      CONFIG.pixChave,
      CONFIG.pixNomeRecebedor,
      CONFIG.pixCidade,
      totalGeral,
      pedidoAtualId ? String(pedidoAtualId) : 'FRUTUE'
    );

    const aviso = document.createElement('p');
    aviso.style.marginBottom = '8px';
    aviso.style.fontSize = '0.85rem';
    aviso.textContent = `Escaneie o QR Code no app do seu banco para pagar R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    qrArea.appendChild(aviso);

    const qrDiv = document.createElement('div');
    qrDiv.id = 'qrcodeCanvas';
    qrArea.appendChild(qrDiv);

    new QRCode(qrDiv, {
      text: payloadPix,
      width: 200,
      height: 200,
      correctLevel: QRCode.CorrectLevel.M
    });

    const btnCopiar = document.createElement('button');
    btnCopiar.type = 'button';
    btnCopiar.className = 'btn-secondary';
    btnCopiar.style.marginTop = '12px';
    btnCopiar.style.maxWidth = '260px';
    btnCopiar.textContent = '📋 Copiar Código Pix (Copia e Cola)';
    btnCopiar.onclick = () => copiarChavePix(btnCopiar, payloadPix);
    qrArea.appendChild(btnCopiar);
  }

  // Envio para o Google Apps Script (Google Sheets)
  enviarPedidoAPI({
    id_pedido: pedidoAtualId,
    cliente: nome,
    telefone: telefone,
    tipo_recebimento: tipoRecebimento,
    endereco: ehEntrega ? (localizacao ? `${endereco} (GPS: ${localizacao})` : endereco) : 'Retirada no Local',
    pagamento: pagamento,
    observacao: obs,
    subtotal: subtotal,
    taxa_entrega: taxaEntrega,
    total: totalGeral,
    itens: carrinho.map(item => ({
      produto: item.nome,
      quantidade: item.qtd,
      preco_unitario: item.precoUnitario,
      detalhes: item.detalhes ? item.detalhes.replace(/<br>/g, ' | ') : ''
    }))
  });
}

function copiarChavePix(botao, payload) {
  const textoParaCopiar = payload || CONFIG.pixChave;
  const textoOriginal = botao.textContent;

  const marcarSucesso = () => {
    botao.textContent = '✅ Código copiado!';
    setTimeout(() => { botao.textContent = textoOriginal; }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textoParaCopiar).then(marcarSucesso).catch(() => {
      copiarChavePixFallback(textoParaCopiar, marcarSucesso);
    });
  } else {
    copiarChavePixFallback(textoParaCopiar, marcarSucesso);
  }
}

function copiarChavePixFallback(texto, onSucesso) {
  const input = document.createElement('textarea');
  input.value = texto;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.focus();
  input.select();
  try {
    document.execCommand('copy');
    onSucesso();
  } catch (err) {
    console.error(err);
    alert('Não foi possível copiar automaticamente. Chave Pix: ' + texto);
  }
  document.body.removeChild(input);
}

function voltar() {
  document.getElementById('resultado').style.display = 'none';
  document.getElementById('formArea').style.display = '';
  document.querySelector('.total-bar').style.display = '';
  document.getElementById('envioStatus').textContent = '';
}

function enviarPedidoAPI(pedido) {
  const status = document.getElementById('envioStatus');
  if (!CONFIG.apiUrl) return;

  status.textContent = '⏳ Enviando pedido...';
  fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(pedido)
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.id_pedido) {
        pedidoAtualId = data.id_pedido;
      }
      status.textContent = '✅ Pedido registrado com sucesso!';
    })
    .catch(err => {
      console.error(err);
      status.textContent = '⚠️ Pedido gerado normalmente, mas não foi possível registrar no sistema. Envie pelo WhatsApp mesmo assim.';
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
  aplicarDisponibilidadeEstoque();
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
        <input type="checkbox" id="pesoFruta_${idx}" value="${fruta}" onchange="togglePesoInput(${idx}); calcularTotalSaladaPeso();">
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
  
  // Renderizar Adicionais Gratuitos
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
      <input type="checkbox" value="${adc}">
      <span>${adc}</span>
      <span class="price-tag" style="color:#2e7d32; font-weight:bold;">Grátis</span>
    </label>
  `).join('');
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
  const precoUnitario = parseFloat(precoCopo);

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

  document.querySelectorAll('#gourmetFrutasContainer input').forEach(c => c.checked = false);
  
  // Adiciona container de adicionais gratuitos nas saladas Gourmet
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

  // Feedback visual no botão/campo
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