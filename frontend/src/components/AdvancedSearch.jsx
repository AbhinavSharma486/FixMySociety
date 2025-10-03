import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Calendar,
  Building2,
  FileText,
  User,
  MapPin
} from 'lucide-react';
import { globalSearch, getSearchSuggestions, getSearchFilters } from '../lib/searchService';
import toast from 'react-hot-toast';

const AdvancedSearch = ({ onSearchResults, placeholder = "Search complaints, buildings, users..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    status: '',
    building: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });
  const [availableFilters, setAvailableFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchAvailableFilters();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAvailableFilters = async () => {
    try {
      const response = await getSearchFilters();
      setAvailableFilters(response.filters);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await getSearchSuggestions(query, filters.type);
      setSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  };

  const saveSearchHistory = (searchQuery) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newHistory = [searchQuery, ...history.filter(h => h !== searchQuery)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const searchParams = {
        query: query.trim(),
        ...filters
      };

      const response = await globalSearch(searchParams);
      onSearchResults(response);
      saveSearchHistory(query.trim());
      setShowSuggestions(false);
      toast.success(`Found ${Object.values(response.results).reduce((sum, result) => sum + (result?.total || 0), 0)} results`);
    } catch (error) {
      toast.error(error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    handleSearch();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: '',
      status: '',
      building: '',
      priority: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md transition-colors ${hasActiveFilters
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
                }`}
              title="Advanced filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div className="p-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
                <div className="space-y-1">
                  {searchHistory.slice(0, 3).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Search className="inline w-3 h-3 mr-2" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {suggestion.type === 'complaint' && <FileText className="w-3 h-3 text-blue-500" />}
                        {suggestion.type === 'building' && <Building2 className="w-3 h-3 text-green-500" />}
                        {suggestion.type === 'user' && <User className="w-3 h-3 text-purple-500" />}
                        <span>{suggestion.text}</span>
                        {suggestion.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {suggestion.category}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="complaints">Complaints</option>
                <option value="buildings">Buildings</option>
                <option value="users">Users</option>
              </select>
            </div>

            {/* Category */}
            {filters.type === 'all' || filters.type === 'complaints' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {availableFilters.categories?.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Status */}
            {filters.type === 'all' || filters.type === 'complaints' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  {availableFilters.statuses?.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <select
                value={filters.building}
                onChange={(e) => setFilters(prev => ({ ...prev, building: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Buildings</option>
                {availableFilters.buildings?.map(building => (
                  <option key={building} value={building}>{building}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            {filters.type === 'all' || filters.type === 'complaints' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  {availableFilters.priorities?.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                'Search with Filters'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;