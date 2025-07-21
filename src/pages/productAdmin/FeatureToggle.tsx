import React from 'react';
import { Tag, Select, Row, Col, Tooltip } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { SyncOutlined, CheckOutlined } from '@ant-design/icons';

interface ItemInterface {
  id: string;
  value: string;
}

interface FeatureToggleProps {
  features: string[];
  recordKey: string;
  onChange: (key: string, value: string[]) => void;
}

const tagColors: Record<string, string> = {
  'ชุดเซลล์ผิวเก่า': 'blue',
  'คิวเท็นผิวกระชับ': 'magenta',
  'ลดรอยดำ': 'volcano',
  'ลดรอยฝ้ากระ': 'gray',
  'สีผิวสม่ำเสมอ': 'orange',
  'เคลือบผิว': 'lime',
  'ให้ความชุ่มชื้น': 'green',
  'กระชับ': 'pink',
  'ตึงเนื้อ': 'purple',
  'เปล่งเปลั่ง': 'cyan',
};
// magenta
// red
// volcano
// orange
// gold
// lime
// green
// cyan
// blue
// geekblue
// purple

const initialOptions = Object.keys(tagColors).map((key) => ({
  label: key,
  value: key,
}));

// ... [ไม่เปลี่ยนส่วน import และส่วนบนของไฟล์] ...

const FeatureToggle: React.FC<FeatureToggleProps> = ({ features, recordKey, onChange }) => {
  const [searchValue, setSearchValue] = React.useState('');
  const [options, setOptions] = React.useState(initialOptions);

  const toItemInterfaceArray = (arr: string[]): ItemInterface[] =>
    arr.map((v) => ({ id: v, value: v }));

  const fromItemInterfaceArray = (arr: ItemInterface[]): string[] =>
    arr.map((v) => v.value);

  const [isDragMode, setIsDragMode] = React.useState(false);
  const [dragList, setDragList] = React.useState<ItemInterface[]>(toItemInterfaceArray(features));

  React.useEffect(() => {
    setDragList(toItemInterfaceArray(features));
  }, [features]);

  const onSort = (newList: ItemInterface[]) => {
    setDragList(newList);
    onChange(recordKey, fromItemInterfaceArray(newList));
  };

  const onSelectChange = (val: string[]) => {
    const newTags = val.filter((v) => !options.some((opt) => opt.value === v));
    if (newTags.length > 0) {
      const added = newTags.map((v) => ({ label: v, value: v }));
      setOptions((prev) => [...prev, ...added]);
    }

    setDragList(toItemInterfaceArray(val));
    onChange(recordKey, val);
  };

  const onCloseTag = (id: string) => {
    const newList = dragList.filter((item) => item.id !== id);
    setDragList(newList);
    onChange(recordKey, fromItemInterfaceArray(newList));
  };

  const tagRender = (props: any) => {
    const { label, closable, onClose } = props;
    const color = tagColors[label] || 'default';
    return (
      <Tag color={color} closable={closable} onClose={onClose} style={{ userSelect: 'none' }}>
        {label}
      </Tag>
    );
  };

  const existingMatch = options.filter((opt) =>
    opt.value.toLowerCase().includes(searchValue.toLowerCase())
  );

  const searchValueExists = searchValue && !options.some((opt) => opt.value === searchValue);

  const filteredOptions = searchValueExists
    ? [
        {
          label: `➕ ${searchValue}`,
          value: searchValue,
        },
        ...existingMatch,
      ]
    : existingMatch;

  return (
    <div>
      <style>
        {`
          .custom-select .ant-select-selector {
            border: 1px solid transparent !important;
            box-shadow: none !important;
            transition: border-color 0.2s;
          }
          .custom-select:hover .ant-select-selector {
            border-color: #d9d9d9 !important;
            border-radius: 6px;
          }
        `}
      </style>

      <Row gutter={8} align="middle" wrap={false}>
        <Col style={{ flex: 1, minWidth: 0 }}>
          {isDragMode ? (
            <ReactSortable
              list={dragList}
              setList={onSort}
              animation={150}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
            >
              {dragList.map((item) => (
                <Tag
                  key={item.id}
                  color={tagColors[item.value]}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    onCloseTag(item.id);
                  }}
                  style={{ cursor: 'move', userSelect: 'none' }}
                >
                  {item.value}
                </Tag>
              ))}
            </ReactSortable>
          ) : (
            <Select
              mode="tags"
              size="small"
              style={{ width: '100%', border: 'none' }}
              value={features}
              options={filteredOptions}
              onChange={onSelectChange}
              tagRender={tagRender}
              className="custom-select"
              showSearch
              filterOption={false}
              onSearch={setSearchValue}
              onBlur={() => setSearchValue('')}
              popupRender={() => (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filteredOptions.map((opt) => {
                    const isSelected = features.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        style={{
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: isSelected ? '#e6f7ff' : undefined,
                          borderRadius: 4,
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const newVal = isSelected
                            ? features.filter((v) => v !== opt.value)
                            : [...features, opt.value];
                          onSelectChange(newVal);
                          setSearchValue('');
                        }}
                      >
                        <Tag color={tagColors[opt.value] || 'default'} style={{ marginRight: 8 }}>
                          {opt.label}
                        </Tag>
                        {isSelected && (
                          <CheckOutlined style={{ color: 'green', marginLeft: 'auto' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            />
          )}
        </Col>
        <Col style={{ width: 32, textAlign: 'center' }}>
          <Tooltip title={isDragMode ? 'เลิกลาก' : 'ลากเรียง'}>
            <SyncOutlined
              onClick={() => setIsDragMode(!isDragMode)}
              style={{
                fontSize: 18,
                cursor: 'pointer',
                color: isDragMode ? 'blue' : undefined,
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    </div>
  );
};

export default FeatureToggle;

