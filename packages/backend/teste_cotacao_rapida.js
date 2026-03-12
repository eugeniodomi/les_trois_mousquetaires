// teste_cotacao_rapida.js
// Simula o payload exato do front-end no Modo Cotação Rápida:
//   - valor_venda_final e dolar_cotacao chegam como 0 (falsy mas válido)
//   - data_retorno chega como null
// Objetivo: confirmar que o controller aceita esses valores sem converter 0 em null.

const API_URL = 'http://localhost:5000/api/cotacoes';

const payload = {
  descricao: 'Teste Automatizado - Cotação Rápida',
  usuario_criador_id: 1,
  status: 'Aberta',
  itens_cotacao: [
    {
      produto_id: 6,          // ID real no banco (ajustado após consulta)
      distribuidor_id: 3,     // ID real no banco (ajustado após consulta)
      quantidade: 5,
      valor_unitario: 100.00,
      valor_cout: 110.00,
      valor_osc: 105.00,
      valor_venda_final: 0,   // Modo Rápido → deve chegar como 0, não null
      dolar_cotacao: 0,       // Modo Rápido → deve chegar como 0, não null
      data_cotacao: '2026-03-12',
      data_retorno: null,     // Modo Rápido → null aceito pelo PostgreSQL
    },
  ],
};

async function testarCriacaoCotacao() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  TESTE: POST /api/cotacoes (Modo Cotação Rápida)');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📦 Payload enviado:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n⏳ Aguardando resposta do servidor...\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log(`📡 Status HTTP: ${response.status} ${response.statusText}`);
    console.log('\n📨 Resposta do servidor:');
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 201) {
      console.log('\n✅ SUCESSO! Cotação criada com ID:', data.cotacao_id);
      console.log('   → Valores 0 e null foram aceitos pelo PostgreSQL corretamente.');
    } else {
      console.error('\n❌ FALHA! Status inesperado:', response.status);
      console.error('   → Verifique o log do servidor Node.js para detalhes do erro.');
    }

  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error('\n🔴 ERRO DE CONEXÃO: O servidor não está rodando em', API_URL);
      console.error('   → Inicie o backend com: npm run dev  (na pasta packages/backend)');
    } else {
      console.error('\n🔴 ERRO INESPERADO:', err.message);
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

testarCriacaoCotacao();
