import { Router, Request, Response } from 'express'
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

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const wardrobe = await wardrobeService.getWardrobe(userId)

    const response: APIResponse<typeof wardrobe> = {
      success: true,
      data: wardrobe
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get wardrobe error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get wardrobe'
    }
    
    res.status(500).json(response)
  }
})

router.get('/favorites', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const favorites = await wardrobeService.getFavorites(userId)

    const response: APIResponse<typeof favorites> = {
      success: true,
      data: favorites
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get favorites error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get favorites'
    }
    
    res.status(500).json(response)
  }
})

router.get('/disliked', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const disliked = await wardrobeService.getDisliked(userId)

    const response: APIResponse<typeof disliked> = {
      success: true,
      data: disliked
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get disliked error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get disliked items'
    }
    
    res.status(500).json(response)
  }
})

router.get('/undecided', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const undecided = await wardrobeService.getUndecided(userId)

    const response: APIResponse<typeof undecided> = {
      success: true,
      data: undecided
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get undecided error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get undecided items'
    }
    
    res.status(500).json(response)
  }
})

router.get('/stats', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const stats = await wardrobeService.getUserStats(userId)

    const response: APIResponse<typeof stats> = {
      success: true,
      data: stats
    }

    res.json(response)
  } catch (error: any) {
    console.error('Get user stats error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to get user stats'
    }
    
    res.status(500).json(response)
  }
})

router.post('/toggle-like', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { try_on_id } = req.body
    const userId = req.user!.id

    if (!try_on_id) {
      return res.status(400).json({
        success: false,
        error: 'try_on_id is required'
      })
    }

    const wardrobe = await wardrobeService.toggleLike(userId, try_on_id)

    const response: APIResponse<typeof wardrobe> = {
      success: true,
      data: wardrobe
    }

    res.json(response)
  } catch (error: any) {
    console.error('Toggle like error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to toggle like'
    }
    
    res.status(500).json(response)
  }
})

router.post('/toggle-dislike', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { try_on_id } = req.body
    const userId = req.user!.id

    if (!try_on_id) {
      return res.status(400).json({
        success: false,
        error: 'try_on_id is required'
      })
    }

    const wardrobe = await wardrobeService.toggleDislike(userId, try_on_id)

    const response: APIResponse<typeof wardrobe> = {
      success: true,
      data: wardrobe
    }

    res.json(response)
  } catch (error: any) {
    console.error('Toggle dislike error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to toggle dislike'
    }
    
    res.status(500).json(response)
  }
})

router.post('/:tryOnId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tryOnId } = req.params
    const { liked } = req.body
    const userId = req.user!.id

    const wardrobe = await wardrobeService.addToWardrobe(userId, tryOnId, liked)

    const response: APIResponse<typeof wardrobe> = {
      success: true,
      data: wardrobe
    }

    res.status(201).json(response)
  } catch (error: any) {
    console.error('Add to wardrobe error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to add to wardrobe'
    }
    
    res.status(500).json(response)
  }
})

router.put('/:tryOnId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tryOnId } = req.params
    const { liked } = req.body
    const userId = req.user!.id

    const wardrobe = await wardrobeService.updateWardrobeItem(userId, tryOnId, { liked })

    const response: APIResponse<typeof wardrobe> = {
      success: true,
      data: wardrobe
    }

    res.json(response)
  } catch (error: any) {
    console.error('Update wardrobe item error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to update wardrobe item'
    }
    
    res.status(500).json(response)
  }
})

router.delete('/:tryOnId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tryOnId } = req.params
    const userId = req.user!.id

    await wardrobeService.removeFromWardrobe(userId, tryOnId)

    const response: APIResponse<null> = {
      success: true,
      data: null
    }

    res.json(response)
  } catch (error: any) {
    console.error('Remove from wardrobe error:', error)
    
    const response: APIResponse<never> = {
      success: false,
      error: error.message || 'Failed to remove from wardrobe'
    }
    
    res.status(500).json(response)
  }
})

export default router