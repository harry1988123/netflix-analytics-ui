/**
 * AI Service for generating insights using ChatGPT and Gemini APIs
 */
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Generate insights using OpenAI ChatGPT API
 */
export async function getChatGPTInsights(insightsData) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.')
  }

  // Prepare the prompt with insights data
  const prompt = createInsightsPrompt(insightsData)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data analyst specializing in entertainment viewing patterns. Provide insightful, engaging, and personalized analysis of Netflix viewing data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(error.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No insights generated.'
  } catch (error) {
    console.error('ChatGPT API Error:', error)
    throw error
  }
}

/**
 * Generate insights using Google Gemini API with streaming support
 */
export async function getGeminiInsights(insightsData, onChunk) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
  }

  // Prepare the prompt with insights data
  const prompt = createInsightsPrompt(insightsData)

  try {
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    })

    // Create the full prompt with system instructions
    const fullPrompt = `You are an expert data analyst specializing in entertainment viewing patterns. Provide insightful, engaging, and personalized analysis of Netflix viewing data.\n\n${prompt}`

    // If onChunk callback is provided, use streaming
    if (onChunk) {
      let fullText = ''
      const result = await model.generateContentStream(fullPrompt)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullText += chunkText
        onChunk(chunkText)
      }

      return fullText || 'No insights generated.'
    } else {
      // Fallback to non-streaming for backward compatibility
      const result = await model.generateContent(fullPrompt)
      const response = result.response

      // Extract text from response
      let text = ''
      try {
        text = response.text()
      } catch (error) {
        // Fallback: if response.text() fails, try to extract from raw structure
        if (result.response && result.response.candidates && result.response.candidates[0]) {
          text = result.response.candidates[0].content?.parts?.[0]?.text || ''
        } else if (response.candidates && response.candidates[0]) {
          text = response.candidates[0].content?.parts?.[0]?.text || ''
        }
      }

      return text || 'No insights generated.'
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error(error.message || 'Failed to generate insights from Gemini API')
  }
}

/**
 * Create a comprehensive prompt from insights data
 */
function createInsightsPrompt(insightsData) {
  const {
    yearlyData = [],
    monthlyPatternData = [],
    topTitlesByMainTitle = [],
    dayOfWeekData = [],
    totalViews = 0,
    uniqueTitles = 0,
    replayRate = 0,
    mostActiveMonths = [],
    leastActiveMonths = [],
    peakYears = []
  } = insightsData

  return `Analyze the following Netflix viewing history data and provide personalized insights:

**Summary Statistics:**
- Total Items Watched: ${totalViews.toLocaleString()}
- Unique Titles: ${uniqueTitles.toLocaleString()}
- Replay Rate: ${replayRate.toFixed(1)}%

**Yearly Viewing:**
${yearlyData.map(y => `- ${y.year}: ${y.count.toLocaleString()} views`).join('\n')}
${peakYears.length > 0 ? `Peak Activity Years: ${peakYears.join(', ')}` : ''}

**Monthly Patterns:**
Most Active Months: ${mostActiveMonths.join(', ') || 'N/A'}
Least Active Months: ${leastActiveMonths.join(', ') || 'N/A'}

**Top Shows/Franchises:**
${topTitlesByMainTitle.slice(0, 10).map((t, i) => `${i + 1}. ${t.name}: ${t.count.toLocaleString()} episodes`).join('\n')}

**Day of Week Viewing:**
${dayOfWeekData.map(d => `- ${d.day}: ${d.count.toLocaleString()} views`).join('\n')}

Please provide:
1. A personalized summary of viewing habits
2. Interesting patterns and trends you notice
3. Recommendations based on the viewing data
4. Fun facts or observations about their entertainment preferences

Format your response in a friendly, engaging manner with clear sections.`
}

