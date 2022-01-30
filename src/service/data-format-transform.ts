import cloneDeep from 'lodash/cloneDeep'

type LabelKeyType = string
type ValueKeyType = string | true | null

interface IListToMapKey {
  labelKey?: LabelKeyType
  valueKey?: ValueKeyType
}

interface IListToTreeKey {
  primaryKey?: string
  parentKey?: string
  childrenKey?: string
  levelKey?: string
  leafKey?: string
  pathKey?: string
  pathSeparator?: string
}

interface IGroupToTreeKey {
  groupKey?: string
}

type GroupToMapKeyType = IListToMapKey & IGroupToTreeKey
type GroupToTreeKeyType = IListToTreeKey & IGroupToTreeKey
type TreeToMapKeyType = IListToMapKey & IListToTreeKey & IGroupToTreeKey
type TreeToGroupKeyType = Omit<IListToTreeKey, 'parentKey'> & IGroupToTreeKey

/**
 * List   ->  Map
 * List   ->  Group
 * List   ->  Tree
 * Tree   ->  List
 * Tree   ->  Group  <=>  Tree   ->  List  ->  Group
 * Tree   ->  Map    <=>  Tree   ->  List  ->  Map
 * Group  ->  List
 * Group  ->  Tree   <=>  Group  ->  List  ->  Tree
 * Group  ->  Map    <=>  Group  ->  List  ->  Map
 */

export function getKeyMap(keyMap: TreeToMapKeyType = {}): Required<TreeToMapKeyType> {
  const {
    primaryKey = 'id',
    parentKey = 'parentId',
    childrenKey = 'children',
    levelKey = 'level',
    leafKey = 'isLeaf',
    pathKey = 'path',
    pathSeparator = '-',
    labelKey = primaryKey,
    valueKey = true,
    groupKey = parentKey
  } = keyMap

  return { primaryKey, parentKey, childrenKey, levelKey, pathKey, leafKey, pathSeparator, labelKey, valueKey, groupKey }
}

// 添加 level and path
export function addLevelAndPathForTree<T = unknown>(
  tree: T[],
  keyMap: Omit<IListToTreeKey, 'parentKey'> = {},
  parentNode: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
): T[] {
  const { primaryKey, childrenKey, levelKey, leafKey, pathKey, pathSeparator } = getKeyMap(keyMap)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tree.forEach((item: any) => {
    const id = item[primaryKey]
    const children = item[childrenKey]

    let level = 0
    let path = `${level}`

    if (parentNode) {
      level = parentNode[levelKey] + 1 || level
      path = parentNode[pathKey] || path
    }

    path += `${pathSeparator}${id ?? level}`

    item[levelKey] = level
    item[pathKey] = path
    item[leafKey] = true

    if (Array.isArray(children) && children.length) {
      item[leafKey] = false
      addLevelAndPathForTree<T>(children, keyMap, item)
    }
  })

  return tree
}

// 列表 转 对象
export function listToMap<T = unknown, U = string>(
  lists: T[],
  labelKey = 'id',
  valueKey: ValueKeyType = true
): Record<string, typeof valueKey extends string ? U : T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map: any = {}

  if (valueKey === true || valueKey === null) valueKey = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lists.forEach((item: any) => {
    map[item[labelKey] as string] = valueKey === null ? item : item[valueKey as string]
  })

  return map
}

// 列表 转 分组
export function listToGroup<T = unknown>(lists: T[], groupKey = 'parentId'): Record<string, T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupMap = lists.reduce((accumulator, item: any) => {
    const groupId = item[groupKey] || 0

    const childrenLists = accumulator[groupId] || []

    childrenLists.push(item)

    accumulator[groupId] = childrenLists

    return accumulator
  }, {} as Record<string, T[]>)

  return groupMap
}

