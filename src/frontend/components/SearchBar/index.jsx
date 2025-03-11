// components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ onSearch, placeholder = "搜尋..." }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="input-group mb-3">
      <span className="input-group-text">
        <i className="bi bi-search"></i>
      </span>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        onChange={handleSearch}
      />
    </div>
  );
};


export { SearchBar };