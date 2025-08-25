// src/services/quotationService.js

// A URL base da sua API de cotações.
// Certifique-se de que a porta (5000) está correta.
const API_QUOTATIONS_URL = 'http://localhost:5000/api/cotacoes';

/**
 * Busca no backend todos os itens de cotações.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de itens de cotação.
 */
export const getCotacoes = async () => {
  try {
    // Faz a chamada GET para o endpoint definido no seu controller (exports.findAll)
    const response = await fetch(API_QUOTATIONS_URL);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Não foi possível buscar as cotações.`);
    }

    // Retorna os dados em formato JSON
    return await response.json();

  } catch (error) {
    console.error("Falha ao buscar cotações da API:", error);
    // Propaga o erro para que o componente que chamou a função possa tratá-lo
    throw error;
  }
};

// No futuro, você pode adicionar outras funções aqui, como:
// export const getCotacaoById = async (id) => { ... };
// export const createCotacao = async (data) => { ... };
