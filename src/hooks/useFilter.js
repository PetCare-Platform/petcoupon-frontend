import { useMemo, useState } from 'react';

export function useFilter(items, initialValue = 'all') {
  const [value, setValue] = useState(initialValue);

  const filtered = useMemo(
    () => (value === 'all' ? items : items.filter((item) => item.status === value)),
    [items, value],
  );

  return { value, setValue, filtered, count: filtered.length };
}
