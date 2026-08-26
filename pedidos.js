let pedidoAtualId = null;

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

    const aviso = document.createElement('p');
    aviso.style.marginBottom = '8px';
    aviso.style.fontSize = '0.85rem';
    aviso.textContent = `Chave Pix (copia e cola): ${CONFIG.pixChave} — ${CONFIG.pixNomeRecebedor}`;
    qrArea.appendChild(aviso);

    const qrDiv = document.createElement('div');
    qrDiv.id = 'qrcodeCanvas';
    qrArea.appendChild(qrDiv);

    new QRCode(qrDiv, {
      text: CONFIG.pixChave,
      width: 180,
      height: 180
    });

    const btnCopiar = document.createElement('button');
    btnCopiar.type = 'button';
    btnCopiar.className = 'btn-secondary';
    btnCopiar.style.marginTop = '12px';
    btnCopiar.style.maxWidth = '220px';
    btnCopiar.textContent = '📋 Copiar Chave Pix';
    btnCopiar.onclick = () => copiarChavePix(btnCopiar);
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

function copiarChavePix(botao) {
  const chave = CONFIG.pixChave;
  const textoOriginal = botao.textContent;

  const marcarSucesso = () => {
    botao.textContent = '✅ Chave copiada!';
    setTimeout(() => { botao.textContent = textoOriginal; }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(chave).then(marcarSucesso).catch(() => {
      copiarChavePixFallback(chave, marcarSucesso);
    });
  } else {
    copiarChavePixFallback(chave, marcarSucesso);
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