const RECIPE_IMAGES: Record<string, string> = {
  'tomato pasta':       'photo-1473093295043-cdd812d0e601',
  'veggie salad':       'photo-1512621776951-a57141f2eefd',
  'garlic bread':       'photo-1549834125-82d3c68f3a31',
  'classic omelette':   'photo-1525351484163-7529414344d8',
  'chicken stir fry':   'photo-1598515213692-3ba0f02fe85a',
  'cucumber raita':     'photo-1565557623262-b51c2513a641',
  'pasta aglio e olio': 'photo-1473093295043-cdd812d0e601',
  'egg fried rice':     'photo-1603133872878-684f208fb84b',
  'banana pancakes':    'photo-1528207776546-365bb710ee93',
  'tomato soup':        'photo-1547592166-23ac45744acd',
}

const FALLBACK = 'photo-1504674900247-0877df9cc836'

export function getRecipeImage(name: string, large?: boolean): string {
  const id = RECIPE_IMAGES[name.toLowerCase()] ?? FALLBACK
  const w = large ? 800 : 480
  const h = large ? 640 : 400
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`
}
