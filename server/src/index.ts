import express from 'express';
import 'dotenv/config';
import recommendRouter from './routes/recommend';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({origin: 'http://localhost:5173'}));

app.get('/health', (req, res) => {
    res.json({status: 'écoute is alive 🎶'});
})

app.use('/recommend', recommendRouter);

app.listen(PORT, () => {
    console.log(`écoute server running on http://localhost:${PORT}`)
});