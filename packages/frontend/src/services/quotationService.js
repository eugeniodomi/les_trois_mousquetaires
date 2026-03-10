// frontend/src/services/quotationService.js

// Define a URL base da sua API a partir das variáveis de ambiente.
// Garanta que o seu ficheiro .env no frontend tem a linha: VITE_API_URL=http://localhost:5000/api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Busca a lista completa de todas as cotações.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de cotações.
 */
export const getCotacoes = async () => {
  try {
    // Faz a chamada para o endpoint que lista todas as cotações.
    const response = await fetch(`${API_URL}/cotacoes`);
    if (!response.ok) {
      throw new Error('Não foi possível buscar a lista de cotações.');
    }
    return await response.json();
  } catch (error) {
    console.error('Falha ao buscar cotações:', error);
    // Lança o erro novamente para que o componente que chamou a função possa tratá-lo.
    throw error;
  }
};

/**
 * Busca os detalhes de uma única cotação pelo seu ID.
 * @param {string|number} id - O ID da cotação a ser buscada.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto da cotação.
 */
export const getQuotationById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cotacoes/${id}`);
    if (!response.ok) {
      throw new Error('Não foi possível buscar os detalhes da cotação.');
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar cotação ${id}:`, error);
    throw error;
  }
};

/**
 * Cria uma nova cotação completa (mestre + itens) no backend.
 * @param {object} quotationData - O objeto contendo a descrição, usuario_criador_id e o array itens_cotacao.
 * @returns {Promise<object>} Uma promessa que resolve para a resposta da API.
 */
export const createQuotation = async (quotationData) => {
  try {
    const response = await fetch(`${API_URL}/cotacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Se você usar autenticação por token, adicione o cabeçalho de autorização aqui.
        // 'Authorization': `Bearer ${seu_token_aqui}`
      },
      body: JSON.stringify(quotationData),
    });

    if (!response.ok) {
      // Tenta extrair uma mensagem de erro mais detalhada do backend.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Não foi possível criar a cotação.');
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao criar cotação:", error);
    throw error;
  }
};

/**
 * Atualiza os dados de uma cotação existente.
 * @param {string|number} id - O ID da cotação a ser atualizada.
 * @param {object} quotationData - O objeto com os dados a serem atualizados.
 * @returns {Promise<object>} Uma promessa que resolve para a resposta da API.
 */
export const updateQuotation = async (id, quotationData) => {
  try {
    const response = await fetch(`${API_URL}/cotacoes/${id}`, { // A URL correta é /api/cotacoes/:id
      method: 'PUT', // O método HTTP para atualização é PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Não foi possível atualizar a cotação.');
    }

    return await response.json();
  } catch (error) {
    console.error(`Falha ao atualizar cotação ${id}:`, error);
    throw error;
  }
};