export default function FilterBar({ options, value, onChange, ariaLabel, controlsId }) {
  return (
    <div className="filter-bar" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`filter-pill${value === option.value ? ' is-active' : ''}`}
          aria-pressed={value === option.value}
          aria-controls={controlsId}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
