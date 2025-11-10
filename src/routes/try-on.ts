import { Router, Request, Response } from 'express'
import { tryOnService } from '../services/try-on.js'
import { falAIService } from '../services/fal-ai.js'
import { wardrobeService } from '../services/wardrobe.js'
import { APIResponse } from '../types/index.js'

const router = Router()

interface AuthenticatedRequest extends Request {
  user?: { id: string }
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: any) => {
  const userId = req.headers['x-user-id'] as string
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'User ID is required in x-user-id header'
    })
  }
  
  req.user = { id: userId }
  next()
}

router.post('/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { wardrobe_id, person_image_url, clothing_image_url } = req.body
    const userId = req.user!.id

    if (!wardrobe_id || !person_image_url || !clothing_image_url) {
      return res.status(400).json({
        success: false,
        error: 'wardrobe_id, person_image_url, and clothing_image_url are required'
      })
    }

    const tryOn = await tryOnService.createTryOn(userId, {
      wardrobe_id,
      person_image_url,
      clothing_image_url,
    })

    const falResponse = await falAIService.createTryOn({
      person_image_url,
      clothing_image_url,
    })

    if (falResponse.status === 'failed') {
      await tryOnService.updateProcessingStatus(tryOn.id, 'failed')
      return res.status(500).json({
        success: false,
        error: falResponse.error || 'Failed to create try-on'
      })
    }

    await tryOnService.updateProcessingStatus(
      tryOn.id, 
      'processing', 
      undefined, 
      falResponse.request_id
    )

    setTimeout(async () => {
      try {
        const result = await falAIService.pollTryOnResult(falResponse.request_id, 30, 2000)
        
        if (result.status === 'completed' && result.result) {
          await tryOnService.updateProcessingStatus(
            tryOn.id, 
            'completed', 
            result.result.image_url
          )
          
          await wardrobeService.addToWardrobe(userId, tryOn.id)
        } else {
          await tryOnService.updateProcessingStatus(tryOn.id, 'failed')
        }
      } catch (error) {
        console.error('Background processing error:', error)
        await tryOnService.updateProcessingStatus(tryOn.id, 'failed')
      }
    }, 0)

    const response: APIResponse<typeof tryOn> = {
      success: true,
      data: tryOn
    }

    res.status(201).json(response)
  } catch (error: any) {
    console.error('Create try-on error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to create try-on'
    }
    
    res.status(500).json(response)
  }
})

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const tryOns = await tryOnService.getTryOns(userId)

    const response: APIResponse<typeof tryOns> = {
      success: true,
      data: tryOns
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get try-ons error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get try-ons'
    }
    
    res.status(500).json(response)
  }
})

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const tryOn = await tryOnService.getTryOn(userId, id)

    const response: APIResponse<typeof tryOn> = {
      success: true,
      data: tryOn
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get try-on error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get try-on'
    }
    
    res.status(500).json(response)
  }
})

router.get('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    const status = await tryOnService.getProcessingStatus(userId, id)

    const response: APIResponse<{ status: string }> = {
      success: true,
      data: { status }
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get try-on status error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get try-on status'
    }
    
    res.status(500).json(response)
  }
})

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    
    await tryOnService.deleteTryOn(userId, id)

    const response: APIResponse<null> = {
      success: true,
      data: null
    }

    res.json(response)
  } catch (error: any) {
    console.error('Delete try-on error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to delete try-on'
    }
    
    res.status(500).json(response)
  }
})

export default router