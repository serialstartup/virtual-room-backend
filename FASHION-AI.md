## FASHN Virtual Try-On v1.6

Virtual Try-On v1.6 enables realistic garment visualization using just a single photo of a person and a garment. It’s our most advanced AI model for try-on experiences, designed to deliver high-quality, detailed results with minimal setup.

POST : https://api.fashn.ai/v1/run

fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "tryon-v1.6",
    inputs: {
      model_image: "http://example.com/path/to/model.jpg",
      garment_image: "http://example.com/path/to/garment.jpg"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});

## Product to Model

Powered by best-in-class image editing AI, the Product to Model endpoint transforms product images into people wearing those products. It supports dual-mode operation: standard product-to-model (generates new person) and try-on mode (adds product to existing person).

This endpoint is designed specifically for wearable fashion items such as clothing, shoes, hats, jewelry, bags, and accessories.

POST : https://api.fashn.ai/v1/run


const response = await fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model_name: "product-to-model",
    inputs: {
      product_image: "http://example.com/path/to/product.jpg",
      model_image: "http://example.com/path/to/person.jpg", // Optional
      prompt: "professional office setting",
      output_format: "png",
      return_base64: false
    }
  })
});
 
const result = await response.json();
console.log('Prediction ID:', result.id);


## Face to Model

The Face to Model endpoint transforms face images into try-on ready upper-body avatars. It converts cropped headshots or selfies into full upper-body representations that can be used in virtual try-on applications when full-body photos are not available, while preserving facial identity.

POST : https://api.fashn.ai/v1/run


fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "face-to-model",
    inputs: {
      face_image: "http://example.com/path/to/headshot.jpg",
      output_format: "jpeg"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Model Create

Model Create enables you to generate realistic fashion models with simple, intuitive prompts or reference images.

fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "model-create",
    inputs: {
      prompt: "Full body shot, woman wearing a white t-shirt and dark blue biker shorts"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Model Variation

Model Variation enables you to create new variations of existing fashion model images. Transform your images with subtle adjustments or strong modifications while maintaining the core composition.


fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "model-variation",
    inputs: {
      model_image: "https://example.com/fashion-model.jpg",
      variation_strength: "subtle"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Model Swap

Model Swap enables you to change the identity of fashion models in existing images while preserving clothing and outfit details exactly as they appear. Transform skin tone, facial features, and hair while maintaining the garments, pose, and styling perfectly intact.

For consistent photoshoots, an optional premium face reference capability lets you swap to a specific identity and achieve repeatable, campaign‑ready results across sets.

fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "model-swap",
    inputs: {
      model_image: "https://example.com/fashion-model.jpg",
      prompt: "Asian woman with blue hair"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Reframe

Reframe enables you to extend and reshape images using generative fill technology. This versatile endpoint offers two distinct modes: directional extension to reveal more content, and aspect ratio adjustment to fit specific canvas dimensions.

fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "reframe",
    inputs: {
      image: "https://example.com/portrait.jpg",
      mode: "direction",
      target_direction: "down"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Image to Video

Image to Video turns a single image into a short motion clip, with tasteful camera work and model movements tailored for fashion. Provide an image and optional instructions to produce engaging 5–10 second videos at up to 1080p.


Credits
Credit consumption depends on the input parameters resolution and duration.

Configuration	Credit Cost
resolution: 480p	1 credit
resolution: 720p	3 credits
resolution: 1080p	6 credits
duration: 10	2× multiplier on base cost


fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "image-to-video",
    inputs: {
      image: "https://example.com/photo.jpg",
      duration: 5,
      resolution: "1080p"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Background Change
Background Change enables you to replace image backgrounds while preserving foreground subjects. The endpoint accurately separates the foreground from the background and applies harmonization so the subject blends seamlessly into the new environment.

fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "background-change",
    inputs: {
      image: "https://example.com/portrait.jpg",
      prompt: "modern office space with large windows"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


## Background Remove

Background Remove enables you to cleanly remove backgrounds from images, creating transparent PNG cutouts of foreground subjects. This classic background removal tool automatically detects and preserves the main subject while eliminating the background.

Model Specifications
Model Name: background-remove
Lifecycle: experimental
Processing Time: 1-3 seconds
Supported Resolution: up to 4MP
Credits: 1


fetch('https://api.fashn.ai/v1/run', {
  method: 'POST',
  body: JSON.stringify({
    model_name: "background-remove",
    inputs: {
      image: "https://example.com/portrait.jpg"
    }
  }),
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});


Credits Balance
The Credits endpoint allows you to retrieve your current FASHN API credits balance. The response includes your total credits, API subscription credits (if you have an active subscription), and any additional on-demand credits you've purchased.

Credit Usage
Subscription Credits: Included with your monthly API plan
On-Demand Credits: Additional credits purchased separately
Total Credits: Combined balance of subscription + on-demand credits


Request
Check your current credits balance by making a GET request to the credits endpoint:

GET
https://api.fashn.ai/v1/credits
Call this endpoint whenever you need to know how many credits you have remaining.

Request Examples
cURL
JavaScript
Python

curl -X GET https://api.fashn.ai/v1/credits \
     -H "Authorization: Bearer YOUR_API_KEY"
Response
200
Example response payload

Response

{
  "credits": {
    "total": 234,
    "subscription": 100,
    "on_demand": 134
  }
}
