// ===================== MONTAGEM DO RESUMO =====================

function montarDadosPedido() {
  const nome = document.getElementById('nomeInput').value.trim();
  const endereco = document.getElementById('enderecoInput').value.trim();
  const telefone = document.getElementById('telefoneInput') ? document.getElementById('telefoneInput').value.trim() : '';
  const pagamento = document.getElementById('pagamentoSelect').value;
  const observacao = document.getElementById('observacaoInput').value.trim();

  if (carrinho.length === 0 || !nome || !endereco) {
    document.getElementById('erroDados').style.display = 'block';
    return null;
  }
  document.getElementById('erroDados').style.display = 'none';

  let total = 0;
  const itens = carrinho.map(item => {
    const subtotalItem = item.precoUnitario * item.qtd;
    total += subtotalItem;
    return {
      produto: item.nome,
      detalhes: item.detalhes || '',
      quantidade: item.qtd,
      preco_unitario: item.precoUnitario,
      subtotal: subtotalItem
    };
  });

  return { nome, endereco, telefone, pagamento, observacao, itens, total };
}

function montarTextoWhatsapp(dados) {
  let texto = `*NOVO PEDIDO - FRUTUE*\n\n`;
  texto += `Cliente: ${dados.nome}\n`;
  texto += `Endereço: ${dados.endereco}\n`;
  texto += `Pagamento: ${dados.pagamento}\n\n`;
  texto += `*ITENS DO PEDIDO:*\n`;

  dados.itens.forEach((item, idx) => {
    texto += `\n${idx + 1}. *${item.quantidade}x ${item.produto}* - R$ ${item.subtotal.toFixed(2).replace('.', ',')}\n`;
    if (item.detalhes) {
      const detFormatado = item.detalhes.replace(/<br>/g, '\n   ');
      texto += `   ${detFormatado}\n`;
    }
  });

  if (dados.observacao) texto += `\n📝 Observações: ${dados.observacao}\n`;
  texto += `\n*TOTAL: R$ ${dados.total.toFixed(2).replace('.', ',')}*`;
  return texto;
}

// ===================== ENVIO PARA O BACKEND (Google Apps Script) =====================

async function enviarPedidoParaAPI(dados) {
  if (!CONFIG.apiUrl || CONFIG.apiUrl.indexOf('http') !== 0) {
    console.warn('apiUrl não configurada em app.js - pedido não foi registrado na planilha.');
    return { ok: false, error: 'apiUrl não configurada' };
  }

  const payload = {
    action: 'criarPedido',
    pedido: {
      cliente: dados.nome,
      endereco: dados.endereco,
      telefone: dados.telefone,
      forma_pagamento: dados.pagamento,
      observacao: dados.observacao,
      subtotal: dados.total,
      desconto: 0,
      taxa_entrega: 0,
      total: dados.total,
      itens: dados.itens
    }
  };

  try {
    // Content-Type text/plain evita o preflight CORS (Apps Script não responde bem a OPTIONS)
    const resposta = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await resposta.json();
  } catch (err) {
    console.error('Erro ao enviar pedido para a API:', err);
    return { ok: false, error: err.message };
  }
}

// ===================== FINALIZAR PEDIDO (fluxo principal) =====================

async function gerarPedido() {
  const dados = montarDadosPedido();
  if (!dados) return;

  const btn = document.querySelector('.btn-checkout');
  const statusEl = document.getElementById('envioStatus');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
  if (statusEl) statusEl.textContent = 'Registrando pedido...';

  // 1) Tenta registrar na planilha (não bloqueia o WhatsApp/Pix se falhar)
  const respostaApi = await enviarPedidoParaAPI(dados);

  if (statusEl) {
    statusEl.textContent = respostaApi.ok
      ? '✅ Pedido registrado no sistema.'
      : '⚠️ Não foi possível registrar automaticamente, mas você ainda pode enviar pelo WhatsApp.';
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Finalizar Pedido'; }

  const textoWhats = montarTextoWhatsapp(dados);

  // 2) Continua o fluxo normal (tela de resumo, WhatsApp, Pix)
  document.getElementById('formArea').style.display = 'none';
  document.querySelector('.total-bar').style.display = 'none';
  document.getElementById('resultado').style.display = 'block';
  document.getElementById('resumoTexto').textContent = textoWhats;

  document.getElementById('btnWhats').onclick = () => {
    const url = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(textoWhats)}`;
    window.open(url, '_blank');
  };

  const qrArea = document.getElementById('qrArea');
  qrArea.innerHTML = '';
  if (dados.pagamento === 'Pix') {
    const payload = gerarPayloadPix(CONFIG.pixChave, CONFIG.pixNomeRecebedor, CONFIG.pixCidade, dados.total);
    qrArea.innerHTML = `<h2 style="margin:0 0 4px;font-size:1rem;color:var(--green-dark);">Pague com Pix</h2>
      <div id="qrcode"></div>
      <p style="font-size:0.8rem; color:#666">Escaneie o QR Code no app do seu banco</p>
      <div class="pix-code">${payload}</div>
      <p style="font-size:0.8rem; color:#666">Ou copie o código acima (Pix Copia e Cola)</p>`;
    new QRCode(document.getElementById('qrcode'), { text: payload, width: 200, height: 200 });
  } else {
    qrArea.innerHTML = `<p style="font-size:.9rem;">Pagamento via <b>${dados.pagamento}</b> na entrega do pedido.</p>`;
  }
}

function voltar() {
  document.getElementById('formArea').style.display = 'block';
  document.querySelector('.total-bar').style.display = 'flex';
  document.getElementById('resultado').style.display = 'none';
}

// ===================== PAYLOAD PIX (inalterado) =====================

function crc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function emv(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}
function gerarPayloadPix(chave, nome, cidade, valor) {
  nome = nome.substring(0, 25);
  cidade = cidade.substring(0, 15);
  const merchantAccount = emv('00', 'br.gov.bcb.pix') + emv('01', chave);
  let payload =
    emv('00', '01') +
    emv('26', merchantAccount) +
    emv('52', '0000') +
    emv('53', '986') +
    emv('54', valor.toFixed(2)) +
    emv('58', 'BR') +
    emv('59', nome) +
    emv('60', cidade) +
    emv('62', emv('05', 'PEDIDO'));
  payload += '6304';
  payload += crc16(payload);
  return payload;
}
