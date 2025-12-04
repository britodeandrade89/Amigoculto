import { GoogleGenAI } from "@google/genai";
import { GiftSuggestion, Participant } from "../types";
import { QUIZ_QUESTIONS } from "../constants";

export const generateGiftSuggestions = async (
  participant: Participant, 
  manualGift: string, 
  quizAnswers: Record<string, string>
): Promise<GiftSuggestion[]> => {
  
  const answersText = Object.entries(quizAnswers)
    .map(([idx, ans]) => `P: ${QUIZ_QUESTIONS[parseInt(idx)]} R: ${ans}`)
    .join('\n');
  
  const isPet = participant.type === 'pet';

  const prompt = `
    Atue como um Personal Shopper especialista.
    O participante é: ${isPet ? 'UM ANIMAL DE ESTIMAÇÃO (Cachorro)' : 'Um Humano Adulto'}.
    Nome: ${participant.name}.
    
    Analise o perfil e sugira DUAS (2) opções de presentes diferentes que possam ser compradas online.
    
    REGRAS RÍGIDAS (IMPORTANTE):
    1. Limite de R$ 50,00 (Brasil).
    2. Seja Específico (ex: "Jogo Cai não Cai" em vez de "Jogo de Tabuleiro").
    3. PROIBIDO: Itens domésticos chatos (pano de prato, vassoura, tupperware).
    4. Devem ser diferentes da escolha manual: "${manualGift}".
    5. Devem ser diferentes entre si.
    6. Estime o preço médio.
    
    RESPOSTA EM JSON APENAS, com este formato exato:
    {
      "suggestions": [
        {
          "gift": "Nome Produto 1",
          "reason": "Motivo 1",
          "match": 95,
          "estimated_price": "R$ 45,00"
        },
        {
          "gift": "Nome Produto 2",
          "reason": "Motivo 2",
          "match": 88,
          "estimated_price": "R$ 39,90"
        }
      ]
    }
    
    PERFIL:
    ${answersText}
  `;

  try {
    // Check key inside try block to trigger fallback on failure
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing (simulated error to trigger fallback)");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Empty response from AI");

    const parsedResult = JSON.parse(textResponse);
    
    // Enrich with Mercado Livre Links
    return parsedResult.suggestions.map((s: GiftSuggestion) => ({
      ...s,
      mlLink: `https://lista.mercadolivre.com.br/${encodeURIComponent(s.gift)}_PriceRange_0-50`
    }));

  } catch (error) {
    console.warn("Gemini API Error (Using Fallback):", error);
    // Robust Fallback ensures the user never gets stuck in a loop
    return [
      { 
        gift: "Kit de Chocolates Artesanais", 
        reason: "Uma opção deliciosa que agrada a todos.", 
        match: 85, 
        estimated_price: "R$ 40,00", 
        mlLink: "https://lista.mercadolivre.com.br/chocolate-artesanal_PriceRange_0-50" 
      },
      { 
        gift: "Caneca Térmica ou Personalizada", 
        reason: "Útil para o dia a dia e com boa durabilidade.", 
        match: 75, 
        estimated_price: "R$ 45,00", 
        mlLink: "https://lista.mercadolivre.com.br/caneca-termica_PriceRange_0-50" 
      }
    ];
  }
};