import React, { useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import FeatureToggle from './FeatureToggle'; 
import { 
  Table, Select, Spin, Row, Layout, Card, 
  Col, Pagination, Button, Input, Space,
  message, Typography, Tag
} from 'antd';
const { Text } = Typography;
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, SaveOutlined, LineOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import * as productApi from './productApi';
import './style.css';

// import Highlighter from 'react-highlight-words';
const { Content } = Layout;
const { Option } = Select;

const dayUseOptions = [
  { label: '-', value: '', color: '#fff' }, // ว่างจริง (ไม่มี label)
  { label: '30 Day', value: '30 Day', color: '#ff85c0' },
  { label: '60 Day', value: '60 Day', color: '#9254de' },
];



const frequencyOptions = [
  { label: '-', value: '', color: '#fff' }, // placeholder
  { label: '1 Week', value: '1 Week', color: '#02bcd4' },
  { label: '2 Week', value: '2 Week', color: '#ff4081' },
  { label: '4 Week', value: '4 Week', color: '#ea80fc' },
  { label: '5 Week', value: '5 Week', color: '#7c4dff' },
  { label: '16 Week', value: '16 Week', color: '#f900ea' },
  { label: '32 Week', value: '32 Week', color: '#af7e2e' },
  { label: '52 Week', value: '52 Week', color: '#9b59b6' },
];


const productGroupOptions = [
  { label: 'AHA', value: 'AHA', color: '#69c0ff' },
  { label: 'Sun Screen', value: 'Sun Screen', color: '#ff9c6e' },
  { label: 'Anti Aging', value: 'Anti Aging', color: '#b37feb' },
];

const timeOptions = [
  { label: 'Time1', value: 'Time1', color: '#69c0ff' },
  { label: 'Time2', value: 'Time2', color: '#ff9c6e' },
  { label: 'Time3', value: 'Time3', color: '#b37feb' },
];


interface ProductRow {
  key: string;
  name: string;
  features: string[];
  dayUse: string;
  frequency: string;
  productGroup: string[]; // เปลี่ยนจาก string → string[]
  time: string;
}

interface Brand {
  CategoryID: string;
  CategoryName: string;
  BrandID: string;
  BrandName: string;
  CategoryOrder: number;
}

type Option = { label: string; value: string; color?: string };
const renderSelectCell = <Field extends keyof ProductRow>(
  value: ProductRow[Field],
  record: ProductRow,
  options: Option[],
  field: Field,
  handleChange: (key: string, field: Field, value: ProductRow[Field]) => void
) => {
  // จัดการกรณี array (เช่น productGroup: string[])
  const currentValue =
    Array.isArray(value) && value.length > 0 ? value[0] : (value as string) || '';

  const isEmpty = !currentValue || currentValue === '';

  return (
    <Select
      size="small"
      style={{
        width: '100%',
        backgroundColor:
          options.find((o) => o.value === currentValue)?.color || '#fff',
        color: '#fff',
        borderRadius: 4,
        textAlign: isEmpty ? 'left' : 'center',
      }}
      value={isEmpty ? undefined : currentValue}
      placeholder={
        <span
          style={{
            color: '#8D8D8D',
            display: 'inline-block',
            width: '8px',
            borderBottom: '1px solid #8D8D8D',
            verticalAlign: 'middle',
            lineHeight: 'normal',
            textAlign: 'left',
          }}
        />
      }
      options={
        (isEmpty ? options.filter((opt) => opt.value !== '') : options).map((opt) => ({
          value: opt.value,
          label: (
            <div
              style={{
                backgroundColor: opt.color || '#fff',
                color: opt.value ? '#fff' : '#8D8D8D',
                textAlign: 'center',
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {opt.label}
            </div>
          ),
        }))
      }
      onChange={(val) => {
        // ถ้า field เป็น productGroup (string[]) ต้องเก็บเป็น array
        const newValue = (Array.isArray(value) ? [val] : val) as ProductRow[Field];
        handleChange(record.key, field, newValue);
      }}
      suffixIcon={null} // ซ่อน icon dropdown
    />
  );
};


export default function ProductAdminTable() {
  const [spinning, setSpinning] = useState<boolean>(false); // loading 
  const [currentPage, setCurrentPage] = useState(1); //หน้า
  const PAGE_SIZE = 50;
  const [categoriesItem, setCategoriesItem] = useState<{rptCategoryID: string; rptCategoryName: string;}[]>([]);//เก็บประเภทcategory

  const [allBrands, setAllBrands] = useState<Brand[]>([]); //เก็บbrandทั้งหมด
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]); // เอาไว้ bind Select
  
  const [search, setSearch] = useState({
    nameProduct: '',
    categoryID: undefined as string | undefined,
    brandID: [] as string[],
    statusTag: undefined as string | undefined,
  });

  const [data, setData] = useState<ProductRow[]>([]);
  const [originalData, setOriginalData] = useState<ProductRow[]>([]);


  const searchInput = useRef<InputRef>(null);


  const fetchData = async () => {
    try {
      const data = await productApi.GetFetch() as {
        category: { rptCategoryID: string; rptCategoryName: string }[];
        brand: { CategoryID: string; CategoryName: string; BrandID: string; BrandName: string; CategoryOrder: number }[];
      };

      // เก็บประเภท
      const allItem = { rptCategoryID: 'ALL', rptCategoryName: 'ทั้งหมด' };
      const newData = [allItem, ...data.category];
      setCategoriesItem(newData);

      // แปลงชื่อ CategoryOrder → rptCategoryOrder (ถ้าต้องการ)
      const transformedBrands = data.brand.map(item => ({
        ...item,
        rptCategoryOrder: item.CategoryOrder,
      }));

      setAllBrands(transformedBrands);
      setSearch(prev => ({ ...prev, categoryID: 'ALL' }));
      setFilteredBrands(transformedBrands); // เริ่มต้นแสดงแบรนด์ทั้งหมด

      handleSearch(1);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (search.categoryID === 'ALL') {
      setFilteredBrands(allBrands); // หรือจะใส่ทุกแบรนด์ก็ได้
    } else {
      const result = allBrands.filter(function (b) {
        return b.CategoryID === search.categoryID;
      });
      setFilteredBrands(result);
    }
    // เคลียร์แบรนด์ที่เลือกอยู่
    setSearch({ ...search, brandID: [] });
  }, [search.categoryID]);


  const handleSearch = async (page = 1) => {
    try {
      console.log('handleSearch')
      console.log('brandID=',search.brandID)
      setSpinning(true)
      const selectedCategoryID = search.categoryID || 'ALL';
      const response: any = await productApi.GetProduct( search.nameProduct, selectedCategoryID, search.brandID, search.statusTag, page, PAGE_SIZE);
      const mappedData: ProductRow[] = response.map((item: any) => {
        const tags: string[] = item.TagDetail ? item.TagDetail.split(',').map((tag: string) => tag.trim()) : [];
        const priorities: number[] = item.TagPriority ? item.TagPriority.split(',').map((p: string) => parseInt(p.trim(), 10)) : [];

        const tagWithPriority: { tag: string; priority: number }[] = tags.map((tag: string, idx: number) => ({
          tag,
          priority: priorities[idx] || 999,
        }));

        tagWithPriority.sort((a, b) => a.priority - b.priority);

        return {
          key: item.ProductID,
          name: item.Name,
          features: tagWithPriority.map((t) => t.tag),
          dayUse: '',
          frequency: '',
          productGroup: [],
          time: '',
        };
      });

      setData(mappedData);
      setOriginalData(JSON.parse(JSON.stringify(mappedData)));
    } catch (error) {
      console.error(error);
    }
    finally {
      setSpinning(false);
    }
  };

  const handleSave = async () => {
  try {
    const changedItems = data
      .map(function (currentItem) {
        const originalItem = originalData.find(function (o) {
          return o.key === currentItem.key;
        });

        if (!originalItem) return null;

        const originalTags = originalItem.features || [];
        const currentTags = currentItem.features || [];
        const originalSet = new Set(originalTags);

        // ตรวจสอบ tag ปัจจุบันทั้งหมด เรียงตามลำดับจริง
        const tagsWithStatus = currentTags.map(function (tag, index) {
          const newPriority = index + 1;
          const oldIndex = originalTags.indexOf(tag);
          const oldPriority = oldIndex + 1;

          if (!originalSet.has(tag)) {
            return {
              tagName: tag,
              tagStatus: 'Add',
              priority: newPriority,
            };
          }

          return {
            tagName: tag,
            tagStatus: oldPriority === newPriority ? 'Unchanged' : 'Reorder',
            priority: newPriority,
          };
        });

        // ตรวจสอบ tag ที่หายไปจากรายการใหม่ (ลบ)
        const removedTags = originalTags
          .filter(function (tag) {
            return !currentTags.includes(tag);
          })
          .map(function (tag) {
            return {
              tagName: tag,
              tagStatus: 'Remove',
              priority: 0,
            };
          });

        const allChanges = [...tagsWithStatus, ...removedTags];

        // ถือว่าเปลี่ยน ถ้าอย่างน้อย 1 tag ไม่ใช่ 'Unchanged' หรือมี tag ที่หายไป
        const isChanged = allChanges.some(function (t) {
          return t.tagStatus !== 'Unchanged';
        });

        if (isChanged) {
          return {
            ...currentItem,
            features: allChanges,
          };
        }

        return null;
      })
      .filter(Boolean);

    console.log('รายการที่เปลี่ยนแปลงทั้งหมด:', changedItems);
    message.success('บันทึกเรียบร้อยแล้ว');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดขณะบันทึก:', error);
    message.error('บันทึกล้มเหลว');
  }
};




  const handleNameChange = debounce((val) => {
    setSearch(prev => ({ ...prev, nameProduct: val }));
  }, 300);

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

  const handleFilterName = (confirm: FilterDropdownProps['confirm'],) => { confirm(); };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  type DataIndex = keyof ProductRow;
  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<ProductRow> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleFilterName(confirm)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleFilterName(confirm)}
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
      title: 'No.',
      dataIndex: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      width: 450,
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: function (text) {
        return (
          <span className="product-name-cell" style={{color: '#424242ff'}}> 
            {text}
          </span>
        );
      }
    },
    {
      title: 'ProductFeature',
      dataIndex: 'features',
      width: 400,
      sorter: (a, b) => b.features.length - a.features.length,
      render: (features: string[] | undefined, record) => (
        <FeatureToggle
          features={features || []}
          recordKey={record.key}
          onChange={(key, newFeatures) => {
            setData(prev => prev.map(item => (item.key === key ? { ...item, features: newFeatures } : item)));
          }}
        />
      ),
    },
    {
      title: 'DayUse',
      dataIndex: 'dayUse',
      width: 160,
      className: "custom-select-ant",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) =>
        renderSelectCell('' + value, record, dayUseOptions, 'dayUse', handleChange),
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      width: 150,
      className: "custom-select-ant",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) =>
        renderSelectCell('' + value, record, frequencyOptions, 'frequency', handleChange),
    },
    {
      title: 'ProductGroup',
      dataIndex: 'productGroup',
      width: 200,
      className: "custom-select-ant",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) =>
        renderSelectCell(value, record, productGroupOptions, 'productGroup', handleChange),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      width: 150,
      className: "custom-select-ant",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (value, record) =>
        renderSelectCell(value, record, timeOptions, 'time', handleChange),
    },
  ];

  return (
    <Layout style={{ padding: 10 }}>
      <Content>
        <Card style={{ height: 'calc(95vh - 75px)', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', }}>         
          <Row gutter={[8, 0]} style={{ marginBottom: 8 }}>
            <Col style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>ชื่อสินค้า</Text>
              <Input
                placeholder="ค้นหาชื่อสินค้า"
                defaultValue={search.nameProduct}
                onChange={(e) => handleNameChange(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Col>
            
            <Col style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>ประเภท</Text>
              <Select
                style={{ width: 120 }}
                value={search.categoryID}
                onChange={(val) => setSearch(prev => ({ ...prev, categoryID: val }))}
                allowClear
              >
                {categoriesItem.map((cat) => (
                  <Option key={cat.rptCategoryID} value={cat.rptCategoryID}>
                    {cat.rptCategoryName}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>ยี่ห้อ</Text>
              <Select
                mode="tags"
                style={{ width: 500 }}
                value={search.brandID}
                onChange={function (val) {
                  setSearch(function (prev) {
                    return { ...prev, brandID: val };
                  });
                }}
                placeholder="เลือกยี่ห้อ"
                virtual
              >
                {filteredBrands.map(function (brand) {
                  return (
                    <Option key={brand.BrandID} value={brand.BrandID}>
                      {brand.BrandName}
                    </Option>
                  );
                })}
              </Select>
            </Col>

            <Col style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>สถานะ Tag</Text>
              <Select
                style={{ width: 120 }}
                value={search.statusTag}
                defaultValue={'ALL'}
                placeholder="เลือก tag"
                onChange={function (val) {
                  setSearch(function (prev) {
                    return { ...prev, statusTag: val };
                  });
                }}
              >
                <Option value="ALL">ทั้งหมด</Option>
                <Option value="haveTag">มี Tag</Option>
                <Option value="noTag">ยังไม่มี Tag</Option>
              </Select>
            </Col>

            <Col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Button
                icon={<SearchOutlined />}
                onClick={() => {
                  setCurrentPage(1);
                  handleSearch(1);
                }}
                type="primary"
              >
                ค้นหา
              </Button>
            </Col>

            <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button 
                color="cyan" 
                variant="solid"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                บันทึก
              </Button>
            </Col>
          </Row>



          <Row gutter={[8, 0]}>
            <Table
              size="small"
              columns={columns}
              dataSource={data}
              rowKey="key"
              pagination={false}
              scroll={{ y: 120 * 5 }}
              style={{ marginBottom: 10 }}
              className="custom-small-table" 
            />
          </Row>
          <Pagination
            align="end"
            current={currentPage}
            pageSize={50}               // หน้า 1 มี 150 รายการ
            total={50 * 6}              // บังคับให้มี 6 หน้า (ไม่สนว่า backend มีกี่รายการ)
            showSizeChanger={false}
            onChange={(page) => {
              setCurrentPage(page);     // บันทึกว่าอยู่หน้าที่เท่าไหร่
              handleSearch(page);       // ไปค้นหาใหม่ โดยส่ง page ไป
            }}
          />
        </Card>
        {/* <Spin spinning={spinning} fullscreen /> */}
        {spinning && (
          <div>
            <Spin fullscreen />
          </div>
        )}
      </Content>
    </Layout>
  );
}
