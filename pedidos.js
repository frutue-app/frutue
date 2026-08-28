window.pedidoAtualId = window.pedidoAtualId || null;

function gerarPedido() {
  const nome = document.getElementById('nomeInput').value.trim();
  const telefone = document.getElementById('telefoneInput').value.trim();
  const tipoRecebimento = document.getElementById('tipoRecebimentoSelect').value;
  const ehEntrega = tipoRecebimento === 'Entrega';
  const endereco = document.getElementById('enderecoInput').value.trim();
  const localizacao = document.getElementById('localizacaoHidden') ? document.getElementById('localizacaoHidden').value : '';
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
  if (document.querySelector('.total-bar')) {
    document.querySelector('.total-bar').style.display = 'none';
  }
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

    const payloadPix = montarPayloadPix(
      CONFIG.pixChave,
      CONFIG.pixNomeRecebedor,
      CONFIG.pixCidade,
      totalGeral,
      'FRUTUE'
    );

    const aviso = document.createElement('p');
    aviso.style.marginBottom = '8px';
    aviso.style.fontSize = '0.85rem';
    aviso.textContent = `Escaneie o QR Code abaixo para pagar R$ ${totalGeral.toFixed(2).replace('.', ',')}:`;
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
    id_pedido: window.pedidoAtualId,
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
  if (document.querySelector('.total-bar')) {
    document.querySelector('.total-bar').style.display = '';
  }
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
        window.pedidoAtualId = data.id_pedido;
      }
      status.textContent = '✅ Pedido registrado com sucesso!';
    })
    .catch(err => {
      console.error(err);
      status.textContent = '⚠️ Pedido gerado normalmente, mas não foi possível registrar no sistema. Envie pelo WhatsApp mesmo assim.';
    });
}