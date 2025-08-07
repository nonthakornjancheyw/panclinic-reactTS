import React, { useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import FeatureToggle from './FeatureToggle'; 
import { 
  Table, Select, Spin, Row, Layout, Card, 
  Col, Button, Input, Space,
  message, Typography,
} from 'antd';
const { Text } = Typography;
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, SaveOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import * as productApi from './productApi';
import './style.css';

// import Highlighter from 'react-highlight-words';
const { Content } = Layout;
const { Option } = Select;

const dayUseOptions = [
  { label: '-', value: '0', color: '#d9d9d9' },
  { label: '7 Day', value: '7', color: '#37bdfcff' },
  { label: '14 Day', value: '14', color: '#0fbe98ff' },
  { label: '15 Day', value: '15', color: '#fd7536ff' },
  { label: '20 Day', value: '20', color: '#97ce00ff' },
  { label: '30 Day', value: '30', color: '#ff85c0' },
  { label: '40 Day', value: '40', color: '#ffd000e8' },
  { label: '45 Day', value: '45', color: '#c4115bff' },
  { label: '60 Day', value: '60', color: '#9254de' },
  { label: '90 Day', value: '90', color: '#de5494ff' },
  { label: '120 Day', value: '120', color: '#707be0ff' },
  { label: '180 Day', value: '180', color: '#4f00ceff' },
];



const frequencyOptions = [
  { label: '-', value: '0', color: '#d9d9d9' },
  { label: '1 Week', value: '1', color: '#02bcd4' },
  { label: '2 Week', value: '2', color: '#ff4081' },
  { label: '4 Week', value: '4', color: '#ea80fc' },
  { label: '5 Week', value: '5', color: '#7c4dff' },
  { label: '16 Week', value: '16', color: '#f900ea' },
  { label: '32 Week', value: '32', color: '#af7e2e' },
  { label: '52 Week', value: '52', color: '#9b59b6' },
];


const productGroupOptions = [
  { label: 'AHA', value: 'AHA', color: '#69c0ff' },
  { label: 'Sun Screen', value: 'Sun Screen', color: '#ff9c6e' },
  { label: 'Anti Aging', value: 'Anti Aging', color: '#b37feb' },
];

const timeOptions = [
  { label: '-', value: '0', color: '#d9d9d9' },
  { label: '5', value: '5', color: '#69c0ff' },
  { label: '10', value: '10', color: '#ff9c6e' },
  { label: '15', value: '15', color: '#b37feb' },
  { label: '20', value: '20', color: '#95de64' },
  { label: '25', value: '25', color: '#ffd666' },
  { label: '30', value: '30', color: '#5cdbd3' },
  { label: '35', value: '35', color: '#ffa39e' },
  { label: '40', value: '40', color: '#73d13d' },
  { label: '45', value: '45', color: '#ff85c0' },
  { label: '50', value: '50', color: '#1b4be9ff' },
  { label: '60', value: '60', color: '#ffc069' },
  { label: '70', value: '70', color: '#85a5ff' },
  { label: '75', value: '75', color: '#ff7875' },
  { label: '80', value: '80', color: '#36cfc9' },
  { label: '90', value: '90', color: '#ffc53d' },
  { label: '100', value: '100', color: '#69c0ff' },
  { label: '105', value: '105', color: '#ff9c6e' },
  { label: '110', value: '110', color: '#b37feb' },
  { label: '120', value: '120', color: '#0fbe98ff' },
  { label: '140', value: '140', color: '#ffd666' },
  { label: '150', value: '150', color: '#5cdbd3' },
  { label: '165', value: '165', color: '#ffa39e' },
  { label: '180', value: '180', color: '#73d13d' },
  { label: '240', value: '240', color: '#ff85c0' },
];



interface ProductRow {
  key: string;
  categoryID: string;
  brand: string;
  class: string;
  productID: string;
  productUniqueID: string;
  mainGroupID:string;
  name: string;
  features: string[];
  dayUse: string;
  frequency: string;
  productGroup: string; // เปลี่ยนจาก string → string[]
  time: string;
}

interface Brand {
  CategoryID: string;
  CategoryName: string;
  BrandID: string;
  BrandName: string;
  CategoryOrder: number;
}

interface TagOption {
  label: string;    // TagName
  value: string;    // TagID
  color: string;    // สี
}


type Option = { label: string; value: string; color?: string };
const renderSelectCell = <Field extends keyof ProductRow>(
  value: ProductRow[Field],
  record: ProductRow,
  options: Option[],
  field: Field,
  handleChange: (key: string, field: Field, value: ProductRow[Field]) => void,
  disabled = false
) => {
  const currentValue =
    Array.isArray(value) && value.length > 0 ? value[0] : (value as string) || '';

  const isEmpty = currentValue === '' || currentValue === '0';

  return (
    <Select
      size="small"
      style={{
        width: '100%',
        backgroundColor: disabled ? '#f0f0f0' : (options.find((o) => o.value === currentValue)?.color || '#fff'),
        color: disabled ? '#aaa' : '#fff',
        borderRadius: 4,
        textAlign: isEmpty ? 'left' : 'center',
      }}
      popupMatchSelectWidth={false}
      getPopupContainer={() => document.body}
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
            marginLeft: '8px',
          }}
        />
      }
      classNames={{
        popup: {
          root: 'custom-dayuse-dropdown',
        },
      }}
      options={
        (isEmpty ? options.filter((opt) => opt.value !== '0') : options).map((opt) => ({
          value: opt.value,
          label: (
            <div
              style={{
                backgroundColor: opt.color || '#fff',
                color: opt.value ? (disabled ? '#aaa' : '#fff') : '#8D8D8D',
                textAlign: 'center',
                borderRadius: 4,
                padding: '1px 6px',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {opt.label}
            </div>
          ),
        }))
      }
      onChange={(val) => {
        if (disabled) return;
        const newValue = (Array.isArray(value) ? [val] : val) as ProductRow[Field];
        handleChange(record.key, field, newValue);
      }}
      suffixIcon={null}
      disabled={disabled}
    />
  );
};


