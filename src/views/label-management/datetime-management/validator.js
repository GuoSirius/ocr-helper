export const FORM_MODEL = {
  name: '',
  category: '',
  appId: '',
  apiKey: '',
  secretKey: '',
  isActive: false,
  order: 0,
  isDisabled: false
}

export const FORM_RULES = {
  name: [{ required: true }],
  appId: [{ required: true }],
  apiKey: [{ required: true }],
  secretKey: [{ required: true }],
  isActive: [{ required: true }],
  order: [{ required: true }],
  isDisabled: [{ required: true }]
}
