// backend/index.ts (หรือ backend/app.js)
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// const productItemsMap = {
//   'Medical-Antihistamine': [
//     { id: 'med1', name: 'Antihistamine A' },
//     { id: 'med2', name: 'Antihistamine B' },
//   ],
//   'Medical-Acne/Antibiotic': [
//     { id: 'acne1', name: 'Acne Product 1' },
//     { id: 'acne2', name: 'Antibiotic Product 2' },
//   ],
//   'Medical-Blemish': [{ id: 'blem1', name: 'Blemish Care 1' }],
//   'Supplement-Vitamins': [
//     { id: 'vit1', name: 'Vitamin C' },
//     { id: 'vit2', name: 'Vitamin D' },
//   ],
//   'Topical-Wilma-Cleanser/Toner': [
//     { id: 'clean1', name: 'Cleanser 1' },
//     { id: 'clean2', name: 'Toner 2' },
//   ],
//   'Topical-Wilma-Skin Care': [{ id: 'skin1', name: 'Skin Care 1' }],
//   'Topical-Wilma-Other': [{ id: 'other1', name: 'Other Product 1' }],
// };

// app.get('/api/products', (req, res) => {
//   res.json(productItemsMap);
// });

// const port = 4000;
// app.listen(port, () => {
//   console.log(`Backend API listening on http://localhost:${port}`);
// });
