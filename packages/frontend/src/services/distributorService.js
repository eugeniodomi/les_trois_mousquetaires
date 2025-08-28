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
      throw new Error(`Erro ${response.status}: Não foi possível buscar os distribuidores.`);
    }
    return await response.json();
  } catch (error) {
    console.error("Falha ao buscar distribuidores:", error);
    throw error;
  }
};

/**
 * Cria um novo distribuidor no backend.
 * @param {object} distributorData - Os dados do distribuidor a serem criados.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto do distribuidor criado.
 */
export const createDistributor = async (distributorData) => {
  try {
    const response = await fetch(API_DISTRIBUTORS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(distributorData),
    });

    if (!response.ok) {
      // Tenta extrair uma mensagem de erro do corpo da resposta
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}: Não foi possível criar o distribuidor.`);
    }

    return await response.json();
  } catch (error) {
    console.error("Falha ao criar distribuidor:", error);
    throw error;
  }
};

// --- Funções adicionais para o futuro (edição, exclusão, etc.) ---

/**
 * Busca um único distribuidor pelo seu ID.
 * @param {string|number} id - O ID do distribuidor.
 * @returns {Promise<object>} O objeto do distribuidor.
 */
export const getDistributorById = async (id) => {
  try {
    const response = await fetch(`${API_DISTRIBUTORS_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: Não foi possível buscar o distribuidor.`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao buscar distribuidor com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Atualiza um distribuidor existente.
 * @param {string|number} id - O ID do distribuidor a ser atualizado.
 * @param {object} updateData - Os campos a serem atualizados.
 * @returns {Promise<object>} O objeto do distribuidor atualizado.
 */
export const updateDistributor = async (id, updateData) => {
  try {
    const response = await fetch(`${API_DISTRIBUTORS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}: Falha ao atualizar.`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao atualizar distribuidor com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Desativa (soft delete) um distribuidor.
 * @param {string|number} id - O ID do distribuidor a ser desativado.
 * @returns {Promise<object>} A resposta de sucesso do servidor.
 */
export const deleteDistributor = async (id) => {
  try {
    const response = await fetch(`${API_DISTRIBUTORS_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ${response.status}: Falha ao deletar.`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Falha ao deletar distribuidor com ID ${id}:`, error);
    throw error;
  }
};