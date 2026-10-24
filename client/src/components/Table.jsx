import React from 'react';

export const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item) => item.id || item._id,
  renderMobileCard,
  emptyMessage = 'No records found',
  isLoading = false,
}) => {
  if (data.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Card View (visible on < 640px) */}
      <div className="block sm:hidden space-y-3">
        {data.map((item, index) => {
          const key = keyExtractor(item, index);
          if (renderMobileCard) {
            return <div key={key}>{renderMobileCard(item)}</div>;
          }
          // Default mobile card fallback: stacked key-values
          return (
            <div
              key={key}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
            >
              {columns.map((col) => (
                <div key={col.key || col.header} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {col.header}:
                  </span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    {col.render ? col.render(item) : item[col.key]}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Desktop & Tablet Table (visible on >= 640px) */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-850/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  className={`px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key || col.header}
                    className={`px-4 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
