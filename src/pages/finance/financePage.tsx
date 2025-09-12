import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, Checkbox, Button, Table, InputNumber, Select, 
  Card, Layout, ConfigProvider, Row, Col, Input, Typography, 
  Divider, Radio, Space, message
} from 'antd';
const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table/interface';
import { PlusOutlined, MinusOutlined, DownOutlined, UpOutlined, 
  FilePdfOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { renderCouponOptions, renderActivityOptions } from '../finance/selectOptions';
import { v4 as uuidv4 } from 'uuid';
import { useStyle } from './styles.ts';
import './style.css';
import * as financeApi from './financeApi'; 
import { generateFinancePDF } from '../../utils/generateFinancePDF';

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
  productId?: string;
  maingroup?: string;
  brand?: string;
  cls?: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  discount?: number;
  maingroup?: string;
  brand?: string;
  cls?: string;
}

interface MenuItemNode {
  key: string;
  label: string;
  children?: MenuItemNode[];
}

export default function Finance() {
  const { styles } = useStyle();
  const [selectedMenuKey, setSelectedMenuKey] = useState<string | null>(null);
  const [selectedMenuLabel, setSelectedMenuLabel] = useState<string>('');
  const [selectedAddKeys, setSelectedAddKeys] = useState<string[]>([]);
  const [selectedDeleteKeys, setSelectedDeleteKeys] = useState<React.Key[]>([]);
  const [tableData, setTableData] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState(false);

  const [itemsToShow, setItemsToShow] = useState<ProductItem[]>([]);

  const calculateAmount = (price: number, quantity: number, discount: number) => {
    return price * quantity * (1 - discount / 100);
  };

  const [menuItems, setMenuItems] = useState<MenuItemNode[]>([]);
  function buildMenuTree(flatMenu: any[], parentId: number = 1): MenuItemNode[] {
    return flatMenu
      .filter((item: any) => item.ParentID === parentId)
      .sort((a: any, b: any) => (a.Priority ?? 9999) - (b.Priority ?? 9999))
      .map((item: any) => {
        const children: MenuItemNode[] = buildMenuTree(flatMenu, item.MenuID);
        return {
          key: `${item.MenuID}_${item.HRef ?? ''}`,
          label: item.Text,
          children: children.length > 0 ? children : undefined,
          href: item.HRef,
        };
      });
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await financeApi.GetMenu();
        const arr = Array.isArray(data) ? data : [];
        const tree = buildMenuTree(arr, 1);
        setMenuItems(tree);
      } catch (err) {
        message.error("ไม่สามารถโหลดเมนูได้ > " + err);
      }
    };
    fetchMenu();
  }, []);

  function handlePrintPDF() {
    try {
      // เรียกฟังก์ชัน generateFinancePDF เพื่อสร้าง PDF
      const doc = generateFinancePDF(customerData, tableData);

      // แสดง/พิมพ์ PDF
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.focus();
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        message.error('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
      }

    } catch (err: any) {
      // ถ้าไม่มีข้อมูล หรือ tableData ว่าง
      message.warning(err.message);
    }
  }



  const [customerIdInput, setCustomerIdInput] = useState('');
  const [customerData, setCustomerData] = useState<any>(null);
  // เพิ่มฟังก์ชันสำหรับกด OK
  const handleGetCustomer = async () => {
    if (!customerIdInput.trim()) {
      message.warning('กรุณากรอก OPD');
      return;
    }

    try {
      const result = await financeApi.GetCustomer(customerIdInput.trim());

      if (Array.isArray(result) && result.length > 0) {
        message.success('ค้นหาข้อมูลลูกค้าสำเร็จ');
        setCustomerData(result[0]); 
        console.log('Customer Data:', result[0]);
      } else {
        setCustomerData(null);
        message.error('ไม่พบข้อมูลลูกค้า');
      }
    } catch (err) {
      console.error('GetCustomer Error:', err);
      message.error('เกิดข้อผิดพลาดในการค้นหาลูกค้า');
    }
  };
  useEffect(() => {
  }, [customerData]);

  const handleMenuClick = async (e: any) => {
    setSelectedMenuKey(e.key);

    // ใช้ innerText แทน info.item เพื่อรองรับอนาคต
    let label = '';
    if (e.domEvent && e.domEvent.currentTarget && e.domEvent.currentTarget.innerText) {
      label = e.domEvent.currentTarget.innerText;
    }
    setSelectedMenuLabel(label);

    setSelectedAddKeys([]);
    const [, href] = e.key.split('_');
    if (href) {
      const [maingroup, brand, cls] = href.split(',');
      try {
        const items = await financeApi.GetProduct(href, maingroup, brand, cls);
        const mapped = (Array.isArray(items) ? items : []).map((item: any) => ({
          id: item.ProductID,
          name: item.Name,
          price: item.Price,
          discount: 0,
          maingroup,
          brand,
          cls,
        }));
        setItemsToShow(mapped);
      } catch (err) {
        message.error('โหลดข้อมูลสินค้าไม่สำเร็จ');
        setItemsToShow([]);
      }
    } else {
      setItemsToShow([]);
    }
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
          productId: item.id,
          maingroup: item.maingroup,
          brand: item.brand,
          cls: item.cls,     
        };
      });
    setTableData(prev => [...prev, ...newProducts]);
    setSelectedAddKeys([]);
  };

  const handleSave = async () => {
    try {
      // 1. customerID
      // console.log('customerData', customerData);
      if (!customerData || !customerData.CustomerID) {
        message.warning("กรุณาค้นหาและเลือกลูกค้าที่ถูกต้องก่อนทำการบันทึก");
        return;
      }
      const customerID = customerData.CustomerID;
      // 2. ยอดเงินทั้งหมด
      const allTotal = totalCash;

      // 3. productDetail (คือ tableData)
      const productDetail = tableData.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: item.amount, 
        maingroup: item.maingroup,
        brand: item.brand,
        class: item.cls,
      }));
      if (productDetail.length === 0) {
        message.warning("กรุณาเลือกรายการสินค้า/บริการก่อนทำการบันทึก");
        return;
      }

      // 4. paymentDetail (list ตามช่องที่ติ๊ก)
      const paymentDetail: any[] = [];

      if (cashChecked && Number(cashValue) > 0) {
        paymentDetail.push({
          type: 'เงินสด',
          amount: Number(cashValue),
        });
      }
      if (creditChecked && (Number(creditValues.value1) > 0 || Number(creditValues.value2) > 0)) {
        const cards = [];
        if (Number(creditValues.value1) > 0) {
          cards.push({
            cardNo: 1,
            card: creditCardTypes.card1,
            amount: Number(creditValues.value1),
          });
        }
        if (Number(creditValues.value2) > 0) {
          cards.push({
            cardNo: 2,
            card: creditCardTypes.card2,
            amount: Number(creditValues.value2),
          });
        }
        paymentDetail.push({
          type: 'บัตรเครดิต',
          payType: creditPaymentType,
          cards,
        });
      }
      if (welfareChecked && Number(welfareValue) > 0) {
        paymentDetail.push({
          type: 'หักสวัสดิการ',
          amount: Number(welfareValue),
        });
      }
      if (salaryChecked && Number(salaryValue) > 0) {
        paymentDetail.push({
          type: 'หักเงินเดือน',
          amount: Number(salaryValue),
        });
      }
      if (voucherChecked && (Number(voucherValue.value1) > 0 || Number(voucherValue.value2) > 0)) {
        const cards = [];
        if (Number(voucherValue.value1) > 0) {
          cards.push({
            cardNo: 1,
            card: voucherCardTypes.card1,
            amount: Number(voucherValue.value1),
          });
        }
        if (Number(voucherValue.value2) > 0) {
          cards.push({
            cardNo: 2,
            card: voucherCardTypes.card2,
            amount: Number(voucherValue.value2),
          });
        }
        paymentDetail.push({
          type: 'Voucher',
          cards,
        });
      }
      if (couponChecked && Number(couponValue) > 0) {
        paymentDetail.push({
          type: 'คูปองแพนบิวตี้แคร์',
          amount: Number(couponValue),
        });
      }
      if (evoucherChecked && Number(evoucherValue) > 0) {
        paymentDetail.push({
          type: 'E-Voucher KBank',
          amount: Number(evoucherValue),
        });
      }
      if (ewalletChecked && Number(ewalletValue) > 0) {
        paymentDetail.push({
          type: 'E-Wallet (QR Code)',
          amount: Number(ewalletValue),
        });
      }
      if (transferChecked && Number(transferValue) > 0) {
        paymentDetail.push({
          type: 'เงินโอน(Online)',
          bank: transferCardTypes,
          amount: Number(transferValue),
        });
      }
      if (lineCreditChecked && Number(lineCreditValue) > 0) {
        paymentDetail.push({
          type: 'บัตรเครดิต(LinePBC)',
          bank: lineCreditCardTypes,
          amount: Number(lineCreditValue),
        });
      }
      const res = await financeApi.SaveReceipt(customerID, allTotal, paymentDetail, productDetail) as any;
      if (res && res.success) {
        message.success('บันทึกข้อมูลสำเร็จ');
        handlePrintPDF();
        reset();
      } else {
        message.error('บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const reset = () => {
    setTableData([]);
    setSelectedAddKeys([]);
    setSelectedDeleteKeys([]);
    setCustomerIdInput('');
    setCustomerData(null);
    setCashChecked(false);
    setCashValue('0');
    setCreditChecked(false);
    setCreditValue({ value1: '0', value2: '0' });
    setCreditCardTypes({ card1: '-', card2: '-' });
    setCreditPaymentType('เต็มจำนวน');
    setWelfareChecked(false);
    setWelfareValue('0');
    setSalaryChecked(false);
    setSalaryValue('0');
    setVoucherChecked(false);
    setVoucherValue({ value1: '0', value2: '0' });
    setVoucherCardTypes({ card1: '-', card2: '-' });
    setCouponChecked(false);
    setCouponValue('0');
    setEvoucherChecked(false);
    setEvoucherValue('0');
    setEwalletChecked(false);
    setEwalletValue('0');
    setTransferChecked(false);
    setTransferValue('0');
    setTransferCardTypes('-');
    setLineCreditChecked(false);
    setLineCreditValue('0');
    setLineCreditCardTypes('-');
    setSelectedMenuKey(null);
    setSelectedMenuLabel('');
    setItemsToShow([]);
    setValue('');
    setConsultOption('');
  };
  
  const totalCash = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.amount, 0);
  }, [tableData]);

  // 1. Default ติ๊กเงินสด และใส่ค่า totalCash
  useEffect(() => {
    setCashChecked(true);
    setCashValue(totalCash.toString());
  }, [totalCash]);

  // เงินสด
  const handleCashChecked = (checked: boolean) => {
    setCashChecked(checked);
    setCashValue(checked ? totalCash.toString() : '0');
  };

  // บัตรเครดิต
  const handleCreditChecked = (checked: boolean) => {
    setCreditChecked(checked);
    setCreditValue({
      value1: checked ? totalCash.toString() : '0',
      value2: '0',
    });
    setCreditCardTypes({ card1: '-', card2: '-' });
    setCreditPaymentType('เต็มจำนวน');
  };

  // หักสวัสดิการ
  const handleWelfareChecked = (checked: boolean) => {
    setWelfareChecked(checked);
    setWelfareValue(checked ? totalCash.toString() : '0');
  };

  // หักเงินเดือน
  const handleSalaryChecked = (checked: boolean) => {
    setSalaryChecked(checked);
    setSalaryValue(checked ? totalCash.toString() : '0');
  };

  // Voucher
  const handleVoucherChecked = (checked: boolean) => {
    setVoucherChecked(checked);
    setVoucherValue({
      value1: checked ? totalCash.toString() : '0',
      value2: '0',
    });
    setVoucherCardTypes({ card1: '-', card2: '-' });
  };

  // คูปองแพนบิวตี้แคร์
  const handleCouponChecked = (checked: boolean) => {
    setCouponChecked(checked);
    setCouponValue(checked ? totalCash.toString() : '0');
  };

  // E-Voucher KBank
  const handleEvoucherChecked = (checked: boolean) => {
    setEvoucherChecked(checked);
    setEvoucherValue(checked ? totalCash.toString() : '0');
  };

  // E-Wallet (QR Code)
  const handleEwalletChecked = (checked: boolean) => {
    setEwalletChecked(checked);
    setEwalletValue(checked ? totalCash.toString() : '0');
  };

  // เงินโอน(Online)
  const handleTransferChecked = (checked: boolean) => {
    setTransferChecked(checked);
    setTransferValue(checked ? totalCash.toString() : '0');
    setTransferCardTypes('-');
  };

  // บัตรเครดิต(LinePBC)
  const handleLineCreditChecked = (checked: boolean) => {
    setLineCreditChecked(checked);
    setLineCreditValue(checked ? totalCash.toString() : '0');
    setLineCreditCardTypes('-');
  };

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
              onClick={handleMenuClick}
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
                {selectedMenuLabel || 'กรุณาเลือกหมวดหมู่สินค้า'}
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
                      <Col>
                        <Input
                          size="small"
                          value={customerIdInput}
                          onChange={e => setCustomerIdInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleGetCustomer();
                            }
                          }}
                          suffix={
                            customerData?.Name ? (
                              <CheckCircleOutlined style={{ color: "green" }} />
                            ) : (
                              <CloseCircleOutlined style={{ color: "red" }} />
                            )
                          }
                        />
                      </Col>
                      <Col style={{marginRight:20}}>
                        <Button
                          size="small"
                          type="primary"
                          shape="round"
                          onClick={handleGetCustomer}
                        >
                          OK
                        </Button>
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
                        <Text>{customerData?.Name}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>ประเภทสมาชิก : </Text>
                        <Text>{customerData?.MemTypeName || '-'}</Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>วันที่หมดอายุ : </Text>
                        <Text style={{
                          color: customerData?.ExpirationDate && new Date(customerData.ExpirationDate) < new Date() ? 'red' : 'black'
                        }}>
                          {customerData?.ExpirationDate
                            ? (() => {
                                const d = new Date(customerData.ExpirationDate.replace(/-/g, '/'));
                                const y = d.getFullYear();
                                const m = String(d.getMonth() + 1).padStart(2, '0');
                                const day = String(d.getDate()).padStart(2, '0');
                                return `${day}/${m}/${y}`; // 👉 แสดงเป็น วัน/เดือน/ปี
                              })()
                            : '-'}
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Text strong>สิทธิ์ BirthDay : </Text>
                        <Text>{customerData?.StatusBirthdaySpecial || '-'}</Text>
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
                           
                            style={{ borderRadius: 7, padding: '0 10px', height: 28, lineHeight: '28px' }}
                          >
                            <PlusOutlined style={{ fontSize: 12, marginRight: 6 }} />
                            เพิ่มรายการ
                          </Button>
                        </Col>
                        <Col>
                          <Button
                            className="delete-btn"
                            disabled={selectedDeleteKeys.length === 0}
                            onClick={() => {
                              setTableData(prev => prev.filter(item => !selectedDeleteKeys.includes(item.key)));
                              setSelectedDeleteKeys([]);
                            }}
                          >
                            <MinusOutlined style={{ fontSize: 12, marginRight: 6 }} />
                            ลบรายการ
                          </Button>
                        </Col>
                        <Col>
                          <Button className="export-btn" onClick={handlePrintPDF}>
                            <FilePdfOutlined style={{ fontSize: 12, marginRight: 6 }} />
                            พิมพ์ PDF
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
                    รวมเป็นเงิน: {totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
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
                      onChange={e => handleCashChecked(e.target.checked)}
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
                      onChange={e => handleCreditChecked(e.target.checked)}
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
                      onChange={e => handleWelfareChecked(e.target.checked)}
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
                      onChange={e => handleSalaryChecked(e.target.checked)}
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
                      onChange={e => handleVoucherChecked(e.target.checked)}
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
                      onChange={e => handleCouponChecked(e.target.checked)}
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
                      onChange={e => handleEvoucherChecked(e.target.checked)}
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
                      onChange={e => handleEwalletChecked(e.target.checked)}
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
                      onChange={e => handleTransferChecked(e.target.checked)}
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
                      onChange={e => handleLineCreditChecked(e.target.checked)}
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

                <Divider size="small"/>
                
                <Row gutter={8} style={{ marginBottom: 8 }}>
                  {/* Col 1: Label */}
                  <Col className="text-label">
                    ประเภทการมารับบริการ
                  </Col>

                  <Row>
                    <Divider variant="dashed" type="vertical" style={{ height: '100%', borderColor: '#ccc' }} dashed></Divider>
                  </Row>

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

                  <Row>
                    <Divider variant="dashed" type="vertical" style={{ height: '100%', borderColor: '#ccc' }} dashed></Divider>
                  </Row>

                  {/* Col 3: เงื่อนไขเฉพาะเมื่อเลือก "online" */}
                  <Col>
                    {value === 'online' && (
                      <>
                        <Space direction="vertical" size="middle">
                          <Radio.Group
                            onChange={(e) => setConsultOption(e.target.value)}
                            value={consultOption}
                          >
                            <Row><Radio value="no">ไม่ปรึกษาแพทย์</Radio></Row>
                            <Row><Radio value="yes">ปรึกษาแพทย์</Radio></Row>
                          </Radio.Group>
                        </Space>

                        {consultOption === 'yes' && (
                          <div style={{ marginTop: 4 /* หรือ 8 ตามต้องการ */ }}>
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
                <Divider style={{ borderColor: '#7cb305' }}>Solid</Divider>
                <Row gutter={8} style={{ marginBottom: 8 }}>
                    <Button
                      type="primary"
                      onClick={handleSave}
                      size="small"
                      style={{ borderRadius: 7, padding: '0 10px', height: 28, lineHeight: '28px' }}
                    >
                      บันทึก
                    </Button>
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
