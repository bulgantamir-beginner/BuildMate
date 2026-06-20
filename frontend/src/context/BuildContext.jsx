import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { checkBuild, saveBuild as apiSaveBuild } from '../services/api'

const BuildContext = createContext(null)

const EMPTY_BUILD = { cpu: null, motherboard: null, gpu: null, ram: null, storage: null, psu: null, case: null, cooler: null }
const initialState = { build: { ...EMPTY_BUILD }, compatibility: null, isChecking: false, isSaving: false, buildName: 'Миний Build' }

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PART': return { ...state, build: { ...state.build, [action.category]: action.part }, compatibility: null }
    case 'REMOVE_PART': return { ...state, build: { ...state.build, [action.category]: null }, compatibility: null }
    case 'CLEAR_BUILD': return { ...state, build: { ...EMPTY_BUILD }, compatibility: null }
    case 'SET_COMPATIBILITY': return { ...state, compatibility: action.data, isChecking: false }
    case 'SET_CHECKING': return { ...state, isChecking: action.value }
    case 'SET_SAVING': return { ...state, isSaving: action.value }
    case 'SET_NAME': return { ...state, buildName: action.name }
    case 'LOAD_BUILD': return { ...state, build: action.build, buildName: action.name || 'Миний Build', compatibility: null }
    default: return state
  }
}

export function BuildProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setPart = useCallback((category, part) => dispatch({ type: 'SET_PART', category, part }), [])
  const removePart = useCallback(category => dispatch({ type: 'REMOVE_PART', category }), [])
  const clearBuild = useCallback(() => dispatch({ type: 'CLEAR_BUILD' }), [])

  const checkCompatibility = useCallback(async () => {
    const ids = {}
    Object.entries(state.build).forEach(([k, v]) => { if (v) ids[k] = v.id })
    if (Object.keys(ids).length === 0) return
    dispatch({ type: 'SET_CHECKING', value: true })
    try {
      const result = await checkBuild(ids)
      dispatch({ type: 'SET_COMPATIBILITY', data: result })
      return result
    } catch (e) {
      console.error(e)
      dispatch({ type: 'SET_CHECKING', value: false })
    }
  }, [state.build])

  const saveBuild = useCallback(async (name, description) => {
    const ids = {}
    Object.entries(state.build).forEach(([k, v]) => { if (v) ids[k] = v.id })
    dispatch({ type: 'SET_SAVING', value: true })
    try {
      const saved = await apiSaveBuild(ids, name, description)
      dispatch({ type: 'SET_SAVING', value: false })
      dispatch({ type: 'SET_NAME', name })
      return saved
    } catch (e) {
      dispatch({ type: 'SET_SAVING', value: false })
      throw e
    }
  }, [state.build])

  const loadBuild = useCallback((build, name) => dispatch({ type: 'LOAD_BUILD', build, name }), [])

  return (
    <BuildContext.Provider value={{ ...state, setPart, removePart, clearBuild, checkCompatibility, saveBuild, loadBuild }}>
      {children}
    </BuildContext.Provider>
  )
}

export const useBuild = () => {
  const ctx = useContext(BuildContext)
  if (!ctx) throw new Error('useBuild must be inside BuildProvider')
  return ctx
}
