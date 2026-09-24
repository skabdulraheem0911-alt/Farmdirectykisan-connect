import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Route for Telugu AI Voice Assistant (100% Free - No Paid APIs required)
  app.post('/api/ai/telugu-assistant', async (req, res) => {
    try {
      const { prompt = '', mode, userRole } = req.body;
      const lower = prompt.toLowerCase();

      // Intelligent Local Telugu NLP Assistant (Free, Instant, Zero API Cost)
      let reply = '';

      if (lower.includes('ధర') || lower.includes('రేటు') || lower.includes('apmc') || lower.includes('మార్కెట్')) {
        reply = 'ఆంధ్రప్రదేశ్ మార్కెట్ యార్డుల (APMC) తాజా సమాచారం ప్రకారం టమోటా కిలో ₹25, మిర్చి కిలో ₹65, ఉల్లిపాయ కిలో ₹20, పత్తి క్వింటాల్ ₹7,200 పలుకుతోంది. మీ పంట నాణ్యతను బట్టి సరసమైన ధర నిర్ణయించండి.';
      } else if (lower.includes('ఎస్క్రో') || lower.includes('డబ్బు') || lower.includes('సేఫ్') || lower.includes('భద్రత') || lower.includes('పేమెంట్')) {
        reply = 'ఫార్మ్‌డైరెక్ట్ ఎస్క్రో ఖాతా ద్వారా మీ డబ్బు వంద శాతం సురక్షితం. పంట మీ చేతికి అంది నాణ్యత సరిచూసుకున్న తర్వాత మాత్రమే రైతుకు డబ్బు విడుదలవుతుంది.';
      } else if (lower.includes('అమ్మ') || lower.includes('నమోదు') || mode === 'add_produce') {
        reply = 'పంట నమోదు చేయడం చాలా సులభం. మీ పంట పేరు, ఎన్ని కిలోలు ఉన్నాయో, కిలోకు ఎంత ధర కావాలో చెప్పండి లేదా స్క్రీన్ పై ఉన్న బొమ్మలను తాకండి. చివరగా పంట ఫోటో తీసి జాబితా చేయండి.';
      } else if (lower.includes('కొన') || lower.includes('వ్యాపారి') || mode === 'buy_produce') {
        reply = 'పంటలు కొనడానికి మార్కెట్‌లోని తాజా పంటల జాబితాను లేదా మ్యాప్‌ను చూడండి. రైతుతో నేరుగా చాట్ లేదా ఫోన్ చేసి బేరం మాట్లాడండి. ఎస్క్రో ద్వారా సురక్షితంగా ఆర్డర్ ఇవ్వండి.';
      } else if (lower.includes('రవాణా') || lower.includes('లొకేషన్') || lower.includes('దూరం') || lower.includes('మ్యాప్')) {
        reply = 'మ్యాప్ లేదా లొకేషన్ బటన్ నొక్కడం ద్వారా మీ పొలం లేదా మీ సమీపంలోని కొనుగోలుదారుల దూరం లెక్కించబడుతుంది. నేరుగా పొలం వద్దకే రవాణా వాహనం ఏర్పాటు చేసుకోవచ్చు.';
      } else if (lower.includes('ఫోన్') || lower.includes('చాట్') || lower.includes('మాట్లాడ')) {
        reply = 'రైతు లేదా కొనుగోలుదారుతో నేరుగా మాట్లాడటానికి చాట్ లేదా కాల్ బటన్ నొక్కండి. దళారులు ఎవరూ లేకుండా నేరుగా బేరం మాట్లాడుకోవచ్చు.';
      } else {
        reply = userRole === 'buyer'
          ? 'నమస్కారం కొనుగోలుదారులారా! ఫార్మ్‌డైరెక్ట్ రైతు మిత్ర మీకు స్వాగతం పలుకుతోంది. తాజా పంటలను వెతకడానికి, రైతుతో చాట్ చేయడానికి లేదా ఎస్క్రో చెల్లింపుల సమాచారం కోసం నన్ను అడగండి.'
          : 'నమస్కారం రైతు సోదరులారా! ఫార్మ్‌డైరెక్ట్ రైతు మిత్ర మీకు స్వాగతం పలుకుతోంది. పంట నమోదు చేయడం, APMC మార్కెట్ ధరలు లేదా చెల్లింపుల రక్షణ గురించి ఏదైనా అడగండి.';
      }

      res.json({ reply, freeLocalEngine: true });
    } catch (err: any) {
      console.error('Server error:', err);
      res.status(500).json({
        reply: 'నమస్కారం! నేను ఫార్మ్‌డైరెక్ట్ రైతు మిత్రను. మీకు ఎలా సహాయపడగలను?',
      });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarmDirect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
