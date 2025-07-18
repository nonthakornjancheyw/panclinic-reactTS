import React, { useRef,useState } from 'react';
import FeatureToggle from './FeatureToggle'; 
import {
  Table,
  Select,
  Tag,
  Row,
  Layout,
  Card,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';

import { SearchOutlined } from '@ant-design/icons';
import type { InputRef, TableColumnsType, TableColumnType } from 'antd';
import { Button, Input, Space, } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';

// import Highlighter from 'react-highlight-words';
const { Content } = Layout;

const dayUseOptions = ['30 Day', '60 Day'].map((val) => ({
  label: val,
  value: val,
}));

const frequencyOptions = ['-', '1 Week', '2 Week', '3 Week', '4 Week', '8 Week', '12 Week', '16 Week', '32 Week', '52 Week'].map(
  (val) => ({ label: val, value: val })
);

const productGroupOptions = ['AHA', 'Sun Screen', 'Anti Aging'].map((val) => ({
  label: val,
  value: val,
}));

interface ProductRow {
  key: string;
  name: string;
  features: string[];
  dayUse: string;
  frequency: string;
  productGroup: string[]; // เปลี่ยนจาก string → string[]
  time: string;
}

// สำหรับ react-sortablejs ต้องมี object interface แบบนี้
interface ItemInterface {
  id: string;
  value: string;
}

export default function ProductAdminTable() {
  const [data, setData] = useState<ProductRow[]>([
    {
      key: '1',
      name: 'VANP 10 gm.',
      features: ['ชุดเซลล์ผิวเก่า', 'คิวเท็นผิวกระชับ', 'ลดรอยดำ'],
      dayUse: '30 Day',
      frequency: '1 Week',
      productGroup: ['AHA'],
      time: '',
    },
    {
      key: '2',
      name: 'Anti SKL 10 gm.',
      features: ['กระชับ', 'ตึงเนื้อ'],
      dayUse: '60 Day',
      frequency: '4 Week',
      productGroup: ['Sun Screen'],
      time: '',
    },
    {
      key: '3',
      name: 'PD Cream 10 gm.',
      features: [],
      dayUse: '-',
      frequency: '-',
      productGroup: [],
      time: '',
    },
    {
      key: '4',
      name: 'Oxygen Tx.',
      features: ['เปล่งเปลั่ง'],
      dayUse: '-',
      frequency: '8 Week',
      productGroup: ['Anti Aging'],
      time: '',
    },
  ]);
  const searchInput = useRef<InputRef>(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  // อัปเดตข้อมูล
  const handleChange = (
    key: string,
    field: keyof ProductRow,
    value: string | string[]
  ) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  type DataIndex = keyof ProductRow;
  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<ProductRow> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) => <span>{text}</span>, // ❌ ไม่ใช้ Highlighter แล้ว
  });

  
  const columns: ColumnsType<ProductRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 500,
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),     
    },
    {
      title: 'ProductFeature',
      dataIndex: 'features',
      render: (features: string[], record) => (
        <FeatureToggle
          features={features}
          recordKey={record.key}
          onChange={(key, newFeatures) => handleChange(key, 'features', newFeatures)}
        />
      ),
    },
    {
      title: 'DayUse',
      dataIndex: 'dayUse',
      width: 160,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Select
          size="small"
          style={{ width: '100%' }}
          value={value}
          options={dayUseOptions}
          onChange={(val) => handleChange(record.key, 'dayUse', val)}
        />
      ),
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Select
          size="small"
          style={{ width: '100%' }}
          value={value}
          options={frequencyOptions}
          onChange={(val) => handleChange(record.key, 'frequency', val)}
        />
      ),
    },
    {
      title: 'ProductGroup',
      dataIndex: 'productGroup',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Select
          size="small"
          style={{ width: '100%' }}
          value={value[0] || undefined}
          onChange={(val) => handleChange(record.key, 'productGroup', [val])}
          options={productGroupOptions}
        />
      ),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) => (
        <Select
          size="small"
          style={{ width: '100%' }}
          value={value}
          options={frequencyOptions}
          onChange={(val) => handleChange(record.key, 'time', val)}
        />
      ),
    },
  ];

  return (
    <Layout>
      <Content>
        <Card style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          
          <Row gutter={[8, 0]} style={{ marginBottom: 8 }}>
            <Col>
              <Select mode="tags" size="small" style={{ width: 120 }} />
            </Col>
            <Col>
              <Select mode="tags" size="small" style={{ width: 120 }} />
            </Col>
            <Col>
              <Select mode="tags" size="small" style={{ width: 120 }} />
            </Col>
          </Row>

          <Row gutter={[8, 0]}>
            <Table
              size="small"
              columns={columns}
              dataSource={data}
              pagination={false}
              rowKey="key"
              scroll={{ y: 'calc(100vh - 200px)' }}
              style={{ fontSize: 12, padding: 0, }}
            />
          </Row>
        </Card>
      </Content>
    </Layout>
  );
}
