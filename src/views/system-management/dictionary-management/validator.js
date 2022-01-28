export const FORM_MODEL = {
  parentId: '',
  name: '',
  code: '',
  order: 0,
  isDisabled: false
}

export const FORM_RULES = {
  name: [{ required: true }],
  code: [{ required: true }],
  order: [{ required: true }],
  isDisabled: [{ required: true }]
}
