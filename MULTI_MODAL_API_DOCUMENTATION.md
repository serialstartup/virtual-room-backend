# Virtual Room - Multi-Modal AI Try-On Platform API

## 🎯 Overview
The Virtual Room Multi-Modal AI Try-On Platform provides a comprehensive suite of APIs for creating AI-powered fashion experiences. The platform supports multiple workflows targeting both consumers (B2C) and business users (B2B).

## 🔗 Base URL
```
http://localhost:3001/api
```

## 🔐 Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Categories

### 1. 👤 Avatar Management (`/avatars`)
Create and manage AI avatars from face photos using Face-to-Model technology.

### 2. 🎨 Custom Models (`/custom-models`) 
Generate custom fashion models from text descriptions or product images.

### 3. 🎯 Try-On Workflows (`/try-on`)
Multiple try-on approaches for different use cases.

### 4. 👕 Wardrobe Management (`/wardrobe`)
Save and organize try-on results.

---

## 👤 Avatar Management API

### Create Avatar
**POST** `/avatars`

Create a new AI avatar from a face photo.

**Request Body:**
```json
{
  "name": "My AI Avatar",
  "face_image_url": "data:image/jpeg;base64,..." // or URL
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My AI Avatar",
    "face_image_url": "...",
    "status": "processing",
    "is_primary": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get All Avatars
**GET** `/avatars`

Returns all avatars for the authenticated user.

### Get Avatar by ID
**GET** `/avatars/:id`

### Get Primary Avatar
**GET** `/avatars/primary`

Returns the user's primary/default avatar.

### Update Avatar
**PUT** `/avatars/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_primary": true
}
```

### Set Avatar as Primary
**POST** `/avatars/:id/set-primary`

### Get Avatar Status
**GET** `/avatars/:id/status`

Check processing status of avatar creation.

### Retry Avatar Creation
**POST** `/avatars/:id/retry`

### Delete Avatar
**DELETE** `/avatars/:id`

---

## 🎨 Custom Models API

### Create Custom Model
**POST** `/custom-models`

**For Text-to-Model:**
```json
{
  "name": "Summer Casual Look",
  "prompt": "Full body shot, woman wearing white t-shirt and blue jeans",
  "model_type": "model-create"
}
```

**For Product-to-Model:**
```json
{
  "name": "Nike Sneaker Model",
  "prompt": "professional studio setting",
  "model_type": "product-to-model",
  "product_image": "data:image/jpeg;base64,..."
}
```

### Get All Custom Models
**GET** `/custom-models`

### Get Model by ID
**GET** `/custom-models/:id`

### Get Model Status
**GET** `/custom-models/:id/status`

### Update Model
**PUT** `/custom-models/:id`

### Retry Model Creation
**POST** `/custom-models/:id/retry`

### Delete Model
**DELETE** `/custom-models/:id`

---

## 🎯 Try-On Workflows API

### 1. Classic Try-On
**POST** `/try-on/classic`

Traditional virtual try-on with user photo and garment.

**Request Body:**
```json
{
  "self_image": "data:image/jpeg;base64,...", // or model_image
  "dress_image": "data:image/jpeg;base64,...", // or dress_description
  "dress_description": "red summer dress" // optional
}
```

### 2. Product-to-Model Showcase
**POST** `/try-on/product-to-model`

Generate model showcase for business product images.

**Request Body:**
```json
{
  "product_image": "data:image/jpeg;base64,...",
  "product_name": "Nike Air Max",
  "scene_prompt": "modern urban street setting"
}
```

### 3. Text-to-Fashion
**POST** `/try-on/text-to-fashion`

Create complete fashion looks from text descriptions.

**Request Body:**
```json
{
  "fashion_description": "elegant black evening dress with silver accessories",
  "scene_prompt": "luxurious hotel lobby"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "model": {
      "id": "uuid",
      "name": "Text Fashion - 1/1/2024",
      "status": "processing"
    }
  }
}
```

### 4. Avatar Try-On
**POST** `/try-on/avatar`

Use saved avatars for consistent try-on experiences.

**Classic Avatar Try-On:**
```json
{
  "avatar_id": "uuid",
  "garment_image_url": "data:image/jpeg;base64,...",
  "try_on_type": "classic"
}
```

**Text-to-Fashion Avatar Try-On:**
```json
{
  "avatar_id": "uuid", 
  "garment_description": "red leather jacket with black jeans",
  "try_on_type": "text-to-fashion"
}
```

### Common Try-On Endpoints

**Get Try-On Status**
**GET** `/try-on/:id/status`

**Get Try-On by ID**
**GET** `/try-on/:id`

**Get All Try-Ons**
**GET** `/try-on`

**Delete Try-On**
**DELETE** `/try-on/:id`

---

## 👕 Wardrobe Management API

### Add to Wardrobe
**POST** `/wardrobe`

```json
{
  "try_on_id": "uuid",
  "liked": true
}
```

### Get User Wardrobe
**GET** `/wardrobe`

### Update Wardrobe Item
**PUT** `/wardrobe/:try_on_id`

```json
{
  "liked": false
}
```

### Remove from Wardrobe
**DELETE** `/wardrobe/:try_on_id`

### Get User Stats
**GET** `/wardrobe/stats`

---

## 💳 System API

### Get Credits Balance
**GET** `/try-on/credits`

### Get Available Models
**GET** `/models`

### Get Model by ID
**GET** `/models/:id`

---

## 📊 Status Values

### Avatar/Model Status
- `processing`: Being generated by Fashion AI
- `completed`: Successfully created
- `failed`: Creation failed (can be retried)

### Try-On Status
- `pending`: Waiting to start
- `processing`: Being processed by Fashion AI
- `completed`: Successfully completed
- `failed`: Processing failed

---

## 🔄 Workflows & Use Cases

### 🎯 B2C Consumer Workflows

#### 1. Personal Try-On
1. Upload selfie → Create Avatar
2. Select/upload garment → Classic Try-On
3. Save favorites → Wardrobe

#### 2. AI Influencer Content
1. Upload face photo → Create Avatar  
2. Set as primary avatar
3. Use Text-to-Fashion for different outfits
4. Consistent avatar across all content

### 🏢 B2B Business Workflows

#### 1. Product Showcase
1. Upload product image → Product-to-Model
2. Generate professional model photos
3. Use for marketing materials

#### 2. Virtual Catalog
1. Bulk product uploads → Multiple Product-to-Model
2. Create comprehensive product showcases
3. Export for e-commerce platforms

---

## 📝 Best Practices

### Image Requirements
- **Face Photos**: Clear, well-lit, front-facing
- **Product Images**: High-quality, good lighting, cropped tightly
- **Garment Images**: Clear product shots, minimal background

### Text Prompts
- **Model Create**: Detailed descriptions including pose, lighting, scene
- **Product-to-Model**: Scene context and lighting preferences  
- **Text-to-Fashion**: Complete outfit descriptions with styling details

### Processing Times
- **Face-to-Model**: 3-8 minutes
- **Model Create**: 8-15 minutes
- **Product-to-Model**: 3-10 minutes
- **Classic Try-On**: 2-5 minutes

### Rate Limits
- Avatar/Model Creation: 10 requests/hour per user
- Try-On Operations: 50 requests/hour per user
- Status Checks: Unlimited

---

## ❌ Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Common HTTP Status Codes
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found (resource doesn't exist)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## 🧪 Testing with POSTMAN

1. **Import Collection**: `Virtual_Room_Multi_Modal_AI.postman_collection.json`
2. **Set Variables**:
   - `base_url`: `http://localhost:3001/api`
   - `auth_token`: Your JWT token
3. **Run Authentication** → Login to set token automatically
4. **Test Workflows** → Use the organized folder structure

### Testing Order
1. 🔐 Authentication → Login
2. 👤 Avatar Management → Create Avatar  
3. 🎨 Custom Models → Create Text-to-Model
4. 🎯 Try-On Workflows → Test different workflows
5. 👕 Wardrobe → Save favorites

---

## 🔮 Future Enhancements

### Planned Features
- **Video Try-On**: Convert static results to video
- **Body Shape Customization**: Adjust avatar body types
- **Style Recommendations**: AI-powered styling suggestions  
- **Batch Processing**: Multiple try-ons simultaneously
- **3D Avatar Support**: Three-dimensional avatar creation

### API Versioning
Current version: `v2.0.0`
- Backward compatibility maintained for v1 endpoints
- New multi-modal features available in v2+

---

## 💡 Tips for Integration

### Frontend Integration
- Use status polling for long-running operations
- Implement proper loading states
- Cache completed avatars/models for better UX
- Handle rate limits gracefully

### Business Integration
- Use webhooks for processing completion (coming soon)
- Implement proper error handling and retries
- Monitor credit usage for cost control
- Consider user limits for free tier

### Performance Optimization
- Compress images before upload
- Use avatars instead of re-uploading photos
- Batch multiple operations when possible
- Implement proper caching strategies