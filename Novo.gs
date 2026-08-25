/**
 * FRUTUE - Backend Simplificado
 * Aba única: PEDIDOS (Com soma automática e formatação R$ via código)
 */

const SHEET_NAME = 'PEDIDOS';

// Cabeçalhos que ficarão na LINHA 3 (Linhas 1 e 2 reservadas para os Totais)
const HEADERS = [
  'ID do Pedido',        // Coluna A
  'Data / Hora',         // Coluna B
  'Cliente',             // Coluna C
  'Endereço',            // Coluna D
  'Itens do Pedido',     // Coluna E
  'Forma de Pagamento',  // Coluna F
  'Troco / Observações', // Coluna G
  'Status',              // Coluna H
  'Valor Total'          // Coluna I
];

// ===================== SETUP (Rodar 1x manualmente) =====================

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clear(); // Limpa a planilha para garantir a nova estrutura

  // Configura o Painel de Totais no topo (Linhas 1 e 2)
  sheet.getRange('A1').setValue('TOTAL DE PEDIDOS:').setFontWeight('bold');
  sheet.getRange('B1').setValue(0).setFontWeight('bold');

  sheet.getRange('D1').setValue('FATURAMENTO TOTAL:').setFontWeight('bold');
  sheet.getRange('E1').setValue(formatarReais(0)).setFontWeight('bold');

  // Estiliza o painel do topo
  sheet.getRange('A1:I2').setBackground('#F3F3F3');

  // Insere os cabeçalhos das colunas na Linha 3
  const headerRow = sheet.getRange(3, 1, 1, HEADERS.length);
  headerRow.setValues([HEADERS]);
  headerRow.setFontWeight('bold').setBackground('#E0E0E0');
  sheet.setFrozenRows(3);

  // Formata a coluna de Data/Hora (B)
  sheet.getRange(4, 2, 2000, 1).setNumberFormat('dd/mm/yyyy hh:mm:ss');

  // Remove abas padrão
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Planilha PEDIDOS configurada com sucesso!');
}

// ===================== ROTEAMENTO HTTP =====================

function doGet(e) {
  return jsonResponse({ ok: true, message: 'API Frutue rodando!' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'JSON inválido no corpo da requisição.' });
  }

  try {
    return jsonResponse(criarPedido(body));
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ===================== CRIAÇÃO DE PEDIDO =====================

function criarPedido(dados) {
  if (!dados || !dados.cliente) {
    return { ok: false, error: 'Dados incompletos do cliente.' };
  }

  const sheet = getSheet();
  const ultimaLinha = sheet.getLastRow();
  
  // Número sequencial do pedido (começa em 1 a partir da linha 4)
  const numeroPedido = ultimaLinha < 3 ? 1 : (ultimaLinha - 2);

  const valorTotalNum = Number(dados.total || dados.valor_total || 0);

  // Formata os itens se vierem em lista/array
  let itensFormatados = dados.itens || '';
  if (Array.isArray(dados.itens)) {
    itensFormatados = dados.itens.map(item => {
      if (typeof item === 'string') return item;
      return `${item.quantidade || 1}x ${item.produto || item.nome} ${item.detalhes ? '(' + item.detalhes + ')' : ''}`;
    }).join(', ');
  }

  // Insere a nova linha com o valor já formatado em R$ 00,00
  sheet.appendRow([
    numeroPedido,                                   // A: ID
    new Date(),                                     // B: Data/Hora
    dados.cliente || '',                            // C: Cliente
    dados.endereco || '',                           // D: Endereço
    itensFormatados,                                // E: Itens
    dados.forma_pagamento || dados.pagamento || '',    // F: Pagamento
    dados.observacao || dados.troco || '',          // G: Troco/Obs
    'Pendente',                                     // H: Status
    formatarReais(valorTotalNum)                    // I: Valor em R$ 00,00
  ]);

  // Recalcula e atualiza os totais via código no topo da folha
  atualizarTotaisViaCodigo(sheet);

  return { 
    ok: true, 
    id_pedido: numeroPedido,
    valor_registrado: formatarReais(valorTotalNum)
  };
}

// ===================== CÁLCULO E ATUALIZAÇÃO VIA CÓDIGO =====================

function atualizarTotaisViaCodigo(sheet) {
  const ultimaLinha = sheet.getLastRow();
  
  // Se não houver pedidos abaixo do cabeçalho
  if (ultimaLinha <= 3) {
    sheet.getRange('B1').setValue(0);
    sheet.getRange('E1').setValue(formatarReais(0));
    return;
  }

  // Pega todas as linhas de pedidos registradas (da linha 4 até a última)
  const valoresColunaTotal = sheet.getRange(4, 9, ultimaLinha - 3, 1).getValues();
  
  let somaTotal = 0;
  let qtdPedidos = 0;

  valoresColunaTotal.forEach(linha => {
    const valorTexto = String(linha[0]);
    if (valorTexto) {
      // Extrai apenas os números da string (Ex: "R$ 15,50" -> 15.50)
      const valorLimpo = valorTexto
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace('.', '')
        .replace(',', '.');
      
      const num = parseFloat(valorLimpo);
      if (!isNaN(num)) {
        somaTotal += num;
        qtdPedidos++;
      }
    }
  });

  // Escreve os resultados direto nas células B1 e E1 via código
  sheet.getRange('B1').setValue(qtdPedidos);
  sheet.getRange('E1').setValue(formatarReais(somaTotal));
}

// Formata números no padrão R$ 00,00 (ex: 7 -> "R$ 7,00")
function formatarReais(valor) {
  const numero = Number(valor) || 0;
  return 'R$ ' + numero.toFixed(2).replace('.', ',');
}

// ===================== UTILIDADES =====================

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Aba PEDIDOS não encontrada. Rode setupSheets() primeiro.');
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
