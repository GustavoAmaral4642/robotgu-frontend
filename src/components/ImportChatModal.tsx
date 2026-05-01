import { useState } from 'react';
import { importChatGPT, debugImport } from '../services/import';
import { ImportResponse, DebugImportResponse } from '../types/import';
import './ImportChatModal.css';

interface ImportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportChatModal = ({ isOpen, onClose, onSuccess }: ImportChatModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DebugImportResponse | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validações
    if (!selectedFile.type.includes('json') && !selectedFile.name.endsWith('.json')) {
      setError('Por favor, selecione um arquivo JSON válido');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande! Máximo: 10 MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
    setPreview(null);

    // Lê o arquivo e faz preview
    try {
      setIsLoading(true);
      const content = await selectedFile.text();
      setFileContent(content);

      // Chama o preview
      const previewData = await debugImport(content);
      setPreview(previewData);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof SyntaxError) {
        setError('Arquivo JSON inválido. Verifique o formato.');
      } else if (err instanceof Error) {
        setError(`Erro ao analisar: ${err.message}`);
      } else {
        setError('Erro ao analisar arquivo. Tente novamente.');
      }
      console.error('Erro no preview:', err);
    }
  };

  const handleImport = async () => {
    if (!fileContent) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Envia o conteúdo RAW do arquivo para o backend
      const response = await importChatGPT(fileContent);

      setResult(response);
      setPreview(null);

      if (response.memoriesImported > 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 3000);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Arquivo JSON inválido. Verifique o formato.');
      } else if (err instanceof Error) {
        setError(`Erro ao importar: ${err.message}`);
      } else {
        setError('Erro ao importar conversas. Tente novamente.');
      }
      console.error('Erro na importação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setPreview(null);
    setFileContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="import-modal-overlay" onClick={handleClose}>
      <div className="import-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <h2>📥 Importar do ChatGPT</h2>
          <button className="import-close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="import-modal-body">
          {!result ? (
            <>
              <div className="import-instructions">
                <h3>Como exportar do ChatGPT:</h3>
                <ol>
                  <li>Acesse <strong>ChatGPT</strong></li>
                  <li>Vá em <strong>Settings → Data Controls</strong></li>
                  <li>Clique em <strong>Export data</strong></li>
                  <li>Baixe o arquivo <code>conversations.json</code></li>
                  <li>Faça upload aqui</li>
                </ol>
                <div className="import-note">
                  ℹ️ As conversas serão importadas na aba <strong>"ChatGPT Importado"</strong> organizadas por assunto.
                </div>
              </div>

              <div className="import-file-input">
                <label htmlFor="file-upload" className="file-upload-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>{file ? file.name : 'Escolher arquivo JSON'}</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>

              {preview && !isLoading && (
                <div className="import-preview">
                  <h3>📊 Preview da Importação</h3>
                  <div className="preview-stats">
                    <div className="stat-item">
                      <span className="stat-number">{preview.totalConversations}</span>
                      <span className="stat-label">Conversas Encontradas</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        {preview.conversations.reduce((sum, c) => sum + c.totalMessages, 0)}
                      </span>
                      <span className="stat-label">Mensagens Totais</span>
                    </div>
                  </div>
                  <div className="preview-conversations">
                    <h4>Primeiras conversas:</h4>
                    <ul>
                      {preview.conversations.slice(0, 5).map((conv, idx) => (
                        <li key={idx}>
                          <strong>{conv.title}</strong> ({conv.totalMessages} mensagens)
                        </li>
                      ))}
                      {preview.conversations.length > 5 && (
                        <li className="more-indicator">
                          ... e mais {preview.conversations.length - 5} conversas
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {error && (
                <div className="import-error">
                  ⚠️ {error}
                </div>
              )}

              <div className="import-actions">
                <button
                  className="import-cancel-button"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  className="import-submit-button"
                  onClick={handleImport}
                  disabled={!file || isLoading || !preview}
                >
                  {isLoading ? (
                    <>
                      <div className="import-spinner"></div>
                      {preview ? 'Importando...' : 'Analisando...'}
                    </>
                  ) : (
                    'Importar Conversas'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="import-result">
              <div className="result-icon">
                {result.memoriesImported > 0 ? '✅' : '⚠️'}
              </div>
              <h3>Importação {result.memoriesImported > 0 ? 'Concluída' : 'Parcial'}</h3>

              <div className="result-stats">
                <div className="stat-item success">
                  <span className="stat-number">{result.memoriesImported}</span>
                  <span className="stat-label">Memórias Importadas</span>
                </div>
                <div className="stat-item info">
                  <span className="stat-number">{result.totalConversations}</span>
                  <span className="stat-label">Conversas Processadas</span>
                </div>
                <div className="stat-item info">
                  <span className="stat-number">{result.duplicatesSkipped}</span>
                  <span className="stat-label">Duplicadas Ignoradas</span>
                </div>
              </div>

              <div className="result-details">
                <p><strong>Tempo:</strong> {(result.importDurationMs / 1000).toFixed(1)}s</p>
                {result.subjectsCreated && result.subjectsCreated.length > 0 && (
                  <div className="subjects-created">
                    <strong>Assuntos criados:</strong>
                    <ul>
                      {result.subjectsCreated.slice(0, 5).map((subject, idx) => (
                        <li key={idx}>{subject}</li>
                      ))}
                      {result.subjectsCreated.length > 5 && (
                        <li>... e mais {result.subjectsCreated.length - 5} assuntos</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="result-errors">
                  <h4>⚠️ Avisos:</h4>
                  <ul>
                    {result.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error.message || JSON.stringify(error)}</li>
                    ))}
                    {result.errors.length > 3 && (
                      <li>... e mais {result.errors.length - 3} avisos</li>
                    )}
                  </ul>
                </div>
              )}

              {result.memoriesImported > 0 && (
                <p className="result-message">
                  ✨ Memórias importadas com sucesso! Redirecionando...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportChatModal;
