/**
 * FRUTUE - Backend (Google Apps Script)
 * Etapa 1 + Etapa 2: estrutura das planilhas + recebimento de pedidos
 *
 * Como usar:
 * 1. Crie uma planilha nova no Google Sheets.
 * 2. Extensões > Apps Script, cole este arquivo.
 * 3. Rode a função setupSheets() uma vez (menu "Executar" > selecione setupSheets).
 *    Isso cria todas as abas com os cabeçalhos corretos.
 * 4. Publique como Web App (veja README.md).
 */

// ===================== CONFIGURAÇÃO =====================

const SHEET_NAMES = {
  PEDIDOS: 'PEDIDOS',
  ITENS_PEDIDO: 'ITENS_PEDIDO',
  CLIENTES: 'CLIENTES',
  PRODUTOS: 'PRODUTOS',
  MOVIMENTACOES_ESTOQUE: 'MOVIMENTACOES_ESTOQUE',
  FINANCEIRO: 'FINANCEIRO',
  CATEGORIAS_FINANCEIRAS: 'CATEGORIAS_FINANCEIRAS',
  CONTAS: 'CONTAS'
};

const HEADERS = {
  PEDIDOS: ['id', 'data_hora', 'cliente', 'endereco', 'telefone', 'forma_pagamento',
    'subtotal', 'desconto', 'taxa_entrega', 'total', 'status', 'observacao'],
  ITENS_PEDIDO: ['id', 'pedido_id', 'produto', 'detalhes', 'quantidade', 'preco_unitario', 'subtotal'],
  CLIENTES: ['id', 'nome', 'telefone', 'endereco', 'data_primeiro_pedido', 'ultimo_pedido',
    'quantidade_pedidos', 'valor_total_gasto'],
  PRODUTOS: ['id', 'nome', 'categoria', 'preco_venda', 'custo_unitario', 'estoque_atual',
    'estoque_minimo', 'ativo', 'controla_estoque'],
  MOVIMENTACOES_ESTOQUE: ['id', 'data_hora', 'produto', 'tipo', 'quantidade', 'motivo', 'pedido_id'],
  FINANCEIRO: ['id', 'data', 'tipo', 'categoria', 'descricao', 'valor', 'forma_pagamento',
    'pedido_id', 'status', 'observacao'],
  CATEGORIAS_FINANCEIRAS: ['id', 'nome', 'tipo', 'ativo'],
  CONTAS: ['id', 'descricao', 'tipo', 'valor', 'vencimento', 'pagamento', 'categoria', 'observacao']
};

const STATUS_PEDIDO = ['Pendente', 'Confirmado', 'Em preparação', 'Pronto',
  'Saiu para entrega', 'Concluído', 'Cancelado'];

// ===================== SETUP (rodar 1x manualmente) =====================

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (key) {
    const name = SHEET_NAMES[key];
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headerRow = sheet.getRange(1, 1, 1, HEADERS[key].length);
    if (sheet.getLastRow() === 0) {
      headerRow.setValues([HEADERS[key]]);
      headerRow.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });

  // Categorias financeiras padrão (o admin pode adicionar mais depois)
  seedCategoriasFinanceiras();

  // Remove a aba "Página1"/"Sheet1" padrão se estiver vazia
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1');
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Planilhas criadas/atualizadas com sucesso.');
}

function seedCategoriasFinanceiras() {
  const sheet = getSheet(SHEET_NAMES.CATEGORIAS_FINANCEIRAS);
  if (sheet.getLastRow() > 1) return; // já tem dados, não sobrescreve

  const entradas = ['Venda', 'Outra receita'];
  const saidas = ['Ingredientes', 'Embalagens', 'Energia', 'Água', 'Internet', 'Transporte',
    'Taxas', 'Marketing', 'Equipamentos', 'Manutenção', 'Outros'];

  const rows = [];
  entradas.forEach(function (nome) { rows.push([generateId(), nome, 'Entrada', true]); });
  saidas.forEach(function (nome) { rows.push([generateId(), nome, 'Saída', true]); });

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
}

// ===================== UTILIDADES =====================

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Aba não encontrada: ' + name + '. Rode setupSheets() primeiro.');
  return sheet;
}

function generateId() {
  return Utilities.getUuid();
}

function nowISO() {
  return new Date().toISOString();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheetToObjects(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
}

function findRowIndexById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1; // linha real na planilha (1-based)
  }
  return -1;
}

// ===================== ROTEAMENTO HTTP =====================

