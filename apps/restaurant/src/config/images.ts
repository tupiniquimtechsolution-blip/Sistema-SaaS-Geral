/**
 * ============================================================
 * IMAGENS — única fonte de assets visuais do site
 * ------------------------------------------------------------
 * Estabelecimento: fotos REAIS do Chez Amis Bistrô (Google
 * Fotos/Maps — hotlink com resolução ajustável no sufixo).
 * Pratos/equipe: fotografias demonstrativas coerentes com o
 * segmento (substituir pelas fotos oficiais — ver
 * CLIENT_REPLACEMENT_GUIDE.md). Nenhum componente referencia
 * imagem diretamente.
 * ============================================================
 */

/** Fotos reais do estabelecimento (Google) */
export const googlePhotos = {
  /** capa / fachada-salão */
  cover:
    "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnE8qT6KjPPOWV9saerNy9biLXRsNWq0pKAchpaZ1YI-2oczM6Ksnrt9bDNDBLlQqjhg2BVRp5rGALVL4_nBvwmexz4iUBWmsTlbVDtlSjDwGIBcol_JDrwJbohfZvp_rDY-TWo=w1600-h1066-k-no",
  interior1:
    "https://lh3.googleusercontent.com/grass-cs/ACvplmPBArzZzlXl9VbxBFQgrHPAAUw6ta67NnyC7-LvuP1-ypRenCORnw_rKgjZvS96UIW_Qw4Ig9WBM9riz62ZMaXFqrRuCjdBmHHxqm_LBWXZ7AC07GlkAh_RWvtwmssv4_SibyQN=w1400-h1100-n-k-no",
  interior2:
    "https://lh3.googleusercontent.com/grass-cs/ACvplmOGDcs8Y8PpNAvPO6HPeT7rISaIXD4LbbUfsXvgSXK7FWNjC5rPhk0xjd2P1cMUIEDN27R-UnK6T6luoaDRyrS1ziqWrHU2LfqBEjeHLUMeKJOKRymwHhi50Oo1lyLr7cClq4N3_friCpJk=w1400-h900-n-k-no",
  interior3:
    "https://lh3.googleusercontent.com/grass-cs/ACvplmOaIaji3MSNj4XDQMtN6gKC86OPPv6dPal_s1pA8JrbuQyZcyte-7rmN9sPC5UEb9Awxe6ShoQEtrq_1wFQGnnr4n01XvuozAOO73ajJ3smIIlv-rGJ88p6xKOZ77EAa0SpASiZnw=w1000-h900-n-k-no",
  interior4:
    "https://lh3.googleusercontent.com/grass-cs/ACvplmNkYPymd8Pxpacq4ZSJ7CVToXRH9thPq4V7Xvnn01dZojoCgXRAds-2SspaDsQWDIC5kPhg6OXHwcKpJhzXQPJnA5vkEuWQeWP3cwiVfiYttLu0xhQoJuwpF5Q5_DYWkofLMkNizr8No4m5=w1000-h900-n-k-no",
} as const;

/** Fotografia gastronômica demonstrativa (substituir pelas oficiais) */
export const dishes = {
  steakTartare: "https://image.qwenlm.ai/generated-images/a470675e-11b2-4f21-90c6-37220cf68f7a/_result.png",
  beefWellington: "https://image.qwenlm.ai/generated-images/eb2fcc9e-ac6f-4dad-aba9-66c25fb2696e/_result.png",
  soupeOignon: "https://image.qwenlm.ai/generated-images/0f944d76-8811-49f2-a907-4cbd63a77de1/_result.png",
  entrecote: "https://image.qwenlm.ai/generated-images/ddbccd39-2bb0-411d-8e1c-aedbb852a7ad/_result.png",
  cremeBrulee: "https://image.qwenlm.ai/generated-images/f900955d-2942-4aca-a03c-3c0597809c66/_result.png",
  kirRoyale: "https://image.qwenlm.ai/generated-images/9cb15545-2c32-41e4-b4d8-f0d46cec0870/_result.png",
  chef: "https://image.qwenlm.ai/generated-images/86e272c3-f195-4360-99f2-5bce02cd77cc/_result.png",
} as const;

export const images = {
  ...googlePhotos,
  ...dishes,
  /** hero em camadas */
  heroBg: googlePhotos.cover,
  heroDish: dishes.steakTartare,
  /** storytelling */
  storyMarket: dishes.entrecote,
  storyTechnique: dishes.chef,
  storyPlating: dishes.beefWellington,
  storyTable: googlePhotos.interior1,
} as const;