// 列表 转 树
export function listToTree<T = unknown>(lists: T[], keyMap: IListToTreeKey = {}): T[] {
  const { primaryKey, parentKey, childrenKey } = getKeyMap(keyMap)

  const groupMap = listToGroup<T>(lists, parentKey)

  const tree = lists.reduce((accumulator, item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloneItem: any = cloneDeep(item)

    const id = cloneItem[primaryKey]
    const parentId = cloneItem[parentKey]

    const children = groupMap[id]

    if (children) cloneItem[childrenKey] = children

    if (!parentId) accumulator.push(cloneItem)

    return accumulator
  }, [] as T[])

  addLevelAndPathForTree<T>(tree, keyMap)

  return tree
}

// 树 转 列表
export function treeToList<T = unknown>(
  tree: T[],
  keyMap: Omit<IListToTreeKey, 'parentKey'> = {},
  parentNode: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
): T[] {
  const { primaryKey, childrenKey, levelKey, leafKey, pathKey, pathSeparator } = getKeyMap(keyMap)

  const lists = tree.reduce((accumulator, item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloneItem: any = cloneDeep(item)

    const id = cloneItem[primaryKey]
    const children = cloneItem[childrenKey]

    delete cloneItem[childrenKey]

    let level = 0
    let path = `${level}`

    if (parentNode) {
      level = parentNode[levelKey] + 1 || level
      path = parentNode[pathKey] || path
    }

    path += `${pathSeparator}${id ?? level}`

    cloneItem[levelKey] = level
    cloneItem[pathKey] = path
    cloneItem[leafKey] = true

    accumulator.push(cloneItem)

    if (Array.isArray(children) && children.length) {
      cloneItem[leafKey] = false

      const childrenLists = treeToList<T>(children, keyMap, cloneItem)

      accumulator.push(...childrenLists)
    }

    return accumulator
  }, [] as T[])

  return lists
}

// 树 转 对象
export function treeToMap<T = unknown, U = string>(
  tree: T[],
  keyMap: Omit<TreeToMapKeyType, 'parentKey' | 'groupKey'> = {}
): ReturnType<typeof listToMap> {
  const { primaryKey, childrenKey, levelKey, leafKey, pathKey, pathSeparator, labelKey, valueKey } = getKeyMap(keyMap)

  const lists = treeToList<T>(tree, { primaryKey, childrenKey, levelKey, leafKey, pathKey, pathSeparator })
  const map = listToMap<T, U>(lists, labelKey, valueKey)

  return map
}

// 树 转 分组
export function treeToGroup<T = unknown>(tree: T[], keyMap: TreeToGroupKeyType = {}): Record<string, T[]> {
  const { groupKey } = getKeyMap(keyMap)

  const lists = treeToList<T>(tree, keyMap)
  const group = listToGroup<T>(lists, groupKey)

  return group
}

// 分组 转 列表
export function groupToList<T = unknown>(group: Record<string, T[]>, groupKey = 'parentId'): T[] {
  const groupKeys = Object.keys(group)

  const lists: T[] = []

  groupKeys.forEach(key => {
    const item = group[key]

    if (!Array.isArray(item)) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item.forEach((v: any) => {
      v[groupKey] = v[groupKey] ?? key
    })

    lists.concat(item)
  })

  return lists
}

// 分组 转 树
export function groupToTree<T = unknown>(group: Record<string, T[]>, keyMap: GroupToTreeKeyType = {}): T[] {
  const { groupKey } = getKeyMap(keyMap)

  const lists = groupToList<T>(group, groupKey)
  const tree = listToTree<T>(lists, keyMap)

  return tree
}

// 分组 转 对象
export function groupToMap<T = unknown, U = string>(
  group: Record<string, T[]>,
  keyMap: GroupToMapKeyType = {}
): ReturnType<typeof listToMap> {
  const { labelKey, valueKey, groupKey } = getKeyMap(keyMap)

  const lists = groupToList<T>(group, groupKey)
  const map = listToMap<T, U>(lists, labelKey, valueKey)

  return map
}
