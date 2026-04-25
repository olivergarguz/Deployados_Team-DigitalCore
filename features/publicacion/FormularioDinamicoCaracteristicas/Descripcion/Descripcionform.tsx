/**
 * Dev: Gabriel Paredes
 * FIX: Restauración de modo edición (Cambiar) y soporte para texto libre.
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  useDescripcionForm,
  MAX_DESCRIPCION,
  MAX_CARACTERISTICAS,
  PREDEFINED_FEATURES,
} from './usedescripcionform'

const MAX_DETALLE = 100

// ── PortalDropdown ─────────────────────────────────────────────
function PortalDropdown({ anchorRef, open, children }: { anchorRef: React.RefObject<HTMLElement | null>, open: boolean, children: React.ReactNode }) {
  const listRef = useRef<HTMLUListElement>(null)
  const reposition = useCallback(() => {
    if (!listRef.current || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    listRef.current.style.top = `${r.bottom + 4}px`
    listRef.current.style.left = `${r.left}px`
    listRef.current.style.width = `${r.width}px`
  }, [anchorRef])

  useEffect(() => {
    if (!open) return
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, reposition])

  if (!open) return null
  return createPortal(
    <ul ref={listRef} style={{ position: 'fixed', zIndex: 9999, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.375rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '200px', padding: 0, listStyle: 'none' }}>
      {children}
    </ul>,
    document.body
  )
}

export function DescripcionForm({ onNext, onBack, submitRef }: { onNext: () => void, onBack: () => void, submitRef?: any }) {
  const {
    values, errors, touched, handleChange, handleBlur, handleSubmit,
    searchTerm, setSearchTerm, sugerencias, caracteristicaError,
    agregarCaracteristica, eliminarCaracteristica, actualizarDetalle, actualizarTitulo
  } = useDescripcionForm()

  const [isAdding, setIsAdding] = useState(false)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleSearchTerm, setTitleSearchTerm] = useState('')
  const [detalleError, setDetalleError] = useState<string | null>(null)

  const addInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (submitRef) submitRef.current = () => handleSubmit(() => onNext())
  }, [handleSubmit, onNext, submitRef])

  // Auto-selección inicial
  useEffect(() => {
    if (values.caracteristicas.length > 0 && !activeTag && !isAdding) {
      setActiveTag(values.caracteristicas[0].titulo)
    }
  }, [values.caracteristicas, activeTag, isAdding])

  const handleAgregarClick = (nombre: string) => {
    agregarCaracteristica(nombre)
    setTimeout(() => {
      setIsAdding(false)
      setActiveTag(nombre)
      setSearchTerm('')
    }, 0)
  }

  const handleTitleSelect = (nuevo: string) => {
    if (activeTag) {
      actualizarTitulo(activeTag, nuevo)
      setActiveTag(nuevo)
      setEditingTitle(false)
      setTitleSearchTerm('')
    }
  }

  const activeChar = values.caracteristicas.find(c => c.titulo === activeTag)
  const isLimitReached = values.caracteristicas.length >= MAX_CARACTERISTICAS

  return (
    <div className="flex flex-col h-full pb-10 gap-1">
      {/* Descripción Libre */}
      <div className="flex flex-col gap-1">
        <Label className="text-sm font-medium">Añada una descripción de su propiedad</Label>
        <textarea
          value={values.descripcion}
          maxLength={MAX_DESCRIPCION}
          onChange={e => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder="Escribe una descripción"
          rows={3}
          className={`w-full resize-none rounded-md border px-3 py-2 text-sm outline-none bg-white transition-colors focus:border-gray-400 ${touched && errors.descripcion ? 'border-red-400' : 'border-[#D4CFC6]'}`}
        />
        <div className="flex justify-between items-center" style={{ minHeight: '16px' }}>
          <span className="text-red-500 text-xs">{touched && errors.descripcion ? errors.descripcion : ''}</span>
          <span className="text-xs text-gray-400">{values.descripcion.length}/{MAX_DESCRIPCION}</span>
        </div>
      </div>

      {/* Características Extras */}
      <div className="mt-2 flex flex-col gap-2 flex-1">
        <div className="flex flex-col gap-1">
          <Label className="font-bold text-sm">Caracteristicas Extras <span className="font-normal text-[#C26E5A]">-Opcional</span></Label>
          <div className="flex items-center gap-3">
             <span className="text-xs text-gray-500 font-medium">{values.caracteristicas.length}/{MAX_CARACTERISTICAS}</span>
             {isLimitReached && <span className="text-red-500 text-xs font-semibold">Alcanzaste el límite de {MAX_CARACTERISTICAS} características extras</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center mt-1">
          <button 
            type="button" 
            disabled={isLimitReached}
            onClick={() => { setIsAdding(true); setActiveTag(null); setEditingTitle(false); setSearchTerm('') }}
            className={`flex items-center justify-center w-8 h-8 rounded-md border-2 border-[#C26E5A] text-[#C26E5A] bg-transparent transition-colors focus:outline-none ${isLimitReached ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#C26E5A]/10'}`}
          >
            <span className="text-xl font-bold leading-none mb-0.5">+</span>
          </button>

          {values.caracteristicas.map(c => (
            <span 
              key={c.titulo}
              onClick={() => { setActiveTag(c.titulo); setIsAdding(false); setEditingTitle(false) }}
              className={`px-3 py-1.5 rounded-full text-sm font-bold border cursor-pointer flex items-center gap-2 transition-colors ${activeTag === c.titulo && !isAdding ? 'bg-[#C26E5A] text-white border-[#C26E5A]' : 'text-[#C26E5A] border-[#C26E5A] hover:bg-[#C26E5A]/10'}`}
            >
              {c.titulo}
              <button onClick={(e) => { e.stopPropagation(); eliminarCaracteristica(c.titulo) }} className="hover:text-red-200">✕</button>
            </span>
          ))}
        </div>

        <div className="mt-4 min-h-[160px]">
          {isAdding && (
            <div className="animate-in fade-in slide-in-from-top-1">
              <Label className="text-xs font-bold text-gray-700 mb-1 block">¿Qué título de característica desea colocar? *</Label>
              <Input 
                ref={addInputRef}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Ej. Piscina, Balcón"
                className="focus-visible:ring-0 border-gray-300"
                autoFocus
              />
              <PortalDropdown anchorRef={addInputRef} open={searchTerm.trim().length > 0}>
                {sugerencias.map(s => (
                  <li key={s} onMouseDown={() => handleAgregarClick(s)} className="px-4 py-2 hover:bg-[#C26E5A]/10 cursor-pointer text-sm">{s}</li>
                ))}
                <li onMouseDown={() => handleAgregarClick(searchTerm)} className="px-4 py-2 text-[#C26E5A] font-bold border-t hover:bg-[#C26E5A]/10 cursor-pointer text-sm">+ Otros: "{searchTerm}"</li>
              </PortalDropdown>
              {caracteristicaError && <p className="text-red-500 text-xs mt-1 font-semibold">{caracteristicaError}</p>}
            </div>
          )}

          {!isAdding && activeTag && activeChar && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <div>
                <Label className="text-xs font-bold text-gray-700 mb-1 block">Título de la característica</Label>
                {editingTitle ? (
                  <div className="relative">
                    <Input 
                      ref={titleInputRef}
                      value={titleSearchTerm}
                      onChange={e => setTitleSearchTerm(e.target.value)}
                      placeholder={`Cambiar "${activeChar.titulo}"...`}
                      autoFocus
                      className="border-[#C26E5A] focus-visible:ring-0"
                    />
                    <PortalDropdown anchorRef={titleInputRef} open={titleSearchTerm.trim().length > 0}>
                      {PREDEFINED_FEATURES.filter(f => f.nombre.toLowerCase().startsWith(titleSearchTerm.toLowerCase())).map(f => (
                        <li key={f.id} onMouseDown={() => handleTitleSelect(f.nombre)} className="px-4 py-2 hover:bg-[#C26E5A]/10 cursor-pointer text-sm">{f.nombre}</li>
                      ))}
                      <li onMouseDown={() => handleTitleSelect(titleSearchTerm)} className="px-4 py-2 text-[#C26E5A] border-t hover:bg-[#C26E5A]/10 cursor-pointer text-sm">Usar: "{titleSearchTerm}"</li>
                    </PortalDropdown>
                  </div>
                ) : (
                  <div 
                    onClick={() => { setEditingTitle(true); setTitleSearchTerm('') }}
                    className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:border-[#C26E5A]/50 transition-colors mt-1"
                  >
                    <span className="text-sm font-medium text-gray-700">{activeChar.titulo}</span>
                    <span className="text-xs text-[#C26E5A] font-bold">Cambiar</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold text-gray-700">Ingrese una descripción (Opcional)</Label>
                  <span className={`text-xs ${activeChar.detalle.length >= MAX_DETALLE ? 'text-red-400' : 'text-gray-400'}`}>{activeChar.detalle.length}/{MAX_DETALLE}</span>
                </div>
                <Input 
                  value={activeChar.detalle}
                  maxLength={MAX_DETALLE}
                  onChange={e => actualizarDetalle(activeTag, e.target.value)}
                  placeholder="Ej. Amplio con vista a la calle..."
                  className="focus-visible:ring-0 border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
        <div className="h-10 w-full" aria-hidden="true" />
      </div>
    </div>
  )
}