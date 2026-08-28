/**
 * FRUTUE - Backend Simplificado
 * Aba única: PEDIDOS (Com soma automática, formatação R$ e Divisória Mensal)
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
  // Impede que requisições simultâneas façam o script travar ou criar linhas sobrepostas
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'JSON inválido no corpo da requisição.' });
    }

    const dadosPedido = body.pedido ? body.pedido : body;
    return jsonResponse(criarPedido(dadosPedido));
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

// ===================== CRIAÇÃO / ATUALIZAÇÃO DE PEDIDO =====================

function criarPedido(dados) {
  if (!dados || (!dados.cliente && !dados.clienteNome)) {
    return { ok: false, error: 'Dados incompletos do cliente.' };
  }

  const sheet = getSheet();
  const valorTotalNum = Number(dados.total || dados.valor_total || dados.valorTotal || 0);

  // Normaliza o nome do cliente e forma de pagamento
  const clienteNome = dados.cliente || dados.clienteNome || '';
  const formaPagamento = dados.forma_pagamento || dados.pagamento || dados.formaPagamento || '';
  const observacao = dados.observacao || dados.troco || '';
  const endereco = dados.endereco || '';

  // Formata os itens se vierem em lista/array
  let itensFormatados = dados.itens || '';
  if (Array.isArray(dados.itens)) {
    itensFormatados = dados.itens.map(item => {
      if (typeof item === 'string') return item;
      return `${item.quantidade || item.qtd || 1}x ${item.produto || item.nome} ${item.detalhes ? '(' + item.detalhes + ')' : ''}`;
    }).join(', ');
  }

  const idPedido = dados.id_pedido || dados.idPedido;

  // Se veio um id e ele já existe na planilha, ATUALIZA a linha existente
  if (idPedido) {
    const linhaExistente = encontrarLinhaPeloId(sheet, idPedido);
    if (linhaExistente) {
      sheet.getRange(linhaExistente, 1, 1, HEADERS.length).setValues([[
        idPedido,
        new Date(),
        clienteNome,
        endereco,
        itensFormatados,
        formaPagamento,
        observacao,
        'Pendente',
        formatarReais(valorTotalNum)
      ]]);

      atualizarTotaisViaCodigo(sheet);

      return {
        ok: true,
        id_pedido: idPedido,
        valor_registrado: formatarReais(valorTotalNum),
        atualizado: true
      };
    }
  }

  // Verificar e Criar Divisória do Mês se mudou o mês
  garantirDivisoriaDoMes(sheet);

  // Gera o ID Sequencial do pedido
  const novoId = idPedido || (Date.now());

  // Insere a nova linha
  sheet.appendRow([
    novoId,                         // A: ID
    new Date(),                     // B: Data/Hora
    clienteNome,                    // C: Cliente
    endereco,                       // D: Endereço
    itensFormatados,                // E: Itens
    formaPagamento,                 // F: Pagamento
    observacao,                     // G: Troco/Obs
    'Pendente',                     // H: Status
    formatarReais(valorTotalNum)    // I: Valor em R$ 00,00
  ]);

  // Recalcula e atualiza os totais via código no topo da folha
  atualizarTotaisViaCodigo(sheet);

  return {
    ok: true,
    id_pedido: novoId,
    valor_registrado: formatarReais(valorTotalNum)
  };
}

// ===================== DIVISÓRIA MENSAL AUTOMÁTICA =====================

function garantirDivisoriaDoMes(sheet) {
  const dataAtual = new Date();
  const mesAnoFormatado = Utilities.formatDate(dataAtual, "GMT-03:00", "MM/yyyy");
  const mesNome = getNomeMes(dataAtual.getMonth());
  const tituloDivisoria = mesNome.toUpperCase() + " — " + mesAnoFormatado;

  const ultimaLinha = sheet.getLastRow();

  if (ultimaLinha > 3) {
    const finder = sheet.createTextFinder(tituloDivisoria).findAll();
    if (finder.length > 0) {
      return; // A divisória deste mês já existe na planilha
    }
  }

  // Cria uma linha em branco para espaçamento + linha com título estilizado
  sheet.appendRow([""]); 
  sheet.appendRow([tituloDivisoria]);

  const novaLinhaDivisoria = sheet.getLastRow();
  const range = sheet.getRange(novaLinhaDivisoria, 1, 1, HEADERS.length);
  
  range.setFontWeight("bold");
  range.setBackground("#2E7D32"); // Verde Frutue
  range.setFontColor("#FFFFFF");
  range.merge();
}

function getNomeMes(mesIndex) {
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return meses[mesIndex];
}

// ===================== UTILITÁRIOS E BUSCA =====================

function encontrarLinhaPeloId(sheet, id) {
  const ultimaLinha = sheet.getLastRow();
  if (ultimaLinha <= 3) return null;

  const idsColuna = sheet.getRange(4, 1, ultimaLinha - 3, 1).getValues();
  for (let i = 0; i < idsColuna.length; i++) {
    if (String(idsColuna[i][0]) === String(id)) {
      return i + 4;
    }
  }
  return null;
}

function atualizarTotaisViaCodigo(sheet) {
  const ultimaLinha = sheet.getLastRow();

  if (ultimaLinha <= 3) {
    sheet.getRange('B1').setValue(0);
    sheet.getRange('E1').setValue(formatarReais(0));
    return;
  }

  const valoresColunaTotal = sheet.getRange(4, 9, ultimaLinha - 3, 1).getValues();

  let somaTotal = 0;
  let qtdPedidos = 0;

  valoresColunaTotal.forEach(linha => {
    const valorTexto = String(linha[0]);
    if (valorTexto && !valorTexto.includes('—')) { // Ignora as linhas de divisória do mês
      const valorLimpo = valorTexto
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace('.', '')
        .replace(',', '.');

      const num = parseFloat(valorLimpo);
      if (!isNaN(num) && num > 0) {
        somaTotal += num;
        qtdPedidos++;
      }
    }
  });

  sheet.getRange('B1').setValue(qtdPedidos);
  sheet.getRange('E1').setValue(formatarReais(somaTotal));
}

function formatarReais(valor) {
  const numero = Number(valor) || 0;
  return 'R$ ' + numero.toFixed(2).replace('.', ',');
}

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