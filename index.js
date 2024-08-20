const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const tokens = [
  "6046cf8e-2eb8-487d-99a8-e18f62675328", // API Key 1
  "20d6877b-f6a2-4501-adee-27cec8206641", // API Key 2
  "c7d20e0e-2fe0-4c97-8de2-eb32ba150000", // API Key 3
  "2bfd60e8-59e7-4d66-b780-b79b42782175", // API Key 4
  "c6d207ff-cb60-48c2-87ae-87009a80cc9c", // API Key 5
  "18f97175-6bb1-4b01-b34f-489c81972af3", // API Key 6
  "b2bb02b0-1251-452c-a94d-8cc008204555", // API Key 7
  "9cb6873c-26b4-4a97-8ff7-31d272fd9a02", // API Key 8
  "0f099a24-b967-41a6-9ee4-f9fadcaceafc", // API Key 9
  "3315b917-9914-4090-b5bc-d97b4db05284", // API Key 10
  "971f948d-2d80-4152-a5a9-b6883378decf"  // API Key 11
];

let tokenIndex = 0; // Initial token index

// Ajout des modèles dans la configuration
const models = {
  1: {
    name: "AnimagineXL-3.1",
    cfg_scale: 7,
    steps: 28,
    preprompt: "masterpiece, best quality, very aesthetic, absurdres",
    negative_prompt: "lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality"
  },
  2: {
    name: "FluxUnchainedArtfulNSFWcapableflux.dtuned-T5_8x8V1.1",
    cfg_scale: 1,
    steps: 25,
    preprompt: "(best quality, detailled))",
    negative_prompt: "(unhealthy-deformed-joints:2), (unhealthy-hands:2), easynegative, ng_deepnegative_v1_75t"
  },
  // Ajoutez les autres modèles ici
};

const ratioMap = {
          '1:1': { width: 1024, height: 1024 },
        '9:7': { width: 1024, height: 798 },
        '7:9': { width: 798, height: 1024 },
        '19:13': { width: 1024, height: 700 },
        '13:19': { width: 700, height: 1024 },
        '7:4': { width: 1024, height: 585 },
        '4:7': { width: 585, height: 1024 },
        '12:5': { width: 1024, height: 426 },
        '5:12': { width: 426, height: 1024 },
        '16:9': { width: 1024, height: 576 },
        '9:16': { width: 576, height: 1024 }
  // Ajoutez d'autres ratios ici
};

app.get('/generate-image', async (req, res) => {
  const { prompt, styleIndex = 0, ratio = '1:1', cfgScale, steps, key, modelIndex = 1 } = req.query;

  if (!prompt) {
    return res.status(400).send('Prompt is required.');
  }

  // Sélection du modèle en fonction de l'index fourni
  const modelConfig = models[modelIndex];
  if (!modelConfig) {
    return res.status(400).send('Invalid model specified.');
  }

  const style = styleConfig[styleIndex] || {};
  const fullPrompt = `${modelConfig.preprompt}, ${prompt}`;
  const dimensions = ratioMap[ratio] || { width: 1024, height: 1024 };
  const cfg_scale = parseFloat(cfgScale) || modelConfig.cfg_scale;
  const stepCount = parseInt(steps, 10) || modelConfig.steps;

  try {
    let response;
    let success = false;

    const currentToken = key ? tokens[parseInt(key, 10) - 1] : tokens[tokenIndex];

    while (!success) {
      try {
        response = await axios.post('https://api.visioncraft.top/image/generate', {
          model: modelConfig.name,
          prompt: fullPrompt,
          negative_prompt: modelConfig.negative_prompt,
          token: currentToken,
          sampler: 'Euler a',
          steps: stepCount,
          width: dimensions.width,
          height: dimensions.height,
          cfg_scale
        }, {
          responseType: 'stream'
        });

        success = true;
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log("Retrying Generation...");
        } else {
          throw new Error(error.message);
        }
      }
    }

    if (success) {
      const imagePath = path.join(__dirname, 'cache', 'generated_image.png');
      const imageStream = response.data;
      const fileStream = fs.createWriteStream(imagePath);

      if (!fs.existsSync(path.dirname(imagePath))) {
        fs.mkdirSync(path.dirname(imagePath), { recursive: true });
      }

      imageStream.pipe(fileStream);

      fileStream.on('finish', () => {
        res.sendFile(imagePath);
      });

      fileStream.on('error', (err) => {
        console.error("Stream error:", err);
        res.status(500).send('Error generating image.');
      });
    } else {
      res.status(500).send('Error generating image.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }

  if (!key) {
    tokenIndex = (tokenIndex + 1) % tokens.length;
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
