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

/**
 * Cria um novo produto no backend.
 * @param {object} productData - Os dados do produto a serem enviados.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto do produto criado.
 */
// 👇 GARANTA QUE A PALAVRA "EXPORT" ESTEJA AQUI
export const createProduct = async (productData) => {
  try {
    const response = await fetch(API_PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ocorreu um erro ao criar o produto.');
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao criar produto:", error);
    throw error;
  }
};

/**
 * Busca um único produto pelo seu ID.
 * @param {string|number} id - O ID do produto.
 * @returns {Promise<object>} O objeto do produto encontrado.
 */
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_PRODUCTS_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Não foi possível encontrar o produto.');
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar produto com ID ${id}:`, error);
    throw error;
  }
};