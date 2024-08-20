const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const tokens = [
"6046cf8e-2eb8-487d-99a8-e18f62675328",
"20d6877b-f6a2-4501-adee-27cec8206641",
"c7d20e0e-2fe0-4c97-8de2-eb32ba150000",
"2bfd60e8-59e7-4d66-b780-b79b42782175",
"c6d207ff-cb60-48c2-87ae-87009a80cc9c",
"18f97175-6bb1-4b01-b34f-489c81972af3",
"b2bb02b0-1251-452c-a94d-8cc008204555",
"9cb6873c-26b4-4a97-8ff7-31d272fd9a02",
"0f099a24-b967-41a6-9ee4-f9fadcaceafc",
"3315b917-9914-4090-b5bc-d97b4db05284",
"971f948d-2d80-4152-a5a9-b6883378decf"  ];
let tokenIndex = 0; // Initial token index

// Define models with their specific parameters
const models = {
  1: {
    name: "AnimagineXL-3.1",
    cfg_scale: 10,
    steps: 30,
    negative_prompt: "lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality,censored, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
    pre_prompt: "masterpiece, best quality, very aesthetic, absurdres"
  },
  2: {
    name: "abyssorangeMixNSFW-2",
    cfg_scale: 7,
    steps: 21,
    negative_prompt: "(worst quality:1.3), (low quality:1.3), (lowres:1.1), (monochrome:1.1), (greyscale), multiple views, censored, comic, sketch, animal ears, pointy ears, (blurry:1.1), transparent, see-through",
    pre_prompt: "absurdres, (realistic:0.75), (waving:0.9),<lora:obsidianSkin_v1:0.90>"
  },
   3: {
    name: "OxalisAnimeHentaiModel-OAH-1",
    cfg_scale: 7,
    steps: 30,
    negative_prompt: "low quality, censored, worst quality, AnimeSupport-neg, Anti3dReality, bad_prompt_version2-neg, By bad artist -neg, EasyNegativeV2, FastNegativeV2, NGH, NIV-neg, SimpleNegativeV3, verybadimagenegative_v1.3",
    pre_prompt: "anime screencap, uncensored, masterpiece, best quality, high quality, detailled"
  },
   4: {
    name: "Grapefruithentaimodel-V41ckpt",
    cfg_scale: 7,
    steps: 20,
    negative_prompt: "(worst quality, low quality:1.4)",
    pre_prompt: "masterpiece, best quality, detailled"
  },
   5: {
    name: "ChilloutMix-Ni",
    cfg_scale: 7,
    steps: 25,
    negative_prompt: "(worst quality, low quality:1.3), makeup, mole under eye, mole, logo, watermark, text,paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), backlight, glasses, anime, cartoon, drawing, illustration, boring, 3d render, long neck, out of frame, extra fingers, mutated hands, monochrome, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, glitchy, bokeh, (((long neck))), 3D, 3DCG, cgstation, ((flat chested)), red eyes, extra heads, close up, man asian, text ,watermarks, logo",
    pre_prompt: "unparalleled masterpiece, ultra realistic 8k CG, perfect artwork, ((perfect female figure)), narrow waist, looking at viewer, seductive posture, sexy pose, alluring, clean, beautiful face, pure face, pale skin, ( nsfw, shiny skin, intricate detail, gorgeous"
  },
   6: {
    name: "3DCartoon-V10",
    cfg_scale: 7,
    steps: 30,
    negative_prompt: "bare shoulders, (extra fingers, deformed hands, polydactyl:1.5), (ugly, worst quality, low quality, low-res, jpeg, jpeg artifacts, poorly drawn:2.0), (extra fingers, deformed hands, polydactyl:1.5), cross-eyed, closed eyes, ng-bad_artist, ng-bad_artist_anime, ng-bad_dream, ng-beyond_negative-v1.2, ng-deepnegative-v1.75t, ng-easynegative-v2, ng-new_negative-v1.4, ng-unrealistic_dream, ng-unspeakable-horrors-64v, artist logo, signature, watermark, sign, text,censored",
    pre_prompt: "(masterpiece:1.2), best quality,"
  },
   7: {
    name: "DreamMix-toon-v10",
    cfg_scale: 7,
    steps: 20,
    negative_prompt: "EasyNegative, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, ((monochrome)), ((grayscale)), skin spots, acnes, age spots, extra fingers, fewer fingers, strange fingers, bad hand, ((((bad anatomy)))), bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username, sunburn, ((simple background)), hermaphrodite, long neck, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad proportions, malformed limbs, extra limbs, cloned face, disfigured, gross proportions, (((missing arms))), (((missing legs))), (((extra arms))), (((extra legs))), (((extra breasts))), (((extra nipples))), plump, bad legs, error legs, bad feet, (identical twins),((misaligned nails)),((misaligned fingers)),((wrinkled knees )),(uneven skin tone), ((head wear)),((bruised knee))",
    pre_prompt: "(masterpiece:1.1), (highest quality:1.1), (HDR:1.0), extreme quality, detailed face+eyes"
  },
  8: {
    name: "Ambientmix-v10",
    cfg_scale: 8,
    steps: 20,
    negative_prompt: "worst quality, low quality, monochrome, normal quality, blurry, EasyNegative, Beyondv4-neg, bad-hands-5, negative_hand-neg,ng_deepnegative_v1_75t, ((bad anatomy:2)), ((bad hands:2)), ((bad fingers:2)), ((mutation:2)), ((disproportionate body:2)), ((bad legs:2)), ((bad feet:2)), (extra fingers:2), (missing limb:2), ((text)), ((spilit view)), ((two shot)), ((censored:2)),",
    pre_prompt: "(masterpiece)+,(best quality)+,(ultra detailled)+ looking at viewer"
  },
9: {
    name: "AAM-AnyLoRAAnimeMix-V1",
    cfg_scale: 9,
    steps: 25,
    negative_prompt: "(bad-hands-5: 1),  EasyNegative,(worst quality, low quality:1.4), blurry, lowres, jpeg artifacts,deformed, extra limbs, loli, censored,(watermark, logo, letters, numbers, text, signature, username, artist name, title: 1.4),",
    pre_prompt: "masterpiece, absurdres, best quality, high quality, detailled, perfect body, perfect hands, perfect eyes, high quality"
  },
  10: {
    name: "Koji-V21",
    cfg_scale: 8,
    steps: 20,
    negative_prompt: "(bad-hands-5: 1),  EasyNegative,(worst quality, low quality:1.4), blurry, lowres, jpeg artifacts,deformed, extra limbs, loli, censored,(watermark, logo, letters, numbers, text, signature, username, artist name, title: 1.4),",
    pre_prompt: "(masterpiece, best quality: 1.4, detailed),<lora:w1d3sl1ng3-000009: 1>"
  },
  11: {
    name: "Sudachi-V1",
    cfg_scale: 7,
    steps: 20,
    negative_prompt: "(worst quality, lowres:1.3), 3d",
    pre_prompt: " "
  },
 12: {
    name: "MeinaHentai-V5",
    cfg_scale: 7,
    steps: 30,
    negative_prompt: "(worst quality, low quality:1.4), (interlocked fingers:1.2), monochrome, zombie, signature, watermark",
    pre_prompt: "(masterpiece, best quality, 8k, detailed, perfect eyes)"
  },
13: {
    name: "SilkHentai-v20",
    cfg_scale: 16,
    steps: 21,
    negative_prompt: "easynegative, ng_deepnegative_v1_75t, bad-hands-5, completely nude, (connected limbs:1.3), mask,",
    pre_prompt: " "
  },
14: {
    name: "SakushiMix-Hentai-v30",
    cfg_scale: 6,
    steps: 25,
    negative_prompt: "(worst quality, low quality:1.4), monochrome, zombie, (interlocked fingers),",
    pre_prompt: "(masterpiece, best quality, chromatic aberration)"
  },

  15: {
    name: "Hassakuhentaimodel-V13",
    cfg_scale: 7,
    steps: 25,
    negative_prompt: "censored",
    pre_prompt: "best quality, masterpiece, detailled"
  },
  16: {
    name: "AstrAnime-v5",
    cfg_scale: 7,
    steps: 20,
    negative_prompt: "easynegative, ng_deepnegative_v1_75t, (worst quality:2), (low quality:2),(normal quality:2), lowres, bad anatomy, badhandv4, ((extra limbs)), ((extra legs)), ((fused legs)), ((extra arms)), ((fused arms)), normal quality, ((monochrome)), ((grayscale)), ((watermark)), uneven eyes, lazy eye,bad-hands-5, (((mutated hand))),",
    pre_prompt: "masterpiece,"
  },
  
17: {
    name: "SD3-medium",
    cfg_scale: 4,
    steps: 28,
    negative_prompt: "bad quality",
    pre_prompt: "detailled"
  },
  18: {
    name: "SilkHentai-v20",
    cfg_scale: 10,
    steps: 28,
    negative_prompt: "easynegative, ng_deepnegative_v1_75t, bad-hands-5, completely nude, (connected limbs:1.3), mask,",
    pre_prompt: " "
  },
  19: {
    name: "FluxUnchainedArtfulNSFWcapableflux.dtuned-T5_8x8V1.1",
    cfg_scale: 1,
    steps: 25,
    negative_prompt: "(unhealthy-deformed-joints:2), (unhealthy-hands:2), easynegative, ng_deepnegative_v1_75t, (worst quality:2), (low quality:2),(normal quality:2), lowres, bad anatomy, badhandv4, ((extra limbs)), ((extra legs)), ((fused legs)), ((extra arms)), ((fused arms)), normal quality, ((monochrome)), ((grayscale)), ((watermark)), uneven eyes, lazy eye, (((mutated hand))),",
    pre_prompt: "(best quality, detailled))"
  },
  
};

app.get('/generate-image', async (req, res) => {
  const { prompt, modelIndex = 1, sampler = 'Euler a', width = 1024, height = 1024 } = req.query;

  if (!prompt) {
    return res.status(400).send('Prompt is required.');
  }

  const modelConfig = models[modelIndex];
  if (!modelConfig) {
    return res.status(400).send('Invalid model specified.');
  }

  const styledPrompt = `${modelConfig.pre_prompt}, ${prompt}`;

  try {
    let response;
    let success = false;

    // Sélectionner le token actuel
    const currentToken = tokens[tokenIndex];

    while (!success) {
      try {
        response = await axios.post('https://api.visioncraft.top/image/generate', {
          model: modelConfig.name,
          prompt: styledPrompt,
          negative_prompt: modelConfig.negative_prompt,
          token: currentToken,
          sampler,
          steps: modelConfig.steps,
          width,
          height,
          cfg_scale: modelConfig.cfg_scale
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

  // Passer au token suivant
  tokenIndex = (tokenIndex + 1) % tokens.length;
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
