// frontend/src/components/AppointmentsTable.js
import React from 'react';
import { useTable } from 'react-table';

const AppointmentsTable = ({ data }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Cliente',
        accessor: 'client', 
      },
      {
        Header: 'Hora',
        accessor: 'time', 
      },
      {
        Header: 'Servicio',
        accessor: 'service', 
      },
      {
        Header: 'Empleado',
        accessor: 'employee', 
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="py-3 px-4 border-b-2 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-100">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="py-3 px-4 border-b border-gray-200 text-sm">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