function doGet(e) {
  const action = e.parameter.action || 'ping';
  try {
    if (action === 'ping') {
      return jsonResponse({ ok: true, message: 'Frutue API online' });
    }
    return jsonResponse({ ok: false, error: 'Ação GET desconhecida: ' + action });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'JSON inválido no corpo da requisição.' });
  }

  const action = body.action;
  try {
    switch (action) {
      case 'criarPedido':
        return jsonResponse(criarPedido(body.pedido));
      default:
        return jsonResponse({ ok: false, error: 'Ação POST desconhecida: ' + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ===================== CRIAÇÃO DE PEDIDO (Etapa 2) =====================

/**
 * pedido esperado:
 * {
 *   cliente, endereco, telefone, forma_pagamento, observacao,
 *   subtotal, desconto, taxa_entrega, total,
 *   itens: [{ produto, detalhes, quantidade, preco_unitario, subtotal }]
 * }
 */
function criarPedido(pedido) {
  if (!pedido || !pedido.cliente || !pedido.endereco || !pedido.itens || !pedido.itens.length) {
    return { ok: false, error: 'Dados do pedido incompletos (cliente, endereço e itens são obrigatórios).' };
  }

  const pedidoId = generateId();
  const dataHora = nowISO();

  // 1) Gravar PEDIDOS
  const pedidosSheet = getSheet(SHEET_NAMES.PEDIDOS);
  pedidosSheet.appendRow([
    pedidoId,
    dataHora,
    pedido.cliente,
    pedido.endereco,
    pedido.telefone || '',
    pedido.forma_pagamento || '',
    Number(pedido.subtotal || 0),
    Number(pedido.desconto || 0),
    Number(pedido.taxa_entrega || 0),
    Number(pedido.total || 0),
    'Pendente',
    pedido.observacao || ''
  ]);

  // 2) Gravar ITENS_PEDIDO + baixa de estoque
  const itensSheet = getSheet(SHEET_NAMES.ITENS_PEDIDO);
  pedido.itens.forEach(function (item) {
    itensSheet.appendRow([
      generateId(),
      pedidoId,
      item.produto,
      item.detalhes || '',
      Number(item.quantidade || 1),
      Number(item.preco_unitario || 0),
      Number(item.subtotal || (item.preco_unitario * item.quantidade))
    ]);
    darBaixaEstoqueSeControlado(item.produto, Number(item.quantidade || 1), pedidoId);
  });

  // 3) Atualizar/criar CLIENTES
  atualizarCliente(pedido.cliente, pedido.telefone || '', pedido.endereco, dataHora, Number(pedido.total || 0));

  // 4) Lançar receita em FINANCEIRO
  const financeiroSheet = getSheet(SHEET_NAMES.FINANCEIRO);
  financeiroSheet.appendRow([
    generateId(),
    dataHora,
    'Entrada',
    'Venda',
    'Pedido ' + pedidoId.substring(0, 8),
    Number(pedido.total || 0),
    pedido.forma_pagamento || '',
    pedidoId,
    'Confirmado',
    ''
  ]);

  return { ok: true, pedido_id: pedidoId };
}

function darBaixaEstoqueSeControlado(nomeProduto, quantidade, pedidoId) {
  const produtosSheet = getSheet(SHEET_NAMES.PRODUTOS);
  const data = produtosSheet.getDataRange().getValues();
  const headers = data[0];
  const idxNome = headers.indexOf('nome');
  const idxEstoque = headers.indexOf('estoque_atual');
  const idxControla = headers.indexOf('controla_estoque');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idxNome]).trim().toLowerCase() === String(nomeProduto).trim().toLowerCase()) {
      const controla = data[i][idxControla];
      if (controla === true || controla === 'TRUE' || controla === 'VERDADEIRO') {
        const estoqueAtual = Number(data[i][idxEstoque] || 0);
        const novoEstoque = estoqueAtual - quantidade;
        produtosSheet.getRange(i + 1, idxEstoque + 1).setValue(novoEstoque);

        const movSheet = getSheet(SHEET_NAMES.MOVIMENTACOES_ESTOQUE);
        movSheet.appendRow([generateId(), nowISO(), nomeProduto, 'Saída', quantidade, 'Venda', pedidoId]);
      }
      return;
    }
  }
  // Produto não cadastrado em PRODUTOS (ex: item avulso) -> não controla estoque, ignora silenciosamente
}

function atualizarCliente(nome, telefone, endereco, dataHora, valorPedido) {
  const sheet = getSheet(SHEET_NAMES.CLIENTES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idxNome = headers.indexOf('nome');
  const idxTelefone = headers.indexOf('telefone');
  const idxEndereco = headers.indexOf('endereco');
  const idxUltimoPedido = headers.indexOf('ultimo_pedido');
  const idxQtdPedidos = headers.indexOf('quantidade_pedidos');
  const idxValorTotal = headers.indexOf('valor_total_gasto');

  // Considera o mesmo cliente por nome + telefone (quando telefone disponível)
  for (let i = 1; i < data.length; i++) {
    const mesmoNome = String(data[i][idxNome]).trim().toLowerCase() === String(nome).trim().toLowerCase();
    const mesmoTelefone = telefone ? String(data[i][idxTelefone]) === String(telefone) : true;
    if (mesmoNome && mesmoTelefone) {
      const row = i + 1;
      sheet.getRange(row, idxEndereco + 1).setValue(endereco);
      sheet.getRange(row, idxUltimoPedido + 1).setValue(dataHora);
      sheet.getRange(row, idxQtdPedidos + 1).setValue(Number(data[i][idxQtdPedidos] || 0) + 1);
      sheet.getRange(row, idxValorTotal + 1).setValue(Number(data[i][idxValorTotal] || 0) + valorPedido);
      return;
    }
  }

  // Cliente novo
  sheet.appendRow([generateId(), nome, telefone, endereco, dataHora, dataHora, 1, valorPedido]);
}
