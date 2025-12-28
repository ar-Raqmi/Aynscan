const CF_ACCOUNT_ID = import.meta.env.VITE_CF_ACCOUNT_ID;
const CF_API_TOKEN = import.meta.env.VITE_CF_API_TOKEN;
const MODEL_ID = '@cf/meta/llama-3.2-11b-vision-instruct';

const resizeImageToBase64 = async (file: File, maxDimension = 1920): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface CloudflareAIResponse {
  success: boolean;
  result: {
    response: string;
  };
}

export const extractTextFromImage = async (file: File): Promise<string> => {
  console.log("[CF DEBUG] Starting extraction for:", file.name);
  
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error("[CF DEBUG] Missing Credentials", { CF_ACCOUNT_ID, CF_API_TOKEN });
    throw new Error("Missing Cloudflare Credentials. Please set VITE_CF_ACCOUNT_ID and VITE_CF_API_TOKEN.");
  }

  const base64Data = await resizeImageToBase64(file, 1920);
  console.log("[CF DEBUG] Base64 length:", base64Data.length);

  const endpoint = `/api/cf/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_ID}`;
  console.log("[CF DEBUG] Endpoint:", endpoint);

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      console.log(`[CF DEBUG] Attempt ${attempt + 1}/${maxRetries}`);
      
      const payload = {
        prompt: "Perform OCR on this image. Return ONLY the raw text found in the document. Do not add markdown formatting, do not add introductory phrases. If there is no text, return 'No text detected'.",
        image: base64Data,
        max_tokens: 1024
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (CF_API_TOKEN) {
        headers['Authorization'] = `Bearer ${CF_API_TOKEN}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      console.log("[CF DEBUG] Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[CF DEBUG] Error Response Body:", errorText);
        
        if (response.status === 429 || response.status >= 500) {
            throw new Error(`Cloudflare API Error ${response.status}: ${errorText}`);
        }
        throw new Error(`Cloudflare API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json() as CloudflareAIResponse;
      console.log("[CF DEBUG] Success Result:", result);
      
      if (result.success && result.result && result.result.response) {
          return result.result.response;
      } else if (result.result && result.result.response) {
          return result.result.response;
      } else {
          console.error("Unexpected Cloudflare response:", result);
          return "Error: Could not parse response. See console for details.";
      }

    } catch (error: any) {
      attempt++;
      console.warn(`Cloudflare AI Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const waitTime = 1000 * attempt;
        await delay(waitTime);
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error("Failed to process image after multiple attempts.");
};