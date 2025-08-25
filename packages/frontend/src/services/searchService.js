// A URL base da sua API. Altere se o seu backend estiver rodando em outra porta.
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Realiza uma busca global na nossa API.
 * @param {string} searchTerm - O termo que será buscado.
 * @returns {Promise<Array>} - Uma promessa que resolve para um array de resultados.
 */
export const globalSearchApi = async (searchTerm) => {
  // Constrói a URL com os parâmetros de busca de forma segura.
  const url = new URL(`${API_BASE_URL}/search`);
  url.searchParams.append('q', searchTerm);
  
  try {
    const response = await fetch(url);

    // Verifica se a resposta da rede foi bem-sucedida (status 2xx)
    if (!response.ok) {
      // Se não foi, tenta ler a mensagem de erro do backend ou lança um erro genérico.
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro de rede ao buscar dados.');
    }

    // Se a resposta foi bem-sucedida, retorna os dados em formato JSON.
    return await response.json();
  } catch (error) {
    console.error("Falha ao conectar com a API de busca:", error);
    // Re-lança o erro para que o componente React possa capturá-lo e mostrar ao usuário.
    throw error;
  }
};