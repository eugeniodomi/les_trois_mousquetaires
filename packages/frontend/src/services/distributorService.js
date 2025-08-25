// A URL base da sua API de distribuidores.
const API_DISTRIBUTORS_URL = 'http://localhost:5000/api/distribuidores';

/**
 * Busca todos os distribuidores ativos do backend.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de distribuidores.
 */
export const getDistributors = async () => {
  try {
    const response = await fetch(API_DISTRIBUTORS_URL);

    if (!response.ok) {
      // Lança um erro mais específico para ser tratado na camada de visualização (e.g., no componente React)
      throw new Error(`Erro ${response.status}: Não foi possível buscar os distribuidores.`);
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao buscar distribuidores:", error);
    // Propaga o erro para que o código que chamou a função saiba que algo deu errado.
    throw error;
  }
};

// Você pode adicionar outras funções e exportá-las da mesma forma
// export const getDistributorById = async (id) => { ... };