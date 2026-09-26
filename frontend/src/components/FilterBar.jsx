import Icon from "./Icon";
import { Button, Select, Text } from "./ui";

const defaults = { documentType: "", status: "", warehouse: "", category: "" };

function TerminalSelect({ label, value, onChange, children }) {
  return (
    <label className="filter-control">
      <Text as="span">{label}</Text>
      <div><Select value={value} onChange={onChange}>{children}</Select><Icon name="chevron" size={14} /></div>
    </label>
  );
}

export default function FilterBar({ filters = defaults, onChange = () => {}, showDocumentType = true }) {
  const update = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <div className="filter-bar">
      <div className="filter-heading"><Icon name="sliders" size={16} /><Text>Filters</Text></div>
      {showDocumentType && <TerminalSelect label="Document type" value={filters.documentType} onChange={update("documentType")}>
        <option value="">All documents</option><option>Receipts</option><option>Delivery</option><option>Internal</option><option>Adjustments</option>
      </TerminalSelect>}
      <TerminalSelect label="Status" value={filters.status} onChange={update("status")}>
        <option value="">All statuses</option><option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option><option>Canceled</option>
      </TerminalSelect>
      <TerminalSelect label="Warehouse" value={filters.warehouse} onChange={update("warehouse")}>
        <option value="">All warehouses</option><option>Central Warehouse</option><option>East Hub</option><option>West Distribution</option>
      </TerminalSelect>
      <TerminalSelect label="Product category" value={filters.category} onChange={update("category")}>
        <option value="">All categories</option><option>Safety & PPE</option><option>Hardware</option><option>Electrical</option><option>Materials</option>
      </TerminalSelect>
      {hasFilters && <Button className="clear-filters" onClick={() => onChange(defaults)}>Clear all</Button>}
    </div>
  );
}
