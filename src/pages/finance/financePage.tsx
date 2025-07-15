import React, { useState, useMemo } from 'react';
import { 
  Menu, Checkbox, Button, Table, InputNumber, Select, 
  Card, Layout,ConfigProvider, Row, Col, Input, Typography, 
  Divider, Radio
} from 'antd';
const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table/interface';
import { PlusOutlined, MinusOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { renderCouponOptions, renderActivityOptions } from '../finance/selectOptions';
import { v4 as uuidv4 } from 'uuid';
import { useStyle } from './styles.ts';
import './scss.css';

const { Content } = Layout;
const { Option } = Select;

interface Product {
  key: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  payment?: string;
  couponType?: string;
  activity?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  discount?: number;
}

const productItemsMap: Record<string, ProductItem[]> = {
  'Medical-Antihistamine': [
    { id: '124217', name: 'Zyrtec 10 MG.', price: 25, discount: 0 },
  ],
  'Medical-Acne/Antibiotic': [
    { id: '124218', name: 'CS', price: 2.5, discount: 0 },
    { id: '124226', name: 'DC 500 mg.(cap)', price: 6, discount: 0 },
    { id: '124206', name: 'ERY 250 MG.', price: 7, discount: 0 },
    { id: '124208', name: 'MX 500 MG.', price: 9, discount: 0 },
    { id: '124201', name: 'Roaccutane 10 MG.', price: 50, discount: 0 },
    { id: '124202', name: 'Roaccutane 20 MG.', price: 90, discount: 0 },
    { id: '124204', name: 'TC 250 MG.', price: 6, discount: 0 },
  ],
  'Medical-Blemish': [
    { id: '124203', name: 'Lysene 250 MG.', price: 160 },
  ],
  'Supplement-Vitamins': [
    { id: 'vit1', name: 'Vitamin C', price: 90, discount: 5 },
    { id: 'vit2', name: 'Vitamin D', price: 100 },
  ],
  'Topical-Wilma-Cleanser/Toner': [
    { id: 'clean1', name: 'Cleanser 1', price: 220 },
    { id: 'clean2', name: 'Toner 2', price: 180, discount: 15 },
  ],
  'Topical-Wilma-Skin Care': [
    { id: 'skin1', name: 'Skin Care 1', price: 250 },
  ],
  'Topical-Wilma-Other': [
    { id: 'other1', name: 'Other Product 1', price: 110 },
  ],
};

export default function Home() {
  const { styles } = useStyle();
  const [selectedMenuKey, setSelectedMenuKey] = useState<string | null>(null);
  const [selectedAddKeys, setSelectedAddKeys] = useState<string[]>([]);
  const [selectedDeleteKeys, setSelectedDeleteKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState(false);//พับเปิดปิดcardข้อมูลลูกค้า

  const itemsToShow: ProductItem[] = useMemo(() => {
    if (!selectedMenuKey) return [];
    if (productItemsMap[selectedMenuKey]) return productItemsMap[selectedMenuKey];
    const childrenKeys = Object.keys(productItemsMap).filter(key => key.startsWith(selectedMenuKey + '-'));
    return childrenKeys.flatMap(key => productItemsMap[key]);
  }, [selectedMenuKey]);

  const calculateAmount = (price: number, quantity: number, discount: number) => {
    return price * quantity * (1 - discount / 100);
  };

  const handleAddSelected = () => {
    const newProducts: Product[] = itemsToShow
      .filter(item => selectedAddKeys.includes(item.id))
      .map(item => {
        const discount = item.discount ?? 0;
        const quantity = 1;
        const amount = calculateAmount(item.price, quantity, discount);
        return {
          key: uuidv4(),
          name: item.name,
          quantity,
          price: item.price,
          discount,
          amount,
          payment: 'M',
          couponType: '',
          activity: '',
        };
      });
    setTableData(prev => [...prev, ...newProducts]);
    setSelectedAddKeys([]);
  };

  const menuItems = [
    {
      key: 'Medical',
      // icon: <MailOutlined />,
      label: 'Medical',
      children: [
        {
          key: 'Medical-Antihistamine',
          label: 'Antihistamine',
        },
        {
          key: 'Medical-Acne/Antibiotic',
          label: 'Acne/Antibiotic',
        },
        {
          key: 'Medical-Blemish',
          label: 'Blemish',
        },
      ],
    },
    {
      key: 'Supplement',
      label: 'Supplement',
      children: [
        {
          key: 'Supplement-Vitamins',
          label: 'Vitamins',
        },
      ],
    },
    {
      key: 'Topical',
      label: 'Topical',
      children: [
        {
          key: 'Topical-Wilma',
          label: (
            <span
              onClick={() => {
                setSelectedMenuKey('Topical-Wilma');
                setSelectedAddKeys([]);
              }}
            >
              Wilma
            </span>
          ),
          children: [
            {
              key: 'Topical-Wilma-Cleanser/Toner',
              label: 'Cleanser/Toner',
            },
            {
              key: 'Topical-Wilma-Skin Care',
              label: 'Skin Care',
            },
            {
              key: 'Topical-Wilma-Other',
              label: 'Other',
            },
          ],
        },
      ],
    },
    {
      key: 'Procedure',
      label: 'Procedure',
    },
    {
      key: 'Service',
      label: 'Service',
    },
    {
      key: 'Treatment',
      label: 'Treatment',
    },
    { key: 'คูปองชุดเล็ก', label: 'คูปองชุดเล็ก' },
    { key: 'คูปองชุดใหญ่', label: 'คูปองชุดใหญ่' },
    { key: 'คูปองฟรี', label: 'คูปองฟรี' },
    { key: 'คูปอง 1 ครั้ง', label: 'คูปอง 1 ครั้ง' },
    { key: 'คูปองส่วนลด', label: 'คูปองส่วนลด' },
    { key: 'วัสดุบริการ', label: 'วัสดุบริการ' },
    { key: 'Make up', label: 'Make up' },
    { key: 'ส่งเสริมการขาย', label: 'ส่งเสริมการขาย' },
    { key: 'Other', label: 'Other' },
    { key: 'Hya-Pluryal', label: 'Hya-Pluryal' },
    { key: 'Rejuran', label: 'Rejuran' },
    { key: 'MM', label: 'MM' },
    { key: 'MS', label: 'MS' },
    { key: 'EPN-TC-S,HMPF', label: 'EPN-TC-S,HMPF' },
    { key: 'Pro-DooDee', label: 'Pro-DooDee' },
    { key: 'Advanced Lift', label: 'Advanced Lift' },
    { key: 'Pro-Gowabi', label: 'Pro-Gowabi' },
    { key: 'VIP-Destination', label: 'VIP-Destination' },
    { key: 'BIM Mask-ปกติ', label: 'BIM Mask-ปกติ' },
    { key: 'Pro-Age Reverse', label: 'Pro-Age Reverse' },
    { key: 'Pro-MidYear', label: 'Pro-MidYear' },
    { key: 'Pro-ตัดแต้ม', label: 'Pro-ตัดแต้ม' },
    
  ];

  const totalCash = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.amount, 0);
  }, [tableData]);

  const columns: ColumnsType<Product> = [
    { 
      title: <div style={{ textAlign: 'center' }}>ชื่อสินค้า</div>, 
      dataIndex: 'name', 
      width: 200 
    },
    {
      title: <div style={{ textAlign: 'center' }}>จำนวน</div>,
      dataIndex: 'quantity',
      width: 60,
      render: (value, record) => (
        <InputNumber
          size='small'
          min={1}
          value={value}
          onChange={val => {
            const quantity = val ?? 1;
            const amount = calculateAmount(record.price, quantity, record.discount);
            setTableData(prev => prev.map(item => item.key === record.key ? { ...item, quantity, amount } : item));
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ส่วนลด</div>,
      dataIndex: 'discount',
      width: 70,
      render: (value, record) => (
        <InputNumber
          size='small'
          min={0}
          max={100}
          formatter={val => `${val}%`}
          parser={val => val ? val.replace('%', '') : ''}
          value={value}
          onChange={val => {
            const discount = val ?? 0;
            const amount = calculateAmount(record.price, record.quantity, discount);
            setTableData(prev => prev.map(item => item.key === record.key ? { ...item, discount, amount } : item));
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>จ่ายเงิน</div>,
      dataIndex: 'payment',
      width: 75,
      render: (value, record) => (
        <Select
          size='small'
          value={value}
          onChange={val => {
            setTableData(prev => prev.map(item => item.key === record.key ? { ...item, payment: val } : item));
          }}
          style={{ width: '100%' }}
        >
          <Option value="M">M</Option>
          <Option value="F">F</Option>
          <Option value="เบิก">เบิก</Option>
          <Option value="P">P</Option>
        </Select>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ประเภทคูปอง</div>,
      dataIndex: 'couponType',
      width: 150,
      render: (value, record) => (
        <Select
          size='small'
          value={value || '00'}
          onChange={val => {
            setTableData(prev => prev.map(item => item.key === record.key ? { ...item, couponType: val } : item));
          }}
          style={{ width: '100%' }}
        >
          {renderCouponOptions()}
        </Select>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>กิจกรรม</div>,
      dataIndex: 'activity',
      width: 150,
      render: (value, record) => (
        <Select
          size='small'
          value={value || '000'}
          onChange={val => {
            setTableData(prev => prev.map(item => item.key === record.key ? { ...item, activity: val } : item));
          }}
          style={{ width: '100%' }}
        >
          {renderActivityOptions()}
        </Select>
      ),
    },
    // {
    //   title: 'ราคา',
    //   dataIndex: 'price',
    //   width: 100,
    //   render: value => `${value} บาท`,
    // },
    {
      title: <div style={{ textAlign: 'center' }}>รวม</div>,
      dataIndex: 'amount',
      width: 120,
      render: (value: number) => (
        <div style={{ textAlign: 'right', paddingRight: 8 }}>
          {value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ),
    },

  ];

  const milestone2 = ['M Plus Forte', 'Melaslin', 'VB Block', 'Sunscreen'];

  
 const [cashChecked, setCashChecked] = useState(false);
  const [cashValue, setCashValue] = useState('0');

  const [creditChecked, setCreditChecked] = useState(false);
  const [creditValues, setCreditValue] = useState({
    value1: '0',
    value2: '0',
  });
  const [creditCardTypes, setCreditCardTypes] = useState({
    card1: '-',
    card2: '-',
  });
  const [creditPaymentType, setCreditPaymentType] = useState('เต็มจำนวน');


  const [welfareChecked, setWelfareChecked] = useState(false);
  const [welfareValue, setWelfareValue] = useState('0');

  const [salaryChecked, setSalaryChecked] = useState(false);
  const [salaryValue, setSalaryValue] = useState('0');

  const [voucherChecked, setVoucherChecked] = useState(false);
  const [voucherValue, setVoucherValue] = useState({
    value1: '0',
    value2: '0',
  });
  const [voucherCardTypes, setVoucherCardTypes] = useState({
    card1: '-',
    card2: '-',
  });
  
  const [couponChecked, setCouponChecked] = useState(false);
  const [couponValue, setCouponValue] = useState('0');

  const [evoucherChecked, setEvoucherChecked] = useState(false);
  const [evoucherValue, setEvoucherValue] = useState('0');

  const [ewalletChecked, setEwalletChecked] = useState(false);
  const [ewalletValue, setEwalletValue] = useState('0');

  const [transferChecked, setTransferChecked] = useState(false);
  const [transferValue, setTransferValue] = useState('0');
  const [transferCardTypes, setTransferCardTypes] = useState('-');

  const [lineCreditChecked, setLineCreditChecked] = useState(false);
  const [lineCreditValue, setLineCreditValue] = useState('0');
  const [lineCreditCardTypes, setLineCreditCardTypes] = useState('-');

  const [value, setValue] = useState('');
  const [consultOption, setConsultOption] = useState('');
  
  // const handleChange = (value: string) => {
  //   console.log(`selected ${value}`);
  // };
  
  return (
  <Layout style={{ minHeight: '100vh', padding: 10 }}>
    <Row>
      <Col>     
        <Row gutter={[8, 8]} style={{ height: '100vh' }} wrap>
          {/* Sider Menu */}
          <Col xs={24} md={3}>
            <Menu
              mode="vertical" //inline
              selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
              items={menuItems}
              onClick={(e) => {
                setSelectedMenuKey(e.key);
                setSelectedAddKeys([]);
              }}
              style={{ 
                height: '100%', overflowY: 'auto',
                borderRadius: 8, 
                boxShadow: '0 0 8px rgba(0,0,0,0.1)',
              }}
              className="compact-menu"
            />     
          </Col>
          {/* รายการสินค้า */}
          <Col xs={24} md={4}>
            <div
              style={{
                background: '#fff',
                padding: 16,
                boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 8,
              }}
            >
              <h3 style={{ marginBottom: 16 }}>
                {selectedMenuKey || 'กรุณาเลือกหมวดหมู่สินค้า'}
              </h3>

              <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                {itemsToShow.length === 0 && <p>-</p>}
                {itemsToShow.map(item => (
                  <div
                    key={item.id}
                    style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}
                  >
                    <Checkbox
                      checked={selectedAddKeys.includes(item.id)}
                      onChange={e => {
                        const checked = e.target.checked;
                        setSelectedAddKeys(prev =>
                          checked ? [...prev, item.id] : prev.filter(id => id !== item.id),
                        );
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          {/* ตาราง */}
          <Col xs={24} md={17}>         
            <Content
              style={{
                background: '#fff',
                padding: 14,
                flexGrow: 1,
                height: '100%',
                // height: '100vh',
                // overflow: 'auto',
                borderRadius: 8, 
                boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                // maxWidth: 800,
              }}
            >
              <Row style={{ marginBottom: 8 }}>
                <Col xs={24} md={24}>
                  <Card>
                    <Row gutter={[4, 4]} align="middle" style={{ marginBottom: 8 }}>
                      <Col><Text strong>OPD :</Text></Col>
                      <Col><Input size="small" /></Col>
                      <Col style={{marginRight:20}}>
                        <Button size="small" type="primary" shape="round">OK</Button>
                      </Col>
                      <Col>
                        <Select size="small" defaultValue="TT002 49TT0714 ปวีณา(Test) คชเสน" style={{ width: '100%' }}>
                          <Option value="1">TT002 49TT0714 ปวีณา(Test) คชเสน</Option>
                        </Select>
                      </Col>
                      <Col><Button size="small" type="primary" shape="round">Update Queue</Button></Col>
                      <Col><Button size="small" type="primary" shape="round" danger>View Coupon</Button></Col>
                    </Row>

                    <Row gutter={[8, 0]} >
                      <Col span={8}>
                        <Text strong>ชื่อ-สกุล : </Text>
                        <Text>ปวีณา(Test) คชเสน</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>ประเภทสมาชิก : </Text>
                        <Text>Titanium Card</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>วันที่หมดอายุ : </Text>
                        <Text style={{ color: 'red' }}>23/02/2025</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>สิทธิ์ BirthDay : </Text>
                        <Text>-</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>แพ้ยา(Allergy) : </Text>
                        <Text>Amoxycillin,Bactrim,Erythronycin</Text>
                      </Col>                        
                      <Col span={8}>
                        <Text strong>กลุ่มลูกค้า : </Text>
                        <Text>-</Text>
                      </Col>
                    </Row>
                      
                    <Divider size="small" />
                      
                    {/* ปุ่ม Toggle */}
                    <Row>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setExpanded(prev => !prev)}
                        icon={expanded ? <UpOutlined /> : <DownOutlined />}
                      >
                        {expanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียดเพิ่มเติม'}
                      </Button>
                    </Row>

                    {/* ส่วนที่ซ่อน/แสดงได้ */}
                    {expanded && (
                      <>
                        <Row >
                          <Col>
                            <Text strong>Screening Test : </Text>
                          </Col>
                          <Col>
                            <Text> 
                              วันที่ : 27/09/2023ไม่คาดว่าเป็นผิว Seborrhea Skin, ไม่คาดว่าเป็นผิว Atopic Skin, Solar Len (กระแดด) , seb. ker. (กระเนื้อ) 
                            </Text>
                          </Col>
                        </Row>

                        <div>
                          <Text strong>Digital Microscope :</Text>
                          <Text>
                            วันที่ : 02/05/2023 ครั้งที่ 25 พบว่า : ผิดปกติ Upper Ortho (ผิดปกติ ที่ผ่านร่างทรงขั้นบน), แขน : ผิดปกติ Upper Ortho (ผิดปกติ ที่ผ่านร่างทรงขั้นบน)
                          </Text>
                        </div>

                        <div>
                          <Text strong>ปัญหา (Diag) : </Text>
                          <Text type="danger">Acneสิวในระยะยาว </Text>
                          [<Text underline>25/06/2025</Text>]
                        </div>

                        <div>
                          <Text strong>ความกังวล / ดูแล : </Text> 
                          <Text>สิว , รอยแดง รอยดำจากสิว [<Text underline>04/06/2025</Text>]</Text>
                        </div>

                        <div>
                          <Text strong>Milestone :</Text>                 
                          <Text style={{ marginLeft: 2 }}> A1 Clear Localized สิวบริเวณ : </Text>

                            <Text type="danger" style={{ marginLeft: 4 }}>[VB Block]</Text>

                          <br />
                          <Text strong>(ผลิตภัณฑ์ที่ให้กลับ) : </Text>
                          <Text>C2 V control ล้างสิวเลือด (maintain) :</Text>
                          {milestone2.map((m, i) => (
                            <Text key={i} type="danger" style={{ marginLeft: 4 }}>[{m}]</Text>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
              <Card
                title={
                  <div>
                    <ConfigProvider
                      button={{
                        className: styles.greenButton + ' ' + styles.redButton,
                      }}
                    >
                      <Row gutter={8}>
                        <Col>
                          <Button
                            type="primary"
                            disabled={selectedAddKeys.length === 0}
                            onClick={handleAddSelected}
                            size="small"
                            style={{ borderRadius: 7, padding: '0 10px', height: 28, lineHeight: '28px' }}
                          >
                            <PlusOutlined style={{ fontSize: 12, marginRight: 6 }} />
                            เพิ่มรายการ
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            type="primary"
                            danger
                            disabled={selectedDeleteKeys.length === 0}
                            onClick={() => {
                              setTableData(prev => prev.filter(item => !selectedDeleteKeys.includes(item.key)));
                              setSelectedDeleteKeys([]);
                            }}
                            size="small"
                            style={{ borderRadius: 7, padding: '0 10px', height: 28, lineHeight: '28px' }}
                          >
                            <MinusOutlined style={{ fontSize: 12, marginRight: 6 }} />
                            ลบรายการ
                          </Button>
                        </Col>
                      </Row>
                    </ConfigProvider>

                  </div>
                }
                size="small"
              >
                <Table
                  rowKey="key"
                  size='small'
                  bordered
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  scroll={{ y: 500, x: 'max-content' }}
                  style={{ width: '100%' }}
                  rowSelection={{
                    columnWidth: 40,
                    selectedRowKeys: selectedDeleteKeys,
                    onChange: (keys) => setSelectedDeleteKeys(keys),
                  }}
                />
                <Row style={{ marginTop: 16, fontWeight: 'bold' }}> {/* justify="end" */} 
                  <Col>
                    เงินสดรวม: {totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                  </Col>
                </Row>
                <Row style={{ marginTop: 16, fontWeight: 'bold' }}>
                  <Col>
                    การชำระเงิน
                  </Col>
                </Row>
                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={cashChecked}
                      onChange={(e) => {
                        setCashChecked(e.target.checked);
                        if (!e.target.checked) setCashValue('0');
                      }}
                    >
                      เงินสด
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={cashValue}
                      onChange={(e) => setCashValue(e.target.value)}
                      disabled={!cashChecked}
                    />
                  </Col>
                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={creditChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCreditChecked(checked);
                        if (!checked) {
                          setCreditValue({ value1: '0', value2: '0' });
                          setCreditCardTypes({ card1: '-', card2: '-' });
                          setCreditPaymentType('เต็มจำนวน');
                        }
                      }}
                    >
                      บัตรเครดิต
                    </Checkbox>
                  </Col>

                  {/* เต็มจำนวน / แบ่งจ่าย */}
                  <Col md={3}>
                    <Select
                      value={creditPaymentType}
                      size="small"
                      style={{ width: 132}}
                      onChange={(val) => setCreditPaymentType(val)}
                      disabled={!creditChecked}
                      options={[
                        { value: 'เต็มจำนวน', label: 'เต็มจำนวน' },
                        { value: 'แบ่งชำระ', label: 'แบ่งชำระ' },
                      ]}
                    />
                  </Col>

                  {/* ใบที่ 1 */}
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ใบที่ 1</span>
                  </Col>
                  <Col>
                    <Select
                      value={creditCardTypes.card1}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(val) =>
                        setCreditCardTypes((prev) => ({ ...prev, card1: val }))
                      }
                      disabled={!creditChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                      ]}
                    />
                  </Col> 
                  <Col>
                    <Input
                      type="number"
                      size="small"
                      addonAfter="บาท"
                      style={{ width: 120 }}
                      value={creditValues.value1}
                      onChange={(e) =>
                        setCreditValue((prev) => ({ ...prev, value1: e.target.value }))
                      }
                      disabled={!creditChecked}
                    />
                  </Col>

                  {/* ใบที่ 2 */}
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ใบที่ 2</span>
                  </Col>

                  <Col>
                    <Select
                      value={creditCardTypes.card2}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(val) =>
                        setCreditCardTypes((prev) => ({ ...prev, card2: val }))
                      }
                      disabled={!creditChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                      ]}
                    />
                  </Col>

                  <Col>
                    <Input
                      type="number"
                      size="small"
                      addonAfter="บาท"
                      style={{ width: 120 }}
                      value={creditValues.value2}
                      onChange={(e) =>
                        setCreditValue((prev) => ({ ...prev, value2: e.target.value }))
                      }
                      disabled={!creditChecked}
                    />
                  </Col>
                </Row>


                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={welfareChecked}
                      onChange={(e) => {
                        setWelfareChecked(e.target.checked);
                        if (!e.target.checked) setWelfareValue('0');
                      }}
                    >
                      หักสวัสดิการ
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={welfareValue}
                      onChange={(e) => setWelfareValue(e.target.value)}
                      disabled={!welfareChecked}
                    />
                  </Col>
                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={salaryChecked}
                      onChange={(e) => {
                        setSalaryChecked(e.target.checked);
                        if (!e.target.checked) setSalaryValue('0');
                      }}
                    >
                      หักเงินเดือน
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={salaryValue}
                      onChange={(e) => setSalaryValue(e.target.value)}
                      disabled={!salaryChecked}
                    />
                  </Col>
                </Row>














                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={voucherChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setVoucherChecked(checked);
                        if (!checked) {
                          setVoucherValue({ value1: '0', value2: '0' });
                          setVoucherCardTypes({ card1: '-', card2: '-' });
                        }
                      }}
                    >
                      Voucher
                    </Checkbox>
                  </Col>
                  {/* ใบที่ 1 */}
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ใบที่ 1</span>
                  </Col>
                  <Col>
                    <Select
                      value={voucherCardTypes.card1}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(val) =>
                        setVoucherCardTypes((prev) => ({ ...prev, card1: val }))
                      }
                      disabled={!voucherChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                      ]}
                    />
                  </Col> 
                  <Col>
                    <Input
                      type="number"
                      size="small"
                      addonAfter="บาท"
                      style={{ width: 120 }}
                      value={voucherValue.value1}
                      onChange={(e) =>
                        setVoucherValue((prev) => ({ ...prev, value1: e.target.value }))
                      }
                      disabled={!voucherChecked}
                    />
                  </Col>

                  {/* ใบที่ 2 */}
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ใบที่ 2</span>
                  </Col>

                  <Col>
                    <Select
                      value={voucherCardTypes.card2}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(val) =>
                        setVoucherCardTypes((prev) => ({ ...prev, card2: val }))
                      }
                      disabled={!voucherChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                      ]}
                    />
                  </Col>

                  <Col>
                    <Input
                      type="number"
                      size="small"
                      addonAfter="บาท"
                      style={{ width: 120 }}
                      value={voucherValue.value2}
                      onChange={(e) =>
                        setVoucherValue((prev) => ({ ...prev, value2: e.target.value }))
                      }
                      disabled={!voucherChecked}
                    />
                  </Col>

                </Row>









                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={couponChecked}
                      onChange={(e) => {
                        setCouponChecked(e.target.checked);
                        if (!e.target.checked) setCouponValue('0');
                      }}
                    >
                      คูปองแพนบิวตี้แคร์
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      disabled={!couponChecked}
                    />
                  </Col>
                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={evoucherChecked}
                      onChange={(e) => {
                        setEvoucherChecked(e.target.checked);
                        if (!e.target.checked) setEvoucherValue('0');
                      }}
                    >
                      E-Voucher KBank
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={evoucherValue}
                      onChange={(e) => setEvoucherValue(e.target.value)}
                      disabled={!evoucherChecked}
                    />
                  </Col>
                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={ewalletChecked}
                      onChange={(e) => {
                        setEwalletChecked(e.target.checked);
                        if (!e.target.checked) setEwalletValue('0');
                      }}
                    >
                      E-Wallet (QR Code)
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={ewalletValue}
                      onChange={(e) => setEwalletValue(e.target.value)}
                      disabled={!ewalletChecked}
                    />
                  </Col>
                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={transferChecked}
                      onChange={(e) => {
                        setTransferChecked(e.target.checked);
                        if (!e.target.checked) setTransferValue('0');
                      }}
                    >
                      เงินโอน(Online)
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={transferValue}
                      onChange={(e) => setTransferValue(e.target.value)}
                      disabled={!transferChecked}
                    />
                  </Col>
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ธนาคาร</span>
                  </Col>
                  <Col>
                    <Select
                      value={transferCardTypes}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(value) => setTransferCardTypes(value)}
                      disabled={!transferChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                        { value: 'ไทยภาณิชย์', label: 'ไทยภาณิชย์' },
                        { value: 'กรุงไทย', label: 'กรุงไทย' },
                      ]}
                    />
                  </Col> 

                </Row>

                <Row gutter={8} style={{ marginBottom: 8 }}>
                  <Col md={4}>
                    <Checkbox
                      checked={lineCreditChecked}
                      onChange={(e) => {
                        setLineCreditChecked(e.target.checked);
                        if (!e.target.checked) setLineCreditValue('0');
                      }}
                    >
                      บัตรเครดิต(LinePBC)
                    </Checkbox>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="number"
                      size= 'small'
                      addonAfter="บาท"
                      value={lineCreditValue}
                      onChange={(e) => setLineCreditValue(e.target.value)}
                      disabled={!lineCreditChecked}
                    />
                  </Col>
                  <Col>
                    <span style={{ lineHeight: '28px' }}>ธนาคาร</span>
                  </Col>
                  <Col>
                    <Select
                      value={lineCreditCardTypes}
                      size="small"
                      style={{ width: 120 }}
                      onChange={(value) => setLineCreditCardTypes(value)}
                      disabled={!lineCreditChecked}
                      options={[
                        { value: '-', label: '-' },
                        { value: 'กสิกรไทย', label: 'กสิกรไทย' },
                      ]}
                    />
                  </Col> 
                </Row>
                <Divider size="small" />
                <Row gutter={8} style={{ marginBottom: 8 }}>
                  {/* Col 1: Label */}
                  <Col className="text-label">ประเภทการมารับบริการ</Col>
                  <Divider type="vertical" />
                  {/* Col 2: ตัวเลือกหลัก */}
                  <Col md={8}>
                    <Radio.Group onChange={(e) => setValue(e.target.value)} value={value}>
                      <Row>
                        <Col>
                          <Radio value="line">มารับบริการที่สาขา(LinePBC)</Radio>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Radio value="online">ขายออนไลน์ที่สาขา(LinePBC)</Radio>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Radio value="walkin">ซื้อยาเท่านั้น (Walk in)</Radio>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <Radio value="no_service">
                            ไม่มารับบริการ (ออกทดแทนการรับคืน-รับล่วงหน้า / RU หรือ ออกแทนสาขาแพนบิวตี้ / ลืมเบิก)
                          </Radio>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </Col>
                  <Divider type="vertical" />
                  {/* Col 3: เงื่อนไขเฉพาะเมื่อเลือก "online" */}
                  <Col>
                    {value === 'online' && (
                      <>
                        <Radio.Group
                          onChange={(e) => setConsultOption(e.target.value)}
                          value={consultOption}
                        >
                          <Radio value="no">ไม่ปรึกษาแพทย์</Radio>
                          <Radio value="yes">ปรึกษาแพทย์</Radio>
                        </Radio.Group>

                        {consultOption === 'yes' && (
                          <div style={{ marginTop: 8 }}>
                            <Select
                              size="small"
                              placeholder="เลือกแพทย์"
                              style={{ width: 150 }}
                            >
                              <Option value="drA">หมอ A</Option>
                              <Option value="drB">หมอ B</Option>
                              <Option value="drC">หมอ C</Option>
                            </Select>
                          </div>
                        )}
                      </>
                    )}
                  </Col>
                </Row>
              </Card>

            </Content>
          </Col>
        </Row>
      </Col>
    </Row>
  </Layout>
);
}
