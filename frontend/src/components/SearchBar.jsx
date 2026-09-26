import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { Input, Text } from "./ui";
import { productOptions } from "../data/mockData";

export default function SearchBar({ onResults, placeholder = "Search SKU, product, order…" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      onResults?.([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      let matches;
      try {
        requestRef.current?.abort();
        requestRef.current = new AbortController();
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`, { signal: requestRef.current.signal });
        if (!response.ok) throw new Error("Using local search");
        matches = await response.json();
      } catch {
        const normalized = query.toLowerCase();
        matches = productOptions.filter((item) => `${item.name} ${item.sku}`.toLowerCase().includes(normalized));
      }
      setResults(matches);
      onResults?.(matches);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, onResults]);

  return (
    <div className="search-wrap">
      <div className={`search-field ${focused ? "focus" : ""}`}>
        <Icon name="search" size={18} />
        <Input
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
        />
        <span className="key-hint">⌘ K</span>
      </div>
      {focused && query && (
        <div className="search-results">
          <Text className="result-label">{results.length} MATCHES / LIVE INDEX</Text>
          {results.length ? results.slice(0, 4).map((item) => (
            <div className="result-row" key={item.sku}>
              <span className="result-icon"><Icon name="box" size={16} /></span>
              <div><Text>{item.name}</Text><Text>{item.sku}</Text></div>
              <span><b>{item.stock}</b> on hand</span>
            </div>
          )) : <Text className="no-results">No inventory matches found.</Text>}
        </div>
      )}
    </div>
  );
}
