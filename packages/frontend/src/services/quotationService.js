// frontend/src/services/quotationService.js

const API_QUOTATIONS_URL = 'http://localhost:5000/api/cotacoes';

// ==========================================================
// ## NOVA FUNÇÃO ADICIONADA ##
// ==========================================================

/**
 * Busca a lista de todas as cotações.
 * Corresponde à função 'findAll' no seu backend controller.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de cotações.
 */
export const getCotacoes = async () => {
  try {
    const response = await fetch(API_QUOTATIONS_URL);

    if (!response.ok) {
      throw new Error('Não foi possível buscar a lista de cotações.');
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao buscar cotações:", error);
    throw error;
  }
};


// ==========================================================
// ## Função que já existia para a página de detalhes ##
// ==========================================================

/**
 * Busca os detalhes de uma cotação específica pelo seu ID.
 * @param {string|number} id - O ID da cotação a ser buscada.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto da cotação.
 */
export const getQuotationById = async (id) => {
  try {
    const response = await fetch(`${API_QUOTATIONS_URL}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Cotação não encontrada.');
      }
      throw new Error('Não foi possível buscar os detalhes da cotação.');
    }

    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar cotação ${id}:`, error);
    throw error;
  }
};