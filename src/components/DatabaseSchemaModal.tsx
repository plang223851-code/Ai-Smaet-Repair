import React, { useState } from 'react';
import { Database, Copy, Check, X, Layers, Key, Table } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FULL_DATABASE_SCHEMA_SQL, SCHEMA_TABLES } from '../data/databaseSchema';

export const DatabaseSchemaModal: React.FC = () => {
  const { isDbModalOpen, setIsDbModalOpen } = useApp();
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState('repair_requests');

  if (!isDbModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FULL_DATABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTableMeta = SCHEMA_TABLES.find((t) => t.tableName === selectedTable) || SCHEMA_TABLES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                โครงสร้างฐานข้อมูลเชิงสัมพันธ์ (Relational SQL Schema)
              </h2>
              <p className="text-xs text-slate-500">
                รองรับ PostgreSQL, MySQL, MariaDB และ SQLite พร้อม Foreign Key Constraints
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกเรียบร้อย' : 'คัดลอก SQL DDL'}</span>
            </button>
            <button
              onClick={() => setIsDbModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {SCHEMA_TABLES.map((table) => (
            <button
              key={table.tableName}
              onClick={() => setSelectedTable(table.tableName)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTable === table.tableName
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>{table.tableName}</span>
            </button>
          ))}
        </div>

        {/* Selected Table Documentation */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 font-mono">
              ตาราง: {currentTableMeta.tableName}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {currentTableMeta.description}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
              <thead className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Column Name</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Constraints</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTableMeta.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-semibold text-blue-700">
                      {col.name}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                      {col.type}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono">
                        {col.constraints}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw SQL DDL Code Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>SQL DDL Schema Script</span>
            <span className="text-slate-400 font-normal">พร้อมดัชนี Index และ Foreign Keys</span>
          </div>
          <pre className="p-4 bg-slate-900 text-blue-300 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64">
            {FULL_DATABASE_SCHEMA_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
