import axios from 'axios'
import { FALTryOnRequest, FALTryOnResponse } from '../types/index.js'

const FAL_API_KEY = process.env.FAL_API_KEY || ''
const FAL_API_URL = process.env.FAL_API_URL || 'https://fal.run/fal-ai'

if (!FAL_API_KEY) {
  throw new Error('FAL_API_KEY environment variable is required')
}

const falAxios = axios.create({
  baseURL: FAL_API_URL,
  headers: {
    'Authorization': `Key ${FAL_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export const falAIService = {
  async createTryOn(request: FALTryOnRequest): Promise<FALTryOnResponse> {
    try {
      const response = await falAxios.post('/fal-ai/idm-vton', {
        person_image_url: request.person_image_url,
        garment_image_url: request.clothing_image_url,
        description: request.description || 'Virtual try-on generation',
        num_inference_steps: request.num_inference_steps || 20,
        guidance_scale: request.guidance_scale || 2.0,
      })

      return {
        request_id: response.data.request_id,
        status: 'pending',
      }
    } catch (error: any) {
      console.error('FAL.AI API Error:', error.response?.data || error.message)
      
      return {
        request_id: '',
        status: 'failed',
        error: error.response?.data?.detail || 'Failed to create try-on request',
      }
    }
  },

  async getTryOnStatus(requestId: string): Promise<FALTryOnResponse> {
    try {
      const response = await falAxios.get(`/fal-ai/idm-vton/requests/${requestId}`)
      
      const data = response.data
      
      if (data.status === 'completed' && data.outputs?.length > 0) {
        return {
          request_id: requestId,
          status: 'completed',
          result: {
            image_url: data.outputs[0].image.url,
          },
        }
      }
      
      return {
        request_id: requestId,
        status: data.status || 'pending',
      }
    } catch (error: any) {
      console.error('FAL.AI Status Check Error:', error.response?.data || error.message)
      
      return {
        request_id: requestId,
        status: 'failed',
        error: error.response?.data?.detail || 'Failed to check try-on status',
      }
    }
  },

  async pollTryOnResult(requestId: string, maxAttempts: number = 30, intervalMs: number = 2000): Promise<FALTryOnResponse> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const result = await this.getTryOnStatus(requestId)
      
      if (result.status === 'completed' || result.status === 'failed') {
        return result
      }
      
      attempts++
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    }
    
    return {
      request_id: requestId,
      status: 'failed',
      error: 'Timeout: Try-on processing took too long',
    }
  },

  async cancelTryOn(requestId: string): Promise<boolean> {
    try {
      await falAxios.delete(`/fal-ai/idm-vton/requests/${requestId}`)
      return true
    } catch (error: any) {
      console.error('FAL.AI Cancel Error:', error.response?.data || error.message)
      return false
    }
  },

  async getApiUsage(): Promise<any> {
    try {
      const response = await falAxios.get('/usage')
      return response.data
    } catch (error: any) {
      console.error('FAL.AI Usage Error:', error.response?.data || error.message)
      throw new Error('Failed to get API usage information')
    }
  },
}