import './GlobalContextToggle.css';

interface GlobalContextToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const GlobalContextToggle = ({ enabled, onChange, disabled = false }: GlobalContextToggleProps) => {
  return (
    <div className="global-context-toggle">
      <label className="toggle-label">
        <input
          type="checkbox"
          className="toggle-checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-slider"></span>
        <span className="toggle-text">
          <span className="toggle-icon">🌍</span>
          Usar contexto global
        </span>
      </label>
      {enabled && (
        <div className="toggle-hint">
          A IA vai considerar todas as memórias, não apenas do assunto selecionado
        </div>
      )}
    </div>
  );
};

export default GlobalContextToggle;
