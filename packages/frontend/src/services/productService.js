// A URL base da sua API de produtos.
const API_PRODUCTS_URL = 'http://localhost:5000/api/produtos';

/**
 * Busca todos os produtos ativos do backend.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de produtos.
 */
export const getProducts = async () => {
  try {
    const response = await fetch(API_PRODUCTS_URL);

    if (!response.ok) {
      throw new Error('Não foi possível buscar os produtos.');
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao buscar produtos:", error);
    throw error;
  }
};

// No futuro, você pode adicionar outras funções aqui:
// export const createProduct = async (productData) => { ... };
// export const updateProduct = async (id, productData) => { ... };