import React, { useMemo, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { Tag } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { CheckOutlined } from '@ant-design/icons';

interface ItemInterface {
  id: string;
  value: string;
}
interface TagOption {
  label: string;
  value: string;
  color: string;
}

interface FeatureToggleProps {
  features: string[];
  recordKey: string;
  tagOptions: TagOption[];
  onChange: (key: string, value: string[]) => void;
  onAddNewTag?: (newTag: string) => Promise<boolean>;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ features, recordKey, tagOptions, onChange, onAddNewTag }) => {
 
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false); // ✅ เพิ่ม state สำหรับทิศ dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [dragList, setDragList] = useState<ItemInterface[]>(
    features.map((v) => ({ id: v, value: v }))
  );
  const [searchValue, setSearchValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDragList(features.map(v => ({ id: v, value: v })));

    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < dropdownHeight);
    }
  }, [features, open]);



  useEffect(() => {
    const updatePos = () => {
      if (containerRef.current && open) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = 260;
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < dropdownHeight);
        setDropdownPos({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);


  const filteredOptions = useMemo(() => {
    const safeSearch = (searchValue ?? '').trim().toLowerCase();

    const existingMatch = tagOptions.filter(opt =>
      (opt.label ?? '').toLowerCase().includes(safeSearch) ||
      (opt.value ?? '').toLowerCase().includes(safeSearch)
    );

    const exists = tagOptions.some(
      (opt) =>
        (opt.label ?? '').toLowerCase() === safeSearch ||
        (opt.value ?? '').toLowerCase() === safeSearch
    );

    if (safeSearch === '') return tagOptions;

    if (!exists) {
      return [
        {
          label: `➕ ${searchValue}`,
          value: searchValue,
          isNew: true,
        },
        ...existingMatch,
      ];
    }

    return existingMatch;
  }, [searchValue, tagOptions]);



  const onSort = (newList: ItemInterface[]) => {
    setDragList(newList);
    onChange(recordKey, newList.map((item) => item.value));
  };

  const toggleFeature = async (val: string, isNew?: boolean) => {
    // val ต้องเป็น value เสมอ
    if (isNew && onAddNewTag) {
      const success = await onAddNewTag(val);
      if (!success) return;
    }

    let newList = [];
    if (features.includes(val)) {
      newList = features.filter((v) => v !== val);
    } else {
      newList = [...features, val];
    }
    onChange(recordKey, newList);
  };

  const removeTag = (id: string) => {
    const newList = dragList.filter((item) => item.id !== id);
    setDragList(newList);
    onChange(recordKey, newList.map((i) => i.value));
  };

  // ปิด dropdown เมื่อคลิกนอก element
  useEffect(() => {
    let clickedInside = false;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      clickedInside =
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target) || false;
    };
    const handleClick = () => {
      if (!clickedInside) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleClick);
    };
  }, []);


  //เชื่อมกับparent(ไฟล์productAdminPaige)


  const getTagByValue = (value: string): TagOption | undefined =>
    tagOptions.find(tag => tag.value === value || tag.label === value);


  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* 🔻 Trigger */}
      <div
        className="custom-select-feature"
        onClick={() => {
          requestAnimationFrame(() => {
            setOpen((prev) => {
              const nextOpen = !prev;
              if (nextOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const dropdownHeight = 260;
                const spaceBelow = window.innerHeight - rect.bottom;
                setDropUp(spaceBelow < dropdownHeight);
                setDropdownPos({
                  top: rect.top + window.scrollY,
                  left: rect.left + window.scrollX,
                  width: rect.width,
                });
                setSearchValue('');
              }
              return nextOpen;
            });
          });
        }}
      >
        {features.length === 0 ? (
          <span style={{ color: '#aaa', marginLeft: 10 }}>
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
          </span>
        ) : (
          features.map((tag) => {
            const tagObj = getTagByValue(tag);
            return (
              <Tag key={tag} color={tagObj?.color || 'blue'} style={{ userSelect: 'none' }}>
                {tagObj?.label || tag}
              </Tag>
            );
          })
        )}
      </div>

      {/* ⬇️ Dropdown */}
      {open && 
        ReactDOM.createPortal(
        <div
          ref={dropdownRef} 
          style={{
            position: 'absolute',
            zIndex: 1000,
            top: dropUp ? dropdownPos.top - 260 - 4 : dropdownPos.top + 36 + 4,
            left: dropdownPos.left,
            width: dropdownPos.width,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 6,
            padding: 8,
            minHeight: 320,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* 🟥 ส่วนที่ 1: tag ที่เลือกไว้ → ลากเรียงได้ */}
          <div style={{ marginBottom: 8}}>
            <div style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>รายการที่เลือก</div>
            <ReactSortable
              list={dragList}
              setList={onSort}
              animation={150}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
            >
              {dragList.map((item) => {
                const tag = getTagByValue(item.value);
                return (
                  <Tag
                    key={item.id}
                    color={tag?.color || 'blue'}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      removeTag(item.id);
                    }}
                    style={{ cursor: 'move', userSelect: 'none' }}
                  >
                    {tag?.label || item.value}
                  </Tag>
                );
              })}
            </ReactSortable>
          </div>

          {/* 🔍 ส่วนที่ 2 ช่องค้นหา/เพิ่มใหม่ */}
          <div style={{ marginBottom: 8 }}>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="ค้นหาหรือเพิ่มคุณสมบัติ"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                borderBottom: '1px solid #ddd',
                padding: '4px 8px',
                fontSize: 13,
              }}
            />
          </div>

          {/* 🟦 ส่วนที่ 3: tag ที่ยังไม่ได้เลือก */}
          <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>ตัวเลือกทั้งหมด</div>
            {filteredOptions.map((opt) => {
              const value = opt.value;
              const label = opt.label;
              const isNew = 'isNew' in opt && opt.isNew;
              
              // ใช้ features.includes(label) เพราะ features เก็บ label
              const isSelected = features.includes(label);

              return (
                <div
                  key={value}
                  onMouseDown={async (e) => {
                    e.preventDefault();
                    // toggleFeature ต้องส่ง label แทน value เพราะ features เก็บ label
                    await toggleFeature(isNew ? value : label, isNew);
                    if (isNew) {
                      setSearchValue('');

                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    transition: 'background 0.2s',
                    backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                    minWidth: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isSelected ? '#e6f7ff' : 'transparent';
                  }}
                >
                  <Tag
                    color={tagOptions.find(o => o.value === value)?.color || 'blue'}
                    style={{ marginRight: 8, marginBottom: 0, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {label}
                  </Tag>
                  {isSelected && <CheckOutlined style={{ color: '#1890ff', marginLeft: 8, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FeatureToggle;
