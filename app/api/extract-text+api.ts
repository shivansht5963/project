export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return Response.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Call Google Cloud Vision API for text detection
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) {
      return Response.json({ success: false, error: 'Google Cloud Vision API key not set' }, { status: 500 });
    }

    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      throw new Error(`Google Vision API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const visionData = await visionResponse.json();
    const extractedText = visionData.responses?.[0]?.fullTextAnnotation?.text || '';
    const confidence = calculateConfidence(extractedText);

    return Response.json({
      success: true,
      data: {
        text: extractedText,
        confidence,
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process image' 
      },
      { status: 500 }
    );
  }
}

function calculateConfidence(text: string): number {
  if (!text || text.length < 10) return 0.3;
  
  // Basic heuristics for confidence calculation
  const hasNumbers = /\d/.test(text);
  const hasLetters = /[a-zA-Z]/.test(text);
  const hasStructure = /[1-9]\.|[a-zA-Z]\)/.test(text);
  
  let confidence = 0.5;
  if (hasNumbers) confidence += 0.2;
  if (hasLetters) confidence += 0.2;
  if (hasStructure) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}