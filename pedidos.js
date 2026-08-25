// pedidos.js — depende das variáveis/funções globais definidas em app.js
// (CONFIG, carrinho, atualizarCarrinhoUI, etc.)

// Guarda o ID do pedido já registrado, para que reenvios (após "Editar pedido")
// atualizem a mesma linha na planilha em vez de criar uma nova.
let pedidoAtualId = null;

function gerarPedido() {
  const nome = document.getElementById('nomeInput').value.trim();
  const telefone = document.getElementById('telefoneInput').value.trim();
  const endereco = document.getElementById('enderecoInput').value.trim();
  const localizacao = document.getElementById('localizacaoHidden').value;
  const pagamento = document.getElementById('pagamentoSelect').value;
  const obs = document.getElementById('observacaoInput').value.trim();

  if (!nome || !endereco || carrinho.length === 0) {
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

  let resumo = `🛒 *Novo Pedido - Frutue*\n\n`;
  resumo += `👤 Nome: ${nome}\n`;
  if (telefone) resumo += `📞 Telefone: ${telefone}\n`;
  resumo += `📍 Endereço: ${endereco}\n`;
  if (localizacao) resumo += `🗺️ Localização GPS: ${localizacao}\n`;
  resumo += `💳 Pagamento: ${pagamento}\n`;
  if (obs) resumo += `📝 Observações: ${obs}\n`;
  resumo += `\n🧾 Itens:\n${itensTexto}`;
  resumo += `\n💰 *Total: R$ ${subtotal.toFixed(2).replace('.', ',')}*`;

  // Mostra a tela final e esconde o formulário
  document.getElementById('resumoTexto').textContent = resumo;
  document.getElementById('formArea').style.display = 'none';
  document.querySelector('.total-bar').style.display = 'none';
  document.getElementById('resultado').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Botão do WhatsApp
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

  // Envia para a planilha (Google Apps Script)
  // Se já existe um pedidoAtualId (ex.: usuário clicou em "Editar pedido" e
  // está finalizando de novo), ele é reenviado para ATUALIZAR a mesma linha.
  enviarPedidoAPI({
    id_pedido: pedidoAtualId,
    cliente: nome,
    telefone: telefone,
    endereco: localizacao ? `${endereco} (GPS: ${localizacao})` : endereco,
    pagamento: pagamento,
    observacao: obs,
    total: subtotal,
    itens: carrinho.map(item => ({
      produto: item.nome,
      quantidade: item.qtd,
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