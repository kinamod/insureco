import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react';
import { formatCurrency, formatDate } from '../../utils/businessHelpers';
import './AssetLedgerTable.scss';

const headers = [
  { key: 'name', header: 'Asset ID/Name' },
  { key: 'category', header: 'Category' },
  { key: 'premiumDue', header: 'Premium Due' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'totalClaims', header: 'Total Claims' },
];

/**
 * AssetLedgerTable - sortable Auto + Property ledger shared across all
 * Financial Dashboard variants. Clicking a row drills into the existing
 * property/vehicle detail page (Master-Detail navigation per the PRD).
 */
export default function AssetLedgerTable({ assets, className = '' }) {
  const navigate = useNavigate();

  const rows = assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    category: asset.category,
    premiumDue: formatCurrency(asset.premiumDue),
    dueDate: formatDate(asset.dueDate),
    totalClaims: formatCurrency(asset.totalClaims),
    detailPath: asset.detailPath,
  }));

  return (
    <div className={`asset-ledger-table ${className}`}>
      <DataTable rows={rows} headers={headers} isSortable>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const asset = assets.find((a) => a.id === row.id);
                return (
                  <TableRow
                    {...getRowProps({ row })}
                    key={row.id}
                    className="asset-ledger-row"
                    onClick={() => navigate(asset.detailPath)}
                  >
                    {row.cells.map((cell) =>
                      cell.info.header === 'category' ? (
                        <TableCell key={cell.id}>
                          <Tag type={cell.value === 'Auto' ? 'blue' : 'purple'}>
                            {cell.value}
                          </Tag>
                        </TableCell>
                      ) : (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      )
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
}
