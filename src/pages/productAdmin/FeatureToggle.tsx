import React from 'react';
import { Tag } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { CheckOutlined } from '@ant-design/icons';

interface ItemInterface {
  id: string;
  value: string;
}

interface FeatureToggleProps {
  features: string[];
  recordKey: string;
  tagColors: Record<string, string>;
  onChange: (key: string, value: string[]) => void;
  onAddNewTag?: (newTag: string) => Promise<boolean>;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ features, recordKey, tagColors, onChange, onAddNewTag }) => {
  const [allOptions, setAllOptions] = React.useState<string[]>(Object.keys(tagColors));
  const [open, setOpen] = React.useState(false);
  const [dropUp, setDropUp] = React.useState(false); // ✅ เพิ่ม state สำหรับทิศ dropdown
  const [dragList, setDragList] = React.useState<ItemInterface[]>(
    features.map((v) => ({ id: v, value: v }))
  );
  const [searchValue, setSearchValue] = React.useState('');

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setDragList(features.map((v) => ({ id: v, value: v })));

      // ✅ ตรวจสอบพื้นที่ด้านล่าง ถ้าชนขอบ → เปิดขึ้นบน
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = 260; // ประมาณความสูงของ dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < dropdownHeight);
      }
    }
  }, [features, open]);

  const filteredOptions = React.useMemo(() => {
    const existingMatch = allOptions.filter((opt) =>
      opt.toLowerCase().includes(searchValue.toLowerCase())
    );
    const exists = allOptions.some(
      (opt) => opt.toLowerCase() === searchValue.trim().toLowerCase()
    );
    if (searchValue.trim() === '') return existingMatch;
    if (!exists) {
      return [
        {
          label: `➕ ${searchValue}`,
          value: searchValue,
          isNew: true,
        },
        ...existingMatch.map((v) => ({ label: v, value: v })),
      ];
    }
    return existingMatch.map((v) => ({ label: v, value: v }));
  }, [searchValue, allOptions]);

  const onSort = (newList: ItemInterface[]) => {
    setDragList(newList);
    onChange(recordKey, newList.map((item) => item.value));
  };

  const toggleFeature = async (val: string, isNew?: boolean) => {
  if (isNew && onAddNewTag) {
    const success = await onAddNewTag(val);
    if (!success) {
      // handle error หรือแจ้ง user ว่าเพิ่มไม่สำเร็จ
      return;
    }
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
  React.useEffect(() => {
    let clickedInside = false;
    const handleMouseDown = (event: MouseEvent) => {
      clickedInside = containerRef.current?.contains(event.target as Node) ?? false;
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
  React.useEffect(() => {
    setAllOptions(Object.keys(tagColors));
  }, [tagColors]);


  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* 🔻 Trigger */}
      <div
        className="custom-select-feature"
        onClick={() => {
          requestAnimationFrame(() => {
            setOpen((prev) => {
              const nextOpen = !prev;
              if (nextOpen) setSearchValue('');
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
          features.map((tag) => (
            <Tag key={tag} color={tagColors[tag] || 'blue'} style={{ userSelect: 'none' }}>
              {tag}
            </Tag>
          ))
        )}
      </div>

      {/* ⬇️ Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1000,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 6,
            padding: 8,
            width: 335,
            ...(dropUp ? { bottom: '100%', marginBottom: 4 } : { top: '100%', marginTop: 4 }),
          }}
        >
          {/* 🟥 ส่วนที่ 1: tag ที่เลือกไว้ → ลากเรียงได้ */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>รายการที่เลือก</div>
            <ReactSortable
              list={dragList}
              setList={onSort}
              animation={150}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
            >
              {dragList.map((item) => (
                <Tag
                  key={item.id}
                  color={tagColors[item.value] || 'blue'}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    removeTag(item.id);
                  }}
                  style={{ cursor: 'move', userSelect: 'none' }}
                >
                  {item.value}
                </Tag>
              ))}
            </ReactSortable>
          </div>

          {/* 🔍 ช่องค้นหา/เพิ่มใหม่ */}
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

          {/* 🟦 ส่วนที่ 2: tag ที่ยังไม่ได้เลือก */}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, marginBottom: 4, color: '#888' }}>ตัวเลือกทั้งหมด</div>
            {filteredOptions.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? opt : opt.label;
              const isNew = typeof opt !== 'string' && 'isNew' in opt && opt.isNew;
              const isSelected = features.includes(value);

              return (
                <div
                  key={value}
                  onMouseDown={async (e) => {
                    e.preventDefault();
                    await toggleFeature(value, isNew);
                    if (isNew) {
                      setSearchValue('');
                      setAllOptions((prev) => {
                        if (!prev.includes(value)) return [...prev, value];
                        return prev;
                      });
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
                    color={tagColors[value] || 'blue'}
                    style={{ marginRight: 8, marginBottom: 0, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {label}
                  </Tag>
                  {isSelected && <CheckOutlined style={{ color: '#1890ff', marginLeft: 8, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureToggle;
