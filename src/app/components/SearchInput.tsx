"use client";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const searchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const clearIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "var(--muted)" }}
      >
        {searchIcon}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm outline-none"
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-body)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--foreground)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5"
          style={{ color: "var(--muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          {clearIcon}
        </button>
      )}
    </div>
  );
}
