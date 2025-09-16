import React, { useRef, useState, useEffect } from 'react';
import { debounce } from 'lodash';
import FeatureToggle from './FeatureToggle'; 
import { 
  Table, Select, Spin, Row, Layout, Card, 
  Col, Button, Input, Space, Modal,
  message, Typography,
  Tooltip,
} from 'antd';
const { Text } = Typography;
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, SaveOutlined, SettingOutlined, EditOutlined, DeleteOutlined  } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import * as productApi from './productApi';
import './style.css';
import { HexColorPicker } from "react-colorful";
import { createPortal } from 'react-dom';
// import Highlighter from 'react-highlight-words';
const { Content } = Layout;
const { Option } = Select;

interface ProductRow {
  key: string;
  categoryID: string;
  brand: string;
  rptclassID: string;
  rptclassName: string;
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

type OptionColor = {
  label: string;
  value: string;  
  color: string;
};


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
          root: 'custom-color-dropdown',
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

interface ProductAdminProps {
  setHasUnsavedChanges: (fn: () => boolean) => void;
}

export default function ProductAdminPage({ setHasUnsavedChanges }: ProductAdminProps) {
  const [spinning, setSpinning] = useState<boolean>(false); // loading 
  const [categoriesItem, setCategoriesItem] = useState<{rptCategoryID: string; rptCategoryName: string;}[]>([]);//เก็บประเภทcategory

  const [allBrands, setAllBrands] = useState<Brand[]>([]); //เก็บbrandทั้งหมด
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]); // เอาไว้ bind Select

  const [tagOptions, setTagOptions] = React.useState<OptionColor[]>([]); //เก็บ tag 
  const [classOptions, setClassOptions] = useState<{ label: string; value: string; rptCategoryID: string }[]>([]);

  const [dayUseOptions, setDayUseOptions] = useState<OptionColor[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<OptionColor[]>([]);
  const [timeOptions, setTimeOptions] = useState<OptionColor[]>([]);

  const [search, setSearch] = useState({
    nameProduct: '',
    categoryID: undefined as string | undefined,
    brandID: [] as string[],
    statusTag: undefined as string | undefined,
    classID: '',
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
      setSearch(prev => ({ ...prev, categoryID: '01' }));
      // แปลงชื่อ CategoryOrder → rptCategoryOrder (ถ้าต้องการ)
      const transformedBrands = data.brand.map(item => ({
        ...item,
        rptCategoryOrder: item.CategoryOrder,
      }));

      setAllBrands(transformedBrands);
      setFilteredBrands(transformedBrands); // เริ่มต้นแสดงแบรนด์ทั้งหมด
      const newSearch = {
        nameProduct: '',
        categoryID: '01',
        brandID: ['001'],
        statusTag: undefined,
        classID: '',
      };

      setSearch(newSearch);     // เก็บค่าไว้ใน state
      await fetchTags();
      await fetchClass();
      await fetchOptions();
      handleSearch(newSearch);
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

  const fetchOptions = async () => {
    const getOption = await productApi.GetOption() as {
      DayUse: { label: string; value: string; color: string }[];
      Frequency: { label: string; value: string; color: string }[];
      Time: { label: string; value: string; color: string }[];
    };
    setDayUseOptions(getOption.DayUse);
    setFrequencyOptions(getOption.Frequency);
    setTimeOptions(getOption.Time);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (search.categoryID === 'ALL') {
      // แสดงทุก brand และคง brandID เดิมไว้ เพราะ ALL ครอบคลุมทั้งหมด
      setFilteredBrands(allBrands);
    } else {
      const result = allBrands.filter(function (b) {
        return b.CategoryID === search.categoryID;
      });
      setFilteredBrands(result);
      const validBrandIDs = search.brandID.filter(function (id) {
        return result.some(function (b) {
          return b.BrandID === id;
        });
      });
      setSearch({ ...search, brandID: validBrandIDs });
    }
  }, [search.categoryID]);



  const handleSearch = async (params = search) => {
    try {
      setSpinning(true);
      const selectedCategoryID = params.categoryID || '01';
      const response: any = await productApi.GetProduct(
        params.nameProduct,
        selectedCategoryID,
        params.brandID,
        params.statusTag
      );

      const mappedData: ProductRow[] = response.map((item: any) => {
        const tags: string[] = item.TagDetail ? item.TagDetail.split(',').map((tag: string) => tag.trim()) : [];
        const priorities: number[] = item.TagPriority ? item.TagPriority.split(',').map((p: string) => parseInt(p.trim(), 10)) : [];

        const tagWithPriority = tags.map((tag, idx) => ({tag,
          priority: priorities[idx] || 999,
        }));

        tagWithPriority.sort((a, b) => a.priority - b.priority);

        return {
          key: item.ProductID,
          categoryID: item.CategoryID,
          brand: item.Brand,
          rptclassID: item.rptClassID,
          rptclassName: item.rptClassName,
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
    } finally {
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
        // =========================
        // ตรวจสอบการเปลี่ยน Class
        // =========================
        const originalClassID = originalItem.rptclassID || '';
        const currentClassID = currentItem.rptclassID || '';
        const isClassChanged = originalClassID !== currentClassID;

        const classData = {
          productID: currentItem.productID,
          status: isClassChanged ? 'Change' : 'Unchange',
          rptClassID: currentClassID,
          rptClassName: classOptions.find(c => c.value === currentClassID)?.label || ''
        };

        const isSomethingChanged =
          isTagChanged || isDayUseChanged || isFrequencyChanged || isTimeChanged || isClassChanged;

        return {
          ...currentItem,
          isSomethingChanged,
          features: allTagChanges,
          dayUse: [dayUse],
          frequency: [frequency],
          time: [time],
          classData: [classData],
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
          classData: group.flatMap((i) => i.classData),
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
      handleSearch(search)
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


  const fetchClass = async () => {
    try {
      const getClass = (await productApi.GetClass()) as {
        class: { rptClassID: string; rptClassName: string; rptCategoryID: string }[];
      };

      const options = getClass.class.map((cls) => ({
        label: cls.rptClassName,
        value: cls.rptClassID,
        rptCategoryID: cls.rptCategoryID,
      }));

      setClassOptions(options);
    } catch {
      // handle error if needed
    }
  };


  useEffect(() => {
    (window as any).__ALL_PRODUCTS__ = data; // data = state ที่เก็บ product ทั้งหมด
  }, [data]);

  const handleAddNewClass = async (newClass: string, categoryID?: string) => {
    const res = await productApi.AddClass(newClass, categoryID) as any;
    if (res.success) {
      await fetchClass();
      message.success("เพิ่ม Class " + res.rptClassName + " สำเร็จ");
      return true;
    }
    if (res.error === "duplicate") {
      await fetchClass();
      message.warning('Class "' + newClass + '" มีอยู่แล้ว');
      return false;
    }
    message.error(res.message || "เกิดข้อผิดพลาดในการเพิ่ม Class");
    return false;
  };

  const handleEditClass = async (rptClassID: string, rptClassName: string, rptCategoryID?: string) => {
    const res = await productApi.EditClass(rptClassID, rptClassName, rptCategoryID) as any;
    if (res.success) {
      await fetchClass();
      message.success("แก้ไข Class " + res.rptClassName + " สำเร็จ");
      return true;
    }
    if (res.error === "duplicate") {
      await fetchClass();
      message.warning('Class "' + rptClassName + '" มีอยู่แล้ว');
      return false;
    }
    message.error(res.message || "เกิดข้อผิดพลาดในการแก้ไข Class");
    return false;
  };


  const getAddClassOptionProps = () => {
    const dropdownContent = () => {
      const [value, setValue] = useState('');
      const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
      const [editItem, setEditItem] = useState<{ classID: string; name: string; categoryID: string } | null>(null);
      const [deleteItem, setDeleteItem] = useState<typeof classOptions[0] | null>(null);

      // sync default category จาก search.categoryID
      useEffect(() => {
        if (search.categoryID && search.categoryID !== "All") {
          setSelectedCategory(search.categoryID);
        } else {
          setSelectedCategory(undefined);
        }
      }, [search.categoryID]);

      const trimmed = value.trim();
      const exists = classOptions.some(
        (item) =>
          item.label.toLowerCase() === trimmed.toLowerCase() &&
          item.rptCategoryID === selectedCategory
      );

      const canAdd = trimmed !== '' && !exists && !!selectedCategory;

      const filteredOptions = classOptions
        .filter(item => item.rptCategoryID === selectedCategory)
        .filter(item => item.label.toLowerCase().includes(trimmed.toLowerCase()));

      const handleAdd = async () => {
        if (canAdd && selectedCategory) {
          const ok = await handleAddNewClass(trimmed, selectedCategory);
          if (ok) setValue('');
        }
      };

      // >>> เพิ่ม logic สำหรับ edit
      const canSaveEdit =
        editItem !== null &&
        editItem.name.trim() !== '' &&
        !classOptions.some(
          (item) =>
            item.label.toLowerCase() === editItem.name.trim().toLowerCase() &&
            item.rptCategoryID === editItem.categoryID &&
            item.value !== editItem.classID
        );

      const handleSaveEdit = async () => {
        if (editItem && canSaveEdit) {
          const ok = await handleEditClass(editItem.classID, editItem.name.trim(), editItem.categoryID);
          if (ok) {
            setEditItem(null);
            setValue('');
          }
        }
      };

      const handleConfirmDelete = async () => {
        if (!deleteItem) return false;

        console.log("Attempting to delete class:", deleteItem);

        try {
          const res: any = await productApi.DeleteClass(deleteItem.value);

          console.log("DeleteClass API response:", res);

          if (res.success) {
            // message.success(
            //   <span>
            //     <span style={{ color: 'red' }}>ลบ</span> รายการ {deleteItem.label} สำเร็จ
            //   </span>
            // );
            message.success("ลบรายการ " + deleteItem.label + " สำเร็จ");
          } else {
            // ตรวจสอบ error เฉพาะ
            if (res.error === 'inuse') {
              message.error(
                `ไม่สามารถลบ Class "${deleteItem.label}" ได้ เนื่องจากยังถูกใช้งานอยู่`
              );
            } else if (res.error === 'notfound') {
              message.error(
                `ไม่พบ Class "${deleteItem.label}" ในระบบ`
              );
            } else if (res.error === 'duplicate') {
              message.warning(
                'ลบรายการ "' + deleteItem.label + '" มีอยู่แล้ว'
              );
            } else {
              message.error(res.message || "เกิดข้อผิดพลาดในการลบ");
            }
          }

          // อัปเดตข้อมูลใหม่
          await fetchClass();
          setDeleteItem(null);

          return res.success;
        } catch (error) {
          console.error("DeleteClass unexpected error:", error);
          message.error("เกิดข้อผิดพลาดไม่คาดคิดในการลบ");
          return false;
        }
      };



      const filteredCategories = categoriesItem.filter(cat => cat.rptCategoryID !== 'ALL');

      return (
        <div style={{ padding: 8, width: 400 }}>
          {/* Label แถวบน */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, fontWeight: 600 }}>Class</div>
            <div style={{ width: 140, fontWeight: 600 }}>ประเภท</div>
            <div style={{ width: 60, fontWeight: 600 }}>Actions</div>
          </div>

          {/* Input + Select */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Input
              placeholder="Add rptClass"
              value={editItem ? editItem.name : value}
              onChange={(e) =>
                editItem
                  ? setEditItem({ ...editItem, name: e.target.value })
                  : setValue(e.target.value)
              }
              onPressEnter={editItem ? handleSaveEdit : handleAdd}
              style={{ flex: 1 }}
            />
            <Select
              style={{ width: 140 }}
              placeholder="กรุณาเลือก Category"
              value={editItem ? editItem.categoryID : selectedCategory}
              onChange={(val) =>
                editItem
                  ? setEditItem({ ...editItem, categoryID: val })
                  : setSelectedCategory(val)
              }
              options={filteredCategories.map((cat) => ({
                label: cat.rptCategoryName,
                value: cat.rptCategoryID,
              }))}
              getPopupContainer={() => document.body}
            />
          </div>

          {/* ปุ่ม Add / Save */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {editItem ? (
              <>
                
                <Button
                  type="primary"
                  block
                  disabled={!canSaveEdit} // <<< disable ปุ่มถ้า duplicate หรือชื่อว่าง
                  onClick={handleSaveEdit}
                >
                  บันทึกการแก้ไข
                </Button>

                <Button
                  block
                  onClick={() => {
                    setEditItem(null);
                    setValue('');
                  }}
                >
                  ยกเลิก
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                block
                disabled={!canAdd}
                onClick={handleAdd}
                style={{ marginBottom: 8 }}
              >
                Add
              </Button>
            )}
          </div>

          {/* รายการตัวเลือก */}
          <div style={{ maxHeight: 150, overflowY: 'auto' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderBottom: '1px solid #f0f0f0',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {item.label}
                  </div>
                  <div style={{ flexShrink: 0, width: 100, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {filteredCategories.find(c => c.rptCategoryID === item.rptCategoryID)?.rptCategoryName}
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', gap: 4 }}>
                    <Button
                      color="blue"
                      variant="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() =>
                        setEditItem({ classID: item.value, name: item.label, categoryID: item.rptCategoryID })
                      }
                    />
                    <Button
                      color="red"
                      variant="text"
                      type="primary"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteItem(item)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#999', padding: '4px 8px' }}>No matches</div>
            )}
          </div>

          {/* Modal Delete */}
          <Modal
            open={!!deleteItem}
            title={
              <>
                คุณต้องการลบ Class{" "}
                <span style={{ color: "red" }}>
                  "{deleteItem?.label}"
                </span>{" "}
                ใช่หรือไม่?
              </>
            }
            onOk={handleConfirmDelete}
            onCancel={() => setDeleteItem(null)}
            okText="ลบ"
            okType="danger"
            cancelText="ยกเลิก"
            zIndex={1500}
            getContainer={document.body}
          >
            การลบนี้ไม่สามารถย้อนกลับได้
          </Modal>

        </div>
      );
    };

    return { filterDropdown: dropdownContent, filterIcon: () => <SettingOutlined /> };
  };

  interface GetAddOptionPropsConfig {
    type: "dayuse" | "frequency" | "time";
    options: OptionColor[];
  }

  const getAddOptionProps = ({ type, options }: GetAddOptionPropsConfig) => {
    const dropdownContent = () => {
      const [value, setValue] = useState("");
      const [color, setColor] = useState<string>("#69c0ff");
      const [showPicker, setShowPicker] = useState(false);
      const [editItem, setEditItem] = useState<OptionColor & { originalValue?: string } | null>(null);
      const [deleteItem, setDeleteItem] = useState<OptionColor | null>(null);
      const [pickerPos, setPickerPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
      const colorBtnRef = useRef<HTMLDivElement | null>(null);

      // ค่า filter จาก input
      const filterText = editItem ? editItem.value : value;

      // กรอง options ตาม filterText
      const filteredOptions = options.filter((item) =>
        item.value.includes(filterText)
      );

      // label/unit ตาม type
      const unit = type === "dayuse" ? "Day" : type === "frequency" ? "wk" : "min";
      const labelName =
        type === "dayuse" ? "DayUse" : type === "frequency" ? "Frequency" : "Time";

      const trimmed = value.trim();
      const exists = options.some(
        (item) => item.value === trimmed && (!editItem || item.value !== editItem.value)
      );
      const canAdd = trimmed !== "" && /^\d+$/.test(trimmed) && !exists;

      // ---------------- Add ----------------
      const handleAdd = async () => {
        if (!canAdd) return;

        const newOption: OptionColor = {
          value: trimmed,
          label: `${trimmed} ${unit}`,
          color,
        };

        let res: any;
        if (type === "dayuse") {
          res = await productApi.AddDayUse(trimmed, newOption.label, newOption.color);
        } else if (type === "frequency") {
          res = await productApi.AddFrequency(trimmed, newOption.label, newOption.color);
        } if (type === "time") {
          res = await productApi.AddTime(trimmed, newOption.label, newOption.color);
        }

        if (res.success) {
          await fetchOptions(); // ✅ ฟังก์ชันกลาง ไม่ต้องส่งเข้า config
          message.success(`เพิ่ม ${labelName} ${newOption.label} สำเร็จ`);
          setValue("");
          return true;
        }
        if (res.error === "duplicate") {
          await fetchOptions();
          message.warning(`${labelName} "${newOption.label}" มีอยู่แล้ว`);
          return false;
        }
        message.error(res.message || `เกิดข้อผิดพลาดในการเพิ่ม ${labelName}`);
        return false;
      };

      // ---------------- Save Edit ----------------
      const canSaveEdit =
        editItem !== null &&
        editItem.value.trim() !== "" &&
        /^\d+$/.test(editItem.value) &&
        !options.some(
          (item) => item.value === editItem.value && item.value !== editItem.originalValue
        );

      const handleSaveEdit = async () => {
        if (!editItem) return;

        const oldValue = editItem.originalValue ?? editItem.value;
        const newValue = editItem.value;
        const newLabel = editItem.label;
        const newColor = editItem.color;

        let res: any;
        if (type === "dayuse") {
          res = await productApi.EditDayUse(oldValue, newValue, newLabel, newColor);
        } else if (type === "frequency") {
          res = await productApi.EditFrequency(oldValue, newValue, newLabel, newColor);
        } else if (type === "time") {
          res = await productApi.EditTime(oldValue, newValue, newLabel, newColor);
        }

        if (res.success) {
          await fetchOptions();
          message.success(`แก้ไข ${labelName} ${newLabel} สำเร็จ`);
          setEditItem(null);
          setValue("");
          setColor("#69c0ff");
          return true;
        }

        if (res.error === "duplicate") {
          await fetchOptions();
          message.warning(`${labelName} "${newValue}" มีอยู่แล้ว`);
          return false;
        }
        if (res.error === "notfound") {
          message.error(`ไม่พบ ${labelName} เก่าในระบบ`);
          return false;
        }
        message.error(res.message || `เกิดข้อผิดพลาดในการแก้ไข ${labelName}`);
        return false;
      };

      // ---------------- Delete ----------------
      const handleConfirmDelete = async () => {
        if (!deleteItem) return false;

        let res: any;
        if (type === "dayuse") {
          res = await productApi.DeleteDayUse(deleteItem.value);
        } else if (type === "frequency") {
          res = await productApi.DeleteFrequency(deleteItem.value);
        } else if (type === "time") {
          res = await productApi.DeleteTime(deleteItem.value);
        }

        if (res.success) {
          message.success(`ลบ ${labelName} "${deleteItem.label}" สำเร็จ`);
        } else {
          if (res.error === "notfound") {
            message.error(`ไม่พบ ${labelName} "${deleteItem.label}" ในระบบ`);
          } else if (res.error === "exception") {
            message.error(`เกิดข้อผิดพลาดในการลบ ${labelName} "${deleteItem.label}"`);
          } else {
            message.error(res.message || `ไม่สามารถลบ ${labelName} "${deleteItem.label}" ได้`);
          }
        }

        await fetchOptions();
        setDeleteItem(null);
        return res.success;
      };

      // ---------------- Picker ----------------
      const togglePicker = () => {
        if (!showPicker && colorBtnRef.current) {
          const rect = colorBtnRef.current.getBoundingClientRect();
          setPickerPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        }
        setShowPicker(!showPicker);
      };

      // ---------------- Render ----------------
      return (
        <div style={{ padding: 8, width: 225 }}>
          {/* Header */}
          <div style={{ display: "flex", gap: 8, marginBottom: 4, fontWeight: 600, alignItems: "center" }}>
            <div style={{ flex: 1 }}>{labelName}</div>
            <div style={{ width: 32 }}>Color</div>
          </div>

          {/* Input + Color */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <Input
              placeholder={labelName}
              maxLength={3}
              value={editItem ? editItem.value : value}
              onChange={(e) => {
                const newValue = e.target.value.replace(/\D/g, "");
                const newLabel =
                  newValue === "" || newValue === "0" ? "-" : newValue + " " + unit;

                if (editItem) {
                  setEditItem({ ...editItem, value: newValue, label: newLabel });
                } else {
                  setValue(newValue);
                }
              }}
              onPressEnter={editItem ? handleSaveEdit : handleAdd}
              style={{ flex: 1 }}
              addonAfter={unit}
            />

            {/* Color Picker Trigger */}
            <div style={{ width: 32, position: "relative" }}>
              <div
                ref={colorBtnRef}
                onClick={togglePicker}
                style={{
                  width: "100%",
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  background: editItem ? editItem.color : color,
                }}
              />
              {showPicker &&
                createPortal(
                  <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
                    <div onClick={() => setShowPicker(false)} style={{ position: "fixed", inset: 0 }} />
                    <div style={{ position: "absolute", top: pickerPos.top, left: pickerPos.left }}>
                      <HexColorPicker
                        color={editItem ? editItem.color : color}
                        onChange={(newColor) =>
                          editItem ? setEditItem({ ...editItem, color: newColor }) : setColor(newColor)
                        }
                      />
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>

          {/* ปุ่ม Add / Save */}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {editItem ? (
              <>
                <Button type="primary" block disabled={!canSaveEdit} onClick={handleSaveEdit}>
                  บันทึกการแก้ไข
                </Button>
                <Button
                  block
                  onClick={() => {
                    setEditItem(null);
                    setValue("");
                    setColor("#69c0ff");
                  }}
                >
                  ยกเลิก
                </Button>
              </>
            ) : (
              <Button type="primary" block disabled={!canAdd} onClick={handleAdd}>
                Add
              </Button>
            )}
          </div>

          {/* รายการ */}
          <div style={{ maxHeight: 150, overflowY: "auto" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderBottom: "1px solid #f0f0f0",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>{item.label}</div>
                  <div style={{ width: 35 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: item.color,
                        border: "1px solid #ccc",
                      }}
                    />
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", gap: 4 }}>
                    <Button
                      color="blue"
                      variant="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditItem({ ...item, originalValue: item.value })}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteItem(item)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "#999", padding: "4px 8px" }}>No options</div>
            )}
          </div>

          {/* Modal Delete */}
          <Modal
            open={!!deleteItem}     
            title={
              <>
                คุณต้องการลบ {labelName}{" "}
                <span style={{ color: "red" }}>
                  "{deleteItem?.label}"
                </span>{" "}
                ใช่หรือไม่?
              </>
            }
            onOk={handleConfirmDelete}
            onCancel={() => setDeleteItem(null)}
            okText="ลบ"
            okType="danger"
            cancelText="ยกเลิก"
            zIndex={1500}
            getContainer={document.body}
          >
            การลบนี้ไม่สามารถย้อนกลับได้
          </Modal>
        </div>
      );
    };

    return { filterDropdown: dropdownContent, filterIcon: () => <SettingOutlined /> };
  };

  const getAddTagColumnProps = (tagOptions: OptionColor[]) => {
    const dropdownContent = () => {
      const [value, setValue] = useState('');
      const [editItem, setEditItem] = useState<OptionColor & { originalValue?: string } | null>(null);
      const [deleteItem, setDeleteItem] = useState<OptionColor | null>(null);

      // ---------------- Add ----------------
      const handleAdd = async () => {
        const trimmed = value.trim();
        if (!trimmed) return;

        const exists = tagOptions.some(item => item.label === trimmed);
        if (exists) {
          message.warning(`Tag "${trimmed}" มีอยู่แล้ว`);
          return;
        }

        const res: any = await productApi.AddTag(trimmed);
        if (res.success) {
          await fetchTags();
          message.success(`เพิ่ม Tag "${res.tagName}" สำเร็จ`);
          setValue('');
        } else {
          message.error(res.message || 'เกิดข้อผิดพลาดในการเพิ่ม Tag');
        }
      };

      // ---------------- Save Edit ----------------
      const handleSaveEdit = async () => {
        if (!editItem) return;

        const newTag = editItem.label.trim();
        if (!newTag) return;

        // ตรวจสอบ duplicate โดยไม่เอา item ตัวเอง
        const exists = tagOptions.some(
          item => item.label === newTag && item.value !== editItem.value
        );
        if (exists) {
          message.warning(`Tag "${newTag}" มีอยู่แล้ว`);
          return;
        }

        const tagId = editItem.value; // id ของ tag ที่จะ update
        const res: any = await productApi.EditTag(tagId, newTag); // ส่ง id + label ใหม่

        if (res.success) {
          await fetchTags();
          message.success(`แก้ไข Tag "${newTag}" สำเร็จ`);
          setEditItem(null);
          setValue('');
        } else {
          message.error(res.message || 'เกิดข้อผิดพลาดในการแก้ไข Tag');
        }
      };


      // ---------------- Delete ----------------
      const handleConfirmDelete = async () => {
        if (!deleteItem) return;

        const res: any = await productApi.DeleteTag(deleteItem.value);
        if (res.success) {
          await fetchTags();
          message.success(`ลบ Tag "${deleteItem.label}" สำเร็จ`);
        } else {
          message.error(res.message || `เกิดข้อผิดพลาดในการลบ Tag "${deleteItem.label}"`);
        }

        setDeleteItem(null);
      };

      const canAdd = value.trim() !== '' && !tagOptions.some(item => item.label === value);
      const canSaveEdit =
        editItem !== null &&
        editItem.label.trim() !== '' &&
        !tagOptions.some(item => item.label === editItem.label && item.value !== editItem.originalValue);

      return (
        <div style={{ padding: 8, width: '100%', maxWidth: 300 }}>
          <Input
            placeholder="Add Tag"
            value={editItem ? editItem.label : value}
            onChange={(e) =>
              editItem
                ? setEditItem({ ...editItem, label: e.target.value })
                : setValue(e.target.value)
            }
            onPressEnter={editItem ? handleSaveEdit : handleAdd}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {editItem ? (
              <>
                <Button type="primary" block disabled={!canSaveEdit} onClick={handleSaveEdit}>
                  บันทึกการแก้ไข
                </Button>
                <Button block onClick={() => setEditItem(null)}>ยกเลิก</Button>
              </>
            ) : (
              <Button type="primary" block disabled={!canAdd} onClick={handleAdd}>
                Add
              </Button>
            )}
          </div>

          <div style={{ maxHeight: 150, overflowY: 'auto', marginTop: 8 }}>
            {tagOptions.length > 0 ? (
              tagOptions.map(item => (
                <div
                  key={item.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    wordBreak: 'break-word',
                    borderBottom: '1px solid #eee', // เส้นแบ่ง
                  }}
                >
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                    <Button
                      color="blue"
                      variant="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditItem({ ...item, originalValue: item.value })}
                    />
                    <Button
                      color="red"
                      variant="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteItem(item)}
                    />
                  </span>
                </div>

              ))
            ) : (
              <div style={{ color: "#999", padding: 4 }}>No options</div>
            )}
          </div>

          <Modal
            open={!!deleteItem}
            title={
              <>
                คุณต้องการลบ Tag{" "}
                <span style={{ color: "red" }}>
                  "{deleteItem?.label}"
                </span>{" "}
                ใช่หรือไม่?
              </>
            }
            onOk={handleConfirmDelete}
            onCancel={() => setDeleteItem(null)}
            okText="ลบ"
            okType="danger"
            cancelText="ยกเลิก"
          >
            การลบนี้ไม่สามารถย้อนกลับได้
          </Modal>
        </div>
      );
    };

    return { filterDropdown: dropdownContent, filterIcon: () => <SettingOutlined /> };
  };


  const columns: ColumnsType<ProductRow> = [
    {
      title: 'No.',
      dataIndex: 'index',
      width: 40,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      width: 420,
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
    // {
    //   title: 'Product',
    //   dataIndex: 'productID',
    //   width: 60,
    //   align: 'center',
    // },
    
    // {
    //   title: 'Main',
    //   dataIndex: 'mainGroupID',
    //   width: 60,
    //   align: 'center',
    // },
    // {
    //   title: 'Unique',
    //   dataIndex: 'productUniqueID',
    //   width: 60,
    //   align: 'center',
    // },
    {
      title: 'กลุ่ม',
      dataIndex: 'brand',
      width: 100,
      sorter: (a, b) => a.brand.localeCompare(b.brand),
    },
    {
      title: 'Class',
      dataIndex: 'class',
      width: 100,
      sorter: (a, b) => a.class.localeCompare(b.class),
    },
    {
      title: 'rptClass',
      dataIndex: 'rptclassID',
      className: "custom-select-ant",
      width: 100,
      sorter: (a, b) => {
        const cA = a.rptclassID || '';
        const cB = b.rptclassID || '';
        return cA.toString().localeCompare(cB.toString());
      },
      ...getAddClassOptionProps(),
      render: (value: string, record: ProductRow) => {
        // filter ตาม CategoryID ของแถวนั้น
        const filteredOptions = classOptions.filter(
          (opt) => opt.rptCategoryID === record.categoryID
        );

        return (
          <Select
            value={value || undefined}
            onChange={(selectedValue) => {
              setData((prev) =>
                prev.map((item) =>
                  item.productUniqueID === record.productUniqueID
                    ? { ...item, rptclassID: selectedValue }
                    : item
                )
              );
            }}
            style={{ width: '100%' }}
            popupMatchSelectWidth={false}
            options={filteredOptions.map((item) => ({
              label: <Tooltip title={item.label}>{item.label}</Tooltip>,
              value: item.value,
            }))}
          />
        );
      },
    },
    {
      title: 'Tag (Attribute)',
      dataIndex: 'features',
      width: 450,
      sorter: (a, b) => b.features.length - a.features.length,
      ...getAddTagColumnProps(tagOptions),
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

        />
      ),
    },
    {
      title: 'DayUse',
      dataIndex: 'dayUse',
      width: 95,
      className: "custom-select-ant",
      ...getAddOptionProps({
        type: "dayuse",
        options: dayUseOptions,
      }),
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
      title: 'Frequency(wk)',
      dataIndex: 'frequency',
      width: 135,
      className: "custom-select-ant",
      ...getAddOptionProps({
        type: "frequency",
        options: frequencyOptions,
      }),
      sorter: (a, b) => {
        const fA = a.frequency || '';
        const fB = b.frequency || '';
        return fA.toString().localeCompare(fB.toString());
      },
      render: (value, record) => {
        const disabled = !(
          (record.categoryID === '03' && record.mainGroupID === '18') ||
          record.categoryID === '04'
        ); // แก้ไขได้แค่ 03(mainGroupID=18),04

        return renderSelectCell('' + value, record, frequencyOptions, 'frequency', handleChange, disabled);
      }
    },
    {
      title: 'Time(minute)',
      dataIndex: 'time',
      width: 130,
      className: "custom-select-ant",
      ...getAddOptionProps({
        type: "time",
        options: timeOptions,
      }),
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

  const normalize = (val: any) => {
    if (Array.isArray(val)) {
      return JSON.stringify(val.map(v => typeof v === "object" ? normalizeObject(v) : v));
    }
    if (typeof val === "object" && val !== null) {
      return JSON.stringify(normalizeObject(val));
    }
    return String(val ?? ""); // บังคับเป็น string เสมอ
  };

  const normalizeObject = (obj: any) => {
    // sort key ให้เหมือนกันเสมอ
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalize(obj[key]);
        return acc;
      }, {} as any);
  };


  const hasUnsavedChanges = (): boolean => {
    return data.some((currentItem) => {
      const originalItem = originalData.find((o) => o.key === currentItem.key);
      if (!originalItem) return false;

      if (normalize(currentItem.features) !== normalize(originalItem.features)) return true;
      if (normalize(currentItem.dayUse) !== normalize(originalItem.dayUse)) return true;
      if (normalize(currentItem.frequency) !== normalize(originalItem.frequency)) return true;
      if (normalize(currentItem.time) !== normalize(originalItem.time)) return true;
      if (normalize(currentItem.rptclassID) !== normalize(originalItem.rptclassID)) return true;

      return false;
    });
  };


  // ส่งฟังก์ชันไป AppLayout
  useEffect(() => {
    console.log("Check unsaved:", hasUnsavedChanges());
    setHasUnsavedChanges(hasUnsavedChanges); // ส่งฟังก์ชัน
  }, [data, originalData]);


  const [tableHeight, setTableHeight] = useState(300);
  const [isZoomed, setIsZoomed] = useState(false);
  // คำนวณความสูงแบบ dynamic
  useEffect(function () {
    function calculateTableHeight() {
      const totalVH = window.innerHeight;
      const fixedTop = 250;
      const fixedBottom = 70;
      const ratio = window.devicePixelRatio || 1;

      let newHeight = totalVH - fixedTop - fixedBottom;

      // ✅ ถ้า scale 125% (หรือมากกว่า), เพิ่มความสูงให้อีกนิด
      if (ratio > 1.1) {
        newHeight += 100;
      }

      setTableHeight(newHeight > 100 ? newHeight : 100);
    }


    function detectZoomScale() {
      const ratio = window.devicePixelRatio || 1;
      setIsZoomed(ratio > 1.1); // ✅ ถ้า scale มากกว่า 110% ถือว่า zoomed
    }

    calculateTableHeight();
    detectZoomScale();

    window.addEventListener('resize', calculateTableHeight);
    window.addEventListener('resize', detectZoomScale);

    return () => {
      window.removeEventListener('resize', calculateTableHeight);
      window.removeEventListener('resize', detectZoomScale);
    };
  }, []);

  return (
    <Layout style={{ padding: 0}}>
      <Content>
        <Card
          style={{
            minHeight: 'calc(95vh - 75px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
          }}
        >
          <Row gutter={[8, 0]} style={{ marginBottom: 15 }} className={`custom-small-table ${isZoomed ? 'zoomable-table' : ''}`}>
            <Col style={{ display: 'flex', flexDirection: 'column' }}>
              <Text strong>ชื่อสินค้า</Text>
              <Input
                placeholder="ค้นหาชื่อสินค้า"
                defaultValue={search.nameProduct}
                onChange={(e) => handleNameChange(e.target.value)}
                onPressEnter={() => handleSearch(search)}
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
              <Text strong>กลุ่ม</Text>
              <Select
                mode="multiple"
                style={{ width: 250 }}
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
                <Option value="Yes">มี Tag</Option>
                <Option value="No">ยังไม่มี Tag</Option>
              </Select>
            </Col>

            <Col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Button
                icon={<SearchOutlined />}
                onClick={() => {
                  if (hasUnsavedChanges()) {
                    Modal.confirm({
                      title: 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก',
                      content: 'คุณต้องการค้นหาต่อหรือไม่? ข้อมูลที่แก้ไขจะหายไปถ้าไม่ได้บันทึก',
                      okText: 'ค้นหาต่อ (ทิ้งการแก้ไข)',
                      cancelText: 'ยกเลิก',
                      onOk: () => {
                        handleSearch(search);
                      },
                    });
                  } else {
                    handleSearch(search);
                  }
                }}
                type="primary"
              >
                ค้นหา
              </Button>
            </Col>

            <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button 
                type="primary"
                style={
                  hasUnsavedChanges()
                    ? { backgroundColor: '#07aa30ff', borderColor: '#52c41a' } 
                    : {}
                }
                disabled={!hasUnsavedChanges()}
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
              className={`custom-small-table ${isZoomed ? 'zoomable-table' : ''}`}
            />
          </Row>

        </Card>
        {spinning && (
          <div>
            <Spin fullscreen />
          </div>
        )}
      </Content>
    </Layout>
  );
}
