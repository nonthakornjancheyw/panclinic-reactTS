import React from 'react';
import { Tag, Select, Row, Col } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { SyncOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

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

const featureOptions = Object.keys(tagColors).map((key) => ({
  label: key,  // เปลี่ยนกลับเป็น string ธรรมดา
  value: key,
}));



const FeatureToggle: React.FC<FeatureToggleProps> = ({ features, recordKey, onChange }) => {
  // แปลง string[] เป็น ItemInterface[]
  const toItemInterfaceArray = (arr: string[]): ItemInterface[] =>
    arr.map((v) => ({ id: v, value: v }));

  // แปลงกลับ
  const fromItemInterfaceArray = (arr: ItemInterface[]): string[] =>
    arr.map((v) => v.value);

  // state สำหรับโหมดลาก
  const [isDragMode, setIsDragMode] = React.useState(false);

  // รายการลาก
  const [dragList, setDragList] = React.useState<ItemInterface[]>(toItemInterfaceArray(features));

  // อัพเดต dragList เมื่อ props.features เปลี่ยน
  React.useEffect(() => {
    setDragList(toItemInterfaceArray(features));
  }, [features]);

  // handler reorder
  const onSort = (newList: ItemInterface[]) => {
    setDragList(newList);
    onChange(recordKey, fromItemInterfaceArray(newList));
  };

  // handler select เปลี่ยนค่า
  const onSelectChange = (val: string[]) => {
    setDragList(toItemInterfaceArray(val));
    onChange(recordKey, val);
  };

  // handler ปิด tag ใน drag mode
  const onCloseTag = (id: string) => {
    const newList = dragList.filter((item) => item.id !== id);
    setDragList(newList);
    onChange(recordKey, fromItemInterfaceArray(newList));
  };

  // custom tag render สำหรับ Select
  const tagRender = (props: any) => {
  const { label, closable, onClose } = props;
  const color = tagColors[label] || 'default';
  return (
    <Tag color={color} closable={closable} onClose={onClose} style={{ userSelect: 'none' }}>
      {label}
    </Tag>
  );
};


  // Return JSX จริงๆ
  return (
    <div>
        <style>
        {`
            .custom-select .ant-select-selector {
            border: 1px solid transparent !important; /* แทน none ด้วย transparent */
            box-shadow: none !important;
            transition: border-color 0.2s;
            }

            .custom-select:hover .ant-select-selector {
            border-color: #d9d9d9 !important; /* เปลี่ยนจากโปร่งใสเป็นสีเทาอ่อน */
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
                    style={{ width: '100%',border: 'none' }}
                    value={features}
                    options={featureOptions}
                    onChange={onSelectChange}
                    tagRender={tagRender}
                    className="custom-select"
                    popupRender={() => (
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {featureOptions.map(opt => (
                            <div
                                key={opt.value}
                                style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                }}
                                onMouseDown={(e) => {
                                e.preventDefault(); // ป้องกัน blur
                                const alreadySelected = features.includes(opt.value);
                                const newVal = alreadySelected
                                    ? features.filter(v => v !== opt.value)
                                    : [...features, opt.value];
                                onSelectChange(newVal);
                                }}
                            >
                                <Tag color={tagColors[opt.value]} style={{ marginRight: 8 }}>
                                {opt.value}
                                </Tag>
                            </div>
                            ))}
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
