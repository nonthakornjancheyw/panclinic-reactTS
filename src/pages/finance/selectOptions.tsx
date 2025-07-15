// src/utils/selectOptions.tsx (หรือ .ts)
import { Select } from 'antd';

export const couponOptions = [
  { value: "00", label: "-" },
  { value: "19", label: "C Small" },
  { value: "20", label: "C Large" },
  { value: "21", label: "C 1 ครั้ง" },
  { value: "120", label: "คลินิก" },
  { value: "04", label: "สมาชิก" },
  { value: "50", label: "PRG" },
  { value: "41", label: "C ส่วนลด" },
  { value: "82", label: "พนักงาน / สอน" },
  { value: "211", label: "Zinc-Nature Balance" },
  { value: "212", label: "Tiktok/Influencer" },
  { value: "52", label: "CounterBA/SBC" },
  { value: "61", label: "VIP/Celeb" },
  { value: "92", label: "Promotion" },
  { value: "66", label: "รางวัล พนง." },
  { value: "63", label: "Platinum Package" },
  { value: "64", label: "Gold Package" },
  { value: "65", label: "Silver Package" },
  { value: "182", label: "Prepaid Pack 10,000" },
  { value: "183", label: "Prepaid Pack 20,000" },
  { value: "184", label: "Prepaid Pack 40,000" },
  { value: "70", label: "VIP Package" },
  { value: "71", label: "VIP Prepaid 10,000" },
  { value: "93", label: "VIP Prepaid 20,000" },
  { value: "73", label: "VIP Prepaid 30,000" },
  { value: "76", label: "VIP Prepaid 50,000" },
  { value: "147", label: "VIP Prepaid 120,000" },
  { value: "80", label: "VIP Prepaid 150,000" },
  { value: "74", label: "VIP Prepaid 300,000" },
  { value: "103", label: "VIP Prepaid 500,000" },
  { value: "141", label: "VIP Prepaid 200,000" },
  { value: "221", label: "Acne Challenge" },
  { value: "189", label: "Ev-DooDee" },
  { value: "143", label: "Ev-Pan Power" },
  { value: "222", label: "Gowabi" },
  { value: "138", label: "Happy New Year" },
  { value: "228", label: "MUT2025" },
  { value: "223", label: "P'CosMed" },
  { value: "68", label: "Ra-EFM" },
  { value: "226", label: "The Mall SongKran" },
  { value: "225", label: "VIP-Destination" },
  { value: "135", label: "Website/Facebook" },
  { value: "208", label: "ฟรี ตัดแต้ม" },
  { value: "207", label: "ฟรี สะสมดาว" },
  { value: "78", label: "ลูกค้าLoss-FU" },
  { value: "119", label: "SMS เชิญ/จดหมายเชิญ" },
];

export function renderCouponOptions() {
  return couponOptions.map(opt => (
    <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
    </Select.Option>
  ));
}

export const activityOptions = [
  { value: '000', label: '-' },
  { value: '127', label: 'MidYear25' },
  { value: '025', label: 'SMS/จดหมายเชิญ' },
  { value: '054', label: 'Refer-BA SBC หน่วยงานอื่น' },
  { value: '175', label: 'Happy New Year(Gift Voucher)' },
  { value: '122', label: 'Regular Sale' },
  { value: '207', label: 'Promotion' },
  { value: '181', label: 'Customer Recruit' },
  { value: '021', label: 'Birthday Special' },
  { value: '210', label: 'ลูกค้าLoss-FU' },
  { value: '320', label: 'Ev-DooDee' },
  { value: '379', label: 'Acne Challenge' },
  { value: '383', label: 'Gowabi' },
  { value: '392', label: 'Live Tiktok' },
  { value: '393', label: 'MUT2025' },
  { value: '373', label: 'Terminal21 Rama3' },
  { value: '390', label: 'The Mall SongKran Festival' },
  { value: '361', label: 'Tiktok/Influencer' },
  { value: '388', label: 'VIP-Destination' },
  { value: '359', label: 'Zinc-Nature Balance' },
  { value: '346', label: 'ตัดแต้ม' },
  { value: '250', label: 'Website/Facebook' },
  { value: '256', label: 'Ev-Pan Power' },
  { value: '287', label: 'Shopping Online' },
  { value: '028', label: 'คลินิก' },
  { value: '029', label: 'พนักงาน' },
  { value: '027', label: 'สมาชิก' },
];

export function renderActivityOptions() {
  return activityOptions.map(opt => (
    <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
    </Select.Option>
  ));
}
