import { ImportResponse, DebugImportResponse } from '../types/import';

const API_BASE_URL = '/api';

/**
 * Analisa o arquivo de conversas do ChatGPT sem importar (preview)
 * @param fileContent - Conteúdo RAW do arquivo conversations.json
 */
export const debugImport = async (fileContent: string): Promise<DebugImportResponse> => {
  try {
    console.log('Enviando para análise prévia...');

    const response = await fetch(`${API_BASE_URL}/chat/debug-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: fileContent, // Envia o conteúdo RAW do arquivo
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do backend:', response.status, errorText);
      throw new Error(`Erro na análise: ${response.status}`);
    }

    const result = await response.json();
    console.log('Resultado da análise:', result);
    return result;
  } catch (error) {
    console.error('Erro ao analisar conversas:', error);
    throw error;
  }
};

/**
 * Importa conversas do ChatGPT para o banco de dados
 * @param fileContent - Conteúdo RAW do arquivo conversations.json
 */
export const importChatGPT = async (fileContent: string): Promise<ImportResponse> => {
  try {
    console.log('Iniciando importação de conversas do ChatGPT...');

    const response = await fetch(`${API_BASE_URL}/chat/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: fileContent, // Envia o conteúdo RAW do arquivo
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do backend:', response.status, errorText);
      throw new Error(`Erro na importação: ${response.status}`);
    }

    const result = await response.json();
    console.log('Resultado da importação:', result);
    return result;
  } catch (error) {
    console.error('Erro ao importar conversas:', error);
    throw error;
  }
};