export default function ProductAdminTable() {
  const [spinning, setSpinning] = useState<boolean>(false); // loading 
  const [categoriesItem, setCategoriesItem] = useState<{rptCategoryID: string; rptCategoryName: string;}[]>([]);//เก็บประเภทcategory

  const [allBrands, setAllBrands] = useState<Brand[]>([]); //เก็บbrandทั้งหมด
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]); // เอาไว้ bind Select

  // const [tagColors, setTagColors] = React.useState<Record<string, string>>({});
  const [tagOptions, setTagOptions] = React.useState<TagOption[]>([]); //เก็บ tag 

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
        tag: { TagID: string; TagName: string }[];
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

      await fetchTags();
      handleSearch();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTags = async () => {
    const getTag = await productApi.GetTag() as {
      tag: { TagID: string; TagName: string }[];
    };

    const predefinedColors = [
      'blue', 'magenta', 'volcano', 'gray', 'orange', 'lime',
      'green', 'pink', 'purple', 'cyan', '#108ee9', '#f50',
      '#ff7dd4ff', '#009751ff'
    ];

    const options = getTag.tag.map((tag, index) => ({
      label: tag.TagName,
      value: tag.TagID,
      color: predefinedColors[index % predefinedColors.length],
    }));

    setTagOptions(options);
  };

  const handleAddNewTag = async (newTag: string) => {
    const res = await productApi.AddTag(newTag);
    if (res.success) {
      await fetchTags();
      return true;
    }
    return false;
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


  const handleSearch = async () => {
    try {
      setSpinning(true)
      const selectedCategoryID = search.categoryID || 'ALL';
      const response: any = await productApi.GetProduct( search.nameProduct, selectedCategoryID, search.brandID, search.statusTag);
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
          categoryID: item.CategoryID,
          brand: item.Brand,
          class: item.Class,
          mainGroupID: item.MainGroupID,
          productID: item.ProductID,
          productUniqueID: item.ProductUniqueID,
          name: item.Name,
          features: tagWithPriority.map((t) => t.tag),
          dayUse: item.DayUse,
          frequency: item.FrequencyWk,
          productGroup: [],
          time: item.ServeTime,
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
      setSpinning(true);

      const diffList = data.map((currentItem) => {
        const originalItem = originalData.find((o) => o.key === currentItem.key);
        if (!originalItem) return null;

        const originalTags = originalItem.features || [];
        const currentTags = currentItem.features || [];
        const originalSet = new Set(originalTags);

        const tagsWithStatus = currentTags.map((tagName: string, index: number) => {
          const newPriority = index + 1;
          const oldIndex = originalTags.indexOf(tagName);
          const oldPriority = oldIndex + 1;

          const tagOption = tagOptions.find((t) => t.label === tagName);
          const tagID = tagOption ? tagOption.value : '';

          if (!originalSet.has(tagName)) {
            return { tagID, tagName, tagStatus: 'Add', priority: newPriority };
          }

          return {
            tagID,
            tagName,
            tagStatus: oldPriority === newPriority ? 'Unchanged' : 'Reorder',
            priority: newPriority,
          };
        });

        const deleteTags = originalTags
          .filter((tagName: string) => !currentTags.includes(tagName))
          .map((tagName: string) => {
            const tagOption = tagOptions.find((t) => t.label === tagName);
            const tagID = tagOption ? tagOption.value : '';
            return { tagID, tagName, tagStatus: 'Delete', priority: 0 };
          });

        const allTagChanges = [...tagsWithStatus, ...deleteTags];
        const isTagChanged = allTagChanges.some((t) => t.tagStatus !== 'Unchanged');

        const originalDayUse = parseInt(originalItem.dayUse || '0', 10);
        const currentDayUse = parseInt(currentItem.dayUse || '0', 10);
        const isDayUseChanged = originalDayUse !== currentDayUse;
        const dayUse = {
          productID: currentItem.productID,
          status: isDayUseChanged ? 'Change' : 'Unchange',
          value: currentDayUse,
        };

        const originalFrequency = parseInt(originalItem.frequency || '0', 10);
        const currentFrequency = parseInt(currentItem.frequency || '0', 10);
        const isFrequencyChanged = originalFrequency !== currentFrequency;
        const frequency = {
          productID: currentItem.productID,
          mainGroupID: currentItem.mainGroupID, 
          status: isFrequencyChanged ? 'Change' : 'Unchange',
          value: currentFrequency,
        };

        const originalTime = parseInt(originalItem.time || '0', 10);
        const currentTime = parseInt(currentItem.time || '0', 10);
        const isTimeChanged = originalTime !== currentTime;
        const time = {
          productID: currentItem.productID,
          mainGroupID: currentItem.mainGroupID,
          status: isTimeChanged ? 'Change' : 'Unchange',
          value: currentTime,
        };

        const isSomethingChanged =
          isTagChanged || isDayUseChanged || isFrequencyChanged || isTimeChanged;

        return {
          ...currentItem,
          isSomethingChanged,
          features: allTagChanges,
          dayUse: [dayUse],
          frequency: [frequency],
          time: [time],
        };
      }).filter((item): item is Exclude<typeof item, null> => item !== null);

      const groupedByUniqueID: Record<string, typeof diffList> = {};
      diffList.forEach((item) => {
        const uid = item.productUniqueID;
        if (!groupedByUniqueID[uid]) groupedByUniqueID[uid] = [];
        groupedByUniqueID[uid].push(item);
      });

      const finalChangedItems = Object.values(groupedByUniqueID).flatMap((group) => {
        const isGroupChanged = group.some((i) => i.isSomethingChanged);
        if (!isGroupChanged) return [];

        const base = {
          productUniqueID: group[0].productUniqueID,
          productID: group.map((i) => i.productID),
          dayUse: group.flatMap((i) => i.dayUse),
          frequency: group.flatMap((i) => i.frequency),
          time: group.flatMap((i) => i.time),
          features: group.flatMap((i) => i.features),
        };

        return [base];
      });

      if (finalChangedItems.length === 0) {
        setSpinning(false);
        return;
      }

      console.log('รายการที่เปลี่ยนแปลงทั้งหมด:', finalChangedItems);
      // setSpinning(false);
      const saveResult = await productApi.SaveProduct(finalChangedItems);
      if (!saveResult.success) {
        message.error('บันทึกล้มเหลวจากเซิร์ฟเวอร์');
        setSpinning(false);
        return;
      }
      message.success('บันทึกเรียบร้อยแล้ว');
      handleSearch();
    } catch (error) {
      console.error('เกิดข้อผิดพลาดขณะบันทึก:', error);
      message.error('บันทึกล้มเหลว');
    }
  };
  




  const handleNameChange = debounce((val) => {
    setSearch(prev => ({ ...prev, nameProduct: val }));
  }, 300);

  // อัปเดตข้อมูล
  const handleChange = <Field extends keyof ProductRow>(
    key: string,
    field: Field,
    value: ProductRow[Field]
  ) => {
    setData((prev) => {
      const target = prev.find((item) => item.key === key);
      if (!target) return prev;

      const shouldSyncGroup =
        target.categoryID === '03' &&
        target.mainGroupID === '18' &&
        (field === 'frequency' || field === 'time');

      return prev.map((item) => {
        const isSameGroup =
          item.productUniqueID === target.productUniqueID &&
          item.categoryID === '03' &&
          item.mainGroupID === '18';

        if (shouldSyncGroup && isSameGroup) {
          return {
            ...item,
            [field]: value,
          };
        }

        return item.key === key
          ? { ...item, [field]: value }
          : item;
      });
    });
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
      width: 50,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      width: 485,
      fixed: 'left',
      ...getColumnSearchProps('name'),
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: function (text) {
        return (
          <span className="product-name-cell"> 
            {text}
          </span>
        );
      }
    },
    {
      title: 'Product',
      dataIndex: 'productID',
      width: 60,
      align: 'center',
    },
    
    {
      title: 'Main',
      dataIndex: 'mainGroupID',
      width: 60,
      align: 'center',
    },
    {
      title: 'Unique',
      dataIndex: 'productUniqueID',
      width: 60,
      align: 'center',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      width: 100,
      sorter: (a, b) => a.class.localeCompare(b.class),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      width: 100,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'ProductFeature',
      dataIndex: 'features',
      width: 450,
      sorter: (a, b) => b.features.length - a.features.length,
      render: (features: string[] | undefined, record) => (
        <FeatureToggle
          features={features || []}
          recordKey={record.key}
          tagOptions={tagOptions}
          onChange={(key, newFeatures) => {
            setData(prev => {
              const targetItem = prev.find(item => item.key === key);
              if (!targetItem) return prev;

              const targetProductID = targetItem.productUniqueID;

              // ✅ clone ให้แน่ใจว่าไม่มีการ shared reference
              return prev.map(item => {
                if (item.productUniqueID === targetProductID) {
                  return {
                    ...item,
                    features: [...newFeatures], // ✅ clone array
                  };
                }
                return item;
              });
            });
          }}
        onAddNewTag={handleAddNewTag}
        />
      ),
    },
    {
      title: 'DayUse',
      dataIndex: 'dayUse',
      width: 80,
      className: "custom-select-ant",
      sorter: (a, b) => {
        const aVal = parseInt(a.dayUse || '0', 10);
        const bVal = parseInt(b.dayUse || '0', 10);
        return aVal - bVal;
      },
      render: (value, record) => {
        const disabled = !(record.categoryID === '01' || record.categoryID === '02'); // แก้ไขได้แค่ 01,02
        return renderSelectCell('' + value, record, dayUseOptions, 'dayUse', handleChange, disabled);
      }
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      width: 80,
      className: "custom-select-ant",
      sorter: (a, b) => a.frequency.localeCompare(b.frequency),
      render: (value, record) => {
        const disabled = !(
          (record.categoryID === '03' && record.mainGroupID === '18') ||
          record.categoryID === '04'
        ); // แก้ไขได้แค่ 03(mainGroupID=18),04

        return renderSelectCell('' + value, record, frequencyOptions, 'frequency', handleChange, disabled);
      }
    },
    {
      title: 'ProductGroup',
      dataIndex: 'productGroup',
      width: 120,
      className: "custom-select-ant",
      sorter: (a, b) => a.productGroup.localeCompare(b.productGroup),
      render: (value, record) =>
        renderSelectCell('' + value, record, productGroupOptions, 'productGroup', handleChange),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      width: 80,
      className: "custom-select-ant",
      sorter: (a, b) => {
        const aVal = parseInt(a.time || '0', 10);
        const bVal = parseInt(b.time || '0', 10);
        return aVal - bVal;
      },
      render: (value, record) => {
        const disabled = !(record.categoryID === '03' || record.categoryID === '04'); // แก้ไขได้แค่ 03,04
        return renderSelectCell('' + value, record, timeOptions, 'time', handleChange, disabled);
      }
    },
  ];
  const [tableHeight, setTableHeight] = useState(300);

  // คำนวณความสูงแบบ dynamic
  useEffect(function () {
    function calculateTableHeight() {
      const totalVH = window.innerHeight; // ความสูงจริงของ viewport (DPI แล้ว)
      const fixedTop = 250; // ความสูงของส่วนบน ๆ เช่น filter, ปุ่ม, margin ฯลฯ
      const fixedBottom = 70; // เผื่อ Pagination + padding
      const newHeight = totalVH - fixedTop - fixedBottom;

      setTableHeight(newHeight > 100 ? newHeight : 100); // กันตารางเล็กเกิน
    }

    calculateTableHeight();
    window.addEventListener('resize', calculateTableHeight);
    return () => window.removeEventListener('resize', calculateTableHeight);
  }, []);

  return (
    <Layout style={{ padding: 10}}>
      <Content>
        <Card style={{ height: 'calc(95vh - 75px)', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', }}>         
          <Row gutter={[8, 0]} style={{ marginBottom: 15 }}>
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
                mode="multiple"
                style={{ width: 500 }}
                value={search.brandID}
                onChange={function (val) {
                  setSearch(function (prev) {
                    return { ...prev, brandID: val };
                  });
                }}
                placeholder="เลือกยี่ห้อ"
                virtual
                showSearch
                filterOption={(input, option) => {
                  const text = typeof option?.children === 'string'
                    ? option.children
                    : '';

                  return text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }}

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
                  handleSearch();
                }}
                type="primary"
              >
                ค้นหา
              </Button>
            </Col>

            <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button 
                type="primary"
                style={{ backgroundColor: '#07aa30ff', borderColor: '#52c41a' }}
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
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`,
              }}

              scroll={{ y: tableHeight }}
              style={{ marginBottom: 10 }}
              className="custom-small-table" 
            />
          </Row>
          {/* <Pagination
            align="end"
            current={currentPage}
            pageSize={50}               // หน้า 1 มี 150 รายการ
            total={50 * 6}              // บังคับให้มี 6 หน้า (ไม่สนว่า backend มีกี่รายการ)
            showSizeChanger={false}
            onChange={(page) => {
              setCurrentPage(page);     // บันทึกว่าอยู่หน้าที่เท่าไหร่
              handleSearch(page);       // ไปค้นหาใหม่ โดยส่ง page ไป
            }}
          /> */}
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
