import { GoogleGenAI } from "@google/genai";
import { InsuranceClaim } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeClaimRisk = async (claim: InsuranceClaim): Promise<string> => {
  try {
    const prompt = `
      Actúa como un auditor senior de fraudes médicos. Analiza el siguiente registro de reclamación de seguro de salud que ha sido marcado como POTENCIAL FRAUDE por nuestro algoritmo heurístico.

      Datos de la Reclamación:
      - ID Transacción: ${claim.id}
      - Diagnóstico (CIE-10): ${claim.diagnosisCode}
      - Procedimiento: ${claim.procedureCode}
      - Monto Reclamado: $${claim.claimAmount}
      - Score de Riesgo Calculado: ${claim.riskScore.toFixed(2)}
      - Proveedor ID: ${claim.providerId}

      Por favor, proporciona un análisis técnico breve (máximo 1 párrafo) explicando por qué este patrón podría indicar un comportamiento fraudulento (ej. upcoding, servicios no necesarios, montos atípicos para el diagnóstico). Usa un tono formal y técnico.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis detallado.";
  } catch (error) {
    console.error("Error analyzing claim with Gemini:", error);
    return "Error al conectar con el servicio de análisis inteligente. Verifique su conexión o clave API.";
  }
};
