import {Router, Request, Response} from 'express';
import { getRecommendations, RecommendRequest } from '../services/claude';
import { error } from 'node:console';
import { getHistory, saveRecommendations, saveRound, updateRoundScore } from '../db/history';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const {theme, context, vibes} = req.body as RecommendRequest;

    if (!theme) {
        res.status(400).json({error: 'theme is required'});
        return
    }

    try {
        const recommendations = await getRecommendations({theme, context, vibes});
        const roundId = saveRound(theme, vibes);
        saveRecommendations(roundId, recommendations);
        res.json({roundId, recommendations});
    } catch(err){
        console.error(err)
        res.status(500).json({error: 'something went wrong'});
    }
});

router.get('/history', (req: Request, res: Response) => {
    const history = getHistory();
    res.json({history});
});

router.patch('/:id/score', (req: Request,  res: Response) => {
    const roundId = Number(req.params.id);
    const { submittedSong, submittedArtist, score } = req.body as {
        submittedSong: string;
        submittedArtist: string;
        score: number;
    };

    updateRoundScore(roundId, submittedSong, submittedArtist, score);
    res.json({ success: true });
})

export default router;
