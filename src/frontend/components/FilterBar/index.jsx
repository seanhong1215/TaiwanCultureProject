// components/FilterBar.jsx
const FilterBar = ({ filters, onFilterChange, selectedFilters }) => {
  return (
    <div className="mb-3">
      {filters.map((filter) => (
        <div key={filter.key} className="dropdown d-inline-block me-2">
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            {filter.label}
          </button>
          <ul className="dropdown-menu">
            {filter.options.map((option) => (
              <li key={option.value}>
                <button
                  className={`dropdown-item ${
                    selectedFilters[filter.key] === option.value ? 'active' : ''
                  }`}
                  onClick={() => onFilterChange(filter.key, option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export { FilterBar };