import React from 'react';
import './FilterBar.css';

const FilterBar = ({ sports, providers, selectedFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label>Filter by Sport:</label>
        <select
          value={selectedFilter.type === 'sport' ? selectedFilter.value : 'all'}
          onChange={(e) => onFilterChange('sport', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Sports</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-section">
        <label>Filter by Provider:</label>
        <select
          value={selectedFilter.type === 'provider' ? selectedFilter.value : 'all'}
          onChange={(e) => onFilterChange('provider', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Providers</option>
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;

