const express = require('express');
const { connectToMongoDB } = require('./database/mongoService');
const { LastStatus } = require('./database/schemas');

const app = express();
const PORT = 3000; // 원하는 포트 번호

// MongoDB 연결
connectToMongoDB();

// LastStatus 데이터 조회 API
app.get('/api/data', async (req, res) => {
    try {
        const data = await LastStatus.findOne(); // 가장 최신 데이터 가져오기
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
