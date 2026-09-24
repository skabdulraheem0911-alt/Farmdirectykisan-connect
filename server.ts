import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Route for Telugu AI Voice Assistant
  app.post('/api/ai/telugu-assistant', async (req, res) => {
    try {
      const { prompt, mode, currentStep, userRole } = req.body;

      const systemInstruction = `మీరు 'ఫార్మ్‌డైరెక్ట్' (FarmDirect) అధికారిక తెలుగు AI వాయిస్ అసిస్టెంట్ ("రైతు మిత్ర").
ఈ యాప్ గ్రామీణ ఆంధ్రప్రదేశ్ మరియు తెలంగాణ ప్రాంతాల్లో రైతులు మరియు వ్యాపారులు దళారులు లేకుండా నేరుగా పంటలు అమ్ముకోవడానికి, కొనడానికి ఉపయోగపడుతుంది.
ముఖ్యమైన విషయం: చాలామంది గ్రామీణ రైతులకు మరియు చిరు వ్యాపారులకు చదవడం, రాయడం రాదు (Illiterate / Non-literate). కాబట్టి వారు మీతో గొంతు ద్వారా (వాయిస్) మాట్లాడి లేదా వింటూ ప్రతి అడుగును సులభంగా పూర్తి చేయాలి.

మీ బాధ్యతలు:
1. మాట్లాడే శైలి: చాలా సరళమైన, ఆప్యాయమైన, గౌరవప్రదమైన గ్రామీణ తెలుగు (ఉదా: "నమస్కారం అండి రైతు సోదరులారా", "బాధపడకండి, నేను మీకు తోడుగా ఉంటాను").
2. సమాధానం ఎప్పుడూ 2 నుండి 3 సరళమైన వాక్యాలలోనే ఉండాలి, ఎందుకంటే దీన్ని వాయిస్ (Text-to-Speech) ద్వారా చదువుతాము. సంక్లిష్టమైన ఇంగ్లీషు పదాలు లేదా కష్టమైన గ్రాంథికం వాడకూడదు.
3. పంట అమ్మకం (Add Produce) అడుగులు:
   - అడుగు 1: ఏ పంట అమ్మాలనుకుంటున్నారు? (టమోటా, ఉల్లిపాయ, మిర్చి, వరి, మొదలైనవి)
   - అడుగు 2: ఎంత పరిమాణం ఉంది? (ఎన్ని కిలోలు లేదా బస్తాలు)
   - అడుగు 3: ఎంత ధర పెట్టాలి? (APMC మార్కెట్ ధరలు చూసి సరసమైన ధర నిర్ణయించడం)
   - అడుగు 4: మీ ఊరు / పొలం లొకేషన్ మరియు పంట ఫోటో తీయడం
   - అడుగు 5: బటన్ నొక్కి మార్కెట్లో ఉంచడం.
4. పంట కొనుగోలు (Buy Produce) అడుగులు:
   - పంటను ఎంచుకోవడం, రైతుతో ఫోన్ లేదా చాట్ ద్వారా మాట్లాడటం, ఎస్క్రో (Escrow) ద్వారా సురక్షిత చెల్లింపు చేయడం, పంట చేతికి రాగానే నిర్ధారించడం.
5. యూజర్ ఏవైనా వివరాలు (ఉదా: "నా దగ్గర 300 కిలోల మిర్చి ఉంది కిలో 120 రూపాయలు") చెబితే, వాటిని ధృవీకరించి, తదుపరి ఏమి చేయాలో చెప్పండి.`;

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({});
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt || 'నమస్కారం రైతు మిత్ర, నాకు సహాయం చేయండి.',
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response.text) {
            return res.json({ reply: response.text });
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed, falling back to local guide response:', apiErr);
        }
      }

      // Contextual smart fallback
      let fallbackText = 'నమస్కారం రైతు సోదరులారా! ఫార్మ్‌డైరెక్ట్ వాయిస్ అసిస్టెంట్ మీకు స్వాగతం పలుకుతోంది. పంట అమ్మడానికి లేదా కొనడానికి పైనున్న బటన్లను తాకండి లేదా మీ గొంతుతో చెప్పండి.';
      if (mode === 'add_produce') {
        fallbackText = 'పంట నమోదు చేయడం చాలా సులభం. మీ పంట పేరు, ఎన్ని కిలోలు ఉన్నాయో, మరియు కిలో ధర ఎంత కావాలో చెప్పండి లేదా స్క్రీన్ పై నమోదు చేయండి.';
      } else if (mode === 'buy_produce') {
        fallbackText = 'పంట కొనడానికి మార్కెట్‌లోని తాజా పంటల జాబితాను చూడండి. రైతుతో నేరుగా చాట్ చేసి, ఎస్క్రో ద్వారా సురక్షితంగా కొనండి.';
      }

      res.json({ reply: fallbackText });
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
