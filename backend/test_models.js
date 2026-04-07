const axios = require('axios');

async function listModels() {
  try {
    const response = await axios.get(
      'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCjPmcq-yN2R7ce9qB9xqog7JfTQ4WTB0w'
    );
    const models = response.data.models;
    console.log("AVAILABLE MODELS:");
    models.forEach(m => console.log(m.name, m.supportedGenerationMethods.includes('generateContent') ? '(Supports generateContent)' : ''));
  } catch (err) {
    console.error("ERROR", err.response?.data || err.message);
  }
}

listModels();
