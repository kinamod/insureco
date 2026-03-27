import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Column,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Search,
  Pagination,
  InlineNotification,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { Launch, Add } from '@carbon/icons-react';
import { AreaChart, GaugeChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import './NetworkDashboard.scss';

// --- Mock chart data ---
const areaChartData = [
  { group: 'Network Traffic', date: '2024-01-01', value: 340 },
  { group: 'Network Traffic', date: '2024-01-15', value: 480 },
  { group: 'Network Traffic', date: '2024-02-01', value: 280 },
  { group: 'Network Traffic', date: '2024-02-15', value: 520 },
  { group: 'Network Traffic', date: '2024-03-01', value: 510 },
  { group: 'Network Traffic', date: '2024-03-15', value: 360 },
  { group: 'Network Traffic', date: '2024-04-01', value: 420 },
  { group: 'Network Traffic', date: '2024-04-15', value: 390 },
  { group: 'Network Traffic', date: '2024-05-01', value: 600 },
  { group: 'Network Traffic', date: '2024-05-15', value: 580 },
  { group: 'Credit Usage', date: '2024-01-01', value: 180 },
  { group: 'Credit Usage', date: '2024-01-15', value: 210 },
  { group: 'Credit Usage', date: '2024-02-01', value: 195 },
  { group: 'Credit Usage', date: '2024-02-15', value: 260 },
  { group: 'Credit Usage', date: '2024-03-01', value: 230 },
  { group: 'Credit Usage', date: '2024-03-15', value: 300 },
  { group: 'Credit Usage', date: '2024-04-01', value: 275 },
  { group: 'Credit Usage', date: '2024-04-15', value: 320 },
  { group: 'Credit Usage', date: '2024-05-01', value: 290 },
  { group: 'Credit Usage', date: '2024-05-15', value: 350 },
];

const areaChartOptions = {
  title: 'Network Traffic',
  axes: {
    bottom: { title: 'Date', mapsTo: 'date', scaleType: 'time' },
    left: { mapsTo: 'value', scaleType: 'linear' },
  },
  curve: 'curveMonotoneX',
  height: '300px',
  color: {
    scale: {
      'Network Traffic': '#6929C4',
      'Credit Usage': '#1192E8',
    },
  },
};

const gaugeChartData = [
  { group: 'value', value: 42 },
  { group: 'delta', value: -13.37 },
];

const gaugeChartOptions = {
  title: 'Credit Usage',
  resizable: true,
  height: '300px',
  gauge: {
    type: 'semi',
    status: 'danger',
  },
  color: {
    scale: { value: '#6929C4' },
  },
};

// --- Mock device data ---
const deviceHeaders = [
  { key: 'name', header: 'Device Name' },
  { key: 'type', header: 'Type' },
  { key: 'ip', header: 'IP Address' },
  { key: 'mac', header: 'MAC Address' },
  { key: 'status', header: 'Status' },
  { key: 'location', header: 'Location' },
  { key: 'lastSeen', header: 'Last Seen' },
  { key: 'bandwidth', header: 'Bandwidth' },
];

const deviceRows = [
  { id: '1', name: 'Router-HQ-01', type: 'Router', ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:01', status: 'Online', location: 'Main Office', lastSeen: '2 min ago', bandwidth: '450 Mbps' },
  { id: '2', name: 'Switch-Floor2', type: 'Switch', ip: '192.168.1.5', mac: 'AA:BB:CC:DD:EE:02', status: 'Online', location: 'Floor 2', lastSeen: '1 min ago', bandwidth: '320 Mbps' },
  { id: '3', name: 'AP-Conference', type: 'Access Point', ip: '192.168.1.20', mac: 'AA:BB:CC:DD:EE:03', status: 'Online', location: 'Conference Room', lastSeen: '5 min ago', bandwidth: '120 Mbps' },
  { id: '4', name: 'Server-DB-01', type: 'Server', ip: '192.168.1.50', mac: 'AA:BB:CC:DD:EE:04', status: 'Online', location: 'Data Center', lastSeen: 'Just now', bandwidth: '800 Mbps' },
  { id: '5', name: 'Printer-L3', type: 'Printer', ip: '192.168.1.80', mac: 'AA:BB:CC:DD:EE:05', status: 'Offline', location: 'Floor 3', lastSeen: '2 hrs ago', bandwidth: '0 Mbps' },
  { id: '6', name: 'Camera-Lobby', type: 'IP Camera', ip: '192.168.1.90', mac: 'AA:BB:CC:DD:EE:06', status: 'Online', location: 'Lobby', lastSeen: '30 sec ago', bandwidth: '15 Mbps' },
  { id: '7', name: 'VoIP-Phone-201', type: 'VoIP', ip: '192.168.1.110', mac: 'AA:BB:CC:DD:EE:07', status: 'Online', location: 'Suite 201', lastSeen: '3 min ago', bandwidth: '2 Mbps' },
  { id: '8', name: 'Workstation-Mkt', type: 'Workstation', ip: '192.168.1.120', mac: 'AA:BB:CC:DD:EE:08', status: 'Online', location: 'Marketing', lastSeen: '8 min ago', bandwidth: '45 Mbps' },
];

export default function NetworkDashboard() {
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notificationOpen, setNotificationOpen] = useState(true);

  const filteredRows = deviceRows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  return (
    <div className="network-dashboard">
      {/* Breadcrumbs */}
      <div className="network-dashboard__breadcrumb-bar">
        <Breadcrumb noTrailingSlash>
          <BreadcrumbItem>
            <Link to="/business/dashboard">Service</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>Administrative Dashboard</BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="network-dashboard__page-header">
        <div className="network-dashboard__header-left">
          <h1 className="network-dashboard__page-title">Network Administration Dashboard</h1>
          <p className="network-dashboard__page-description">Network Traffic, Credit Usage, and Your Devices</p>
        </div>
        <Button kind="primary" renderIcon={Launch} iconDescription="Refresh Data" className="network-dashboard__refresh-btn">
          Refresh Data
        </Button>
      </div>

      {/* Search + Pagination row */}
      <div className="network-dashboard__toolbar">
        <div className="network-dashboard__search-wrap">
          <Search
            labelText="Search devices"
            placeholder="Placeholder"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="md"
          />
        </div>
        <div className="network-dashboard__pagination-wrap">
          <Pagination
            page={page}
            pageSize={pageSize}
            pageSizes={[10, 20, 50]}
            totalItems={filteredRows.length}
            onChange={({ page: p, pageSize: ps }) => { setPage(p); setPageSize(ps); }}
            size="md"
          />
        </div>
      </div>

      {/* Warning notification */}
      {notificationOpen && (
        <div className="network-dashboard__notification">
          <InlineNotification
            kind="warning"
            title="Title"
            subtitle="Message"
            onCloseButtonClick={() => setNotificationOpen(false)}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="network-dashboard__charts-row">
        <div className="network-dashboard__chart-card">
          <AreaChart data={areaChartData} options={areaChartOptions} />
        </div>
        <div className="network-dashboard__chart-card">
          <GaugeChart data={gaugeChartData} options={gaugeChartOptions} />
        </div>
      </div>

      {/* My Devices section */}
      <div className="network-dashboard__devices-section">
        <div className="network-dashboard__devices-header">
          <div className="network-dashboard__devices-header-left">
            <h2 className="network-dashboard__devices-title">My Devices</h2>
            <p className="network-dashboard__devices-description">Devices on your local network</p>
          </div>
          <Button kind="primary" renderIcon={Launch} iconDescription="Add Device" className="network-dashboard__add-btn">
            Add Device
          </Button>
        </div>

        <DataTable rows={filteredRows} headers={deviceHeaders} isSortable>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer title="Devices" description="Active and inactive devices on your network">
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
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </div>
  );
}
