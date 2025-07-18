import React, { useState } from 'react';
import { Select, Tag } from 'antd';
import type { SelectProps } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';

interface ItemInterface {
  id: string;
  name: string;
}

const rawOptions: SelectProps['options'] = [];
for (let i = 10; i < 36; i++) {
  const val = i.toString(36) + i;
  rawOptions.push({ value: val, label: val });
}

const App: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<ItemInterface[]>([]);

  const handleChange = (values: (string | number)[]) => {
    const newItems = values.map((val) => ({
      id: String(val),
      name: String(val),
    }));
    // อัพเดตลำดับตาม values ใหม่
    setSelectedItems((prev) => {
      const merged: ItemInterface[] = [];
      values.forEach((val) => {
        const exist = prev.find((x) => x.id === String(val));
        if (exist) merged.push(exist);
        else merged.push({ id: String(val), name: String(val) });
      });
      return merged;
    });
  };

  // ซ่อน tag ที่ default แสดงใน Select เพราะเราแสดง tag แยกด้านล่างแทน
  const tagRender = (props: CustomTagProps) => <></>;

  return (
    <div>
      <Select
        mode="tags" // ใช้ tags mode เพื่อให้พิมพ์เพิ่มได้
        style={{ width: 400 }}
        placeholder="Select or type and reorder"
        onChange={handleChange}
        value={selectedItems.map((item) => item.id)}
        options={rawOptions}
        tagRender={tagRender} // ซ่อน tag ปกติ
      />

      <ReactSortable<ItemInterface>
        list={selectedItems}
        setList={setSelectedItems}
        animation={150}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginTop: 8,
          border: '1px solid #d9d9d9',
          padding: 6,
          borderRadius: 6,
          minHeight: 40,
        }}
      >
        {selectedItems.map((item) => (
          <Tag
            key={item.id}
            closable
            onClose={() => {
              const next = selectedItems.filter((x) => x.id !== item.id);
              setSelectedItems(next);
            }}
            style={{
              cursor: 'move',
              userSelect: 'none',
              marginInlineEnd: 4,
            }}
          >
            {item.name}
          </Tag>
        ))}
      </ReactSortable>
    </div>
  );
};

export default App;
