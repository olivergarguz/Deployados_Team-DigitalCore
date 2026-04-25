'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

export const MAX_DESCRIPCION = 1500
export const MIN_DESCRIPCION = 20
const SESSION_KEY = 'descripcionPropiedad'
export const MAX_CARACTERISTICAS = 4

export const PREDEFINED_FEATURES: { id: number; nombre: string }[] = [
  { id: 1,  nombre: 'Piscina' }, { id: 2,  nombre: 'Jardín' }, { id: 3,  nombre: 'Parqueo' },
  { id: 4,  nombre: 'Amoblado' }, { id: 5,  nombre: 'Vista panorámica' }, { id: 6,  nombre: 'Seguridad 24h' },
  { id: 7,  nombre: 'Ascensor' }, { id: 9,  nombre: 'A estrenar' }, { id: 10, nombre: 'Remodelado' },
  { id: 11, nombre: 'Terraza' }, { id: 12, nombre: 'Balcón' }, { id: 13, nombre: 'Patio' },
  { id: 14, nombre: 'Parrillero' }, { id: 15, nombre: 'Jacuzzi' }, { id: 16, nombre: 'Gimnasio' },
  { id: 17, nombre: 'Sauna' }, { id: 18, nombre: 'Área social' }, { id: 19, nombre: 'Salón eventos' },
  { id: 20, nombre: 'Lavandería' }, { id: 21, nombre: 'Cocina equipada' }, { id: 22, nombre: 'Cocina americana' },
  { id: 23, nombre: 'Walk-in closet' }, { id: 24, nombre: 'Baño privado' }, { id: 25, nombre: 'Aire acondicionado' },
  { id: 26, nombre: 'Calefacción' }, { id: 27, nombre: 'Gas domiciliario' }, { id: 28, nombre: 'Agua potable' },
  { id: 29, nombre: 'Internet' }, { id: 30, nombre: 'Cisterna' }, { id: 31, nombre: 'Depósito' },
  { id: 32, nombre: 'Vista ciudad' }, { id: 33, nombre: 'Vista montaña' }, { id: 34, nombre: 'Zona residencial' },
  { id: 35, nombre: 'Zona comercial' }, { id: 36, nombre: 'Transporte cercano' }, { id: 37, nombre: 'Colegios cerca' },
  { id: 38, nombre: 'Hospitales cerca' }, { id: 39, nombre: 'Parques cerca' }, { id: 40, nombre: 'Frente parque' },
  { id: 41, nombre: 'Condominio cerrado' }, { id: 42, nombre: 'Control acceso' }, { id: 43, nombre: 'Portón eléctrico' },
  { id: 44, nombre: 'Cámaras seguridad' }, { id: 45, nombre: 'Alarma' }, { id: 46, nombre: 'Parqueo visitas' },
  { id: 47, nombre: 'Área infantil' }, { id: 48, nombre: 'Cancha fútbol' }, { id: 49, nombre: 'Cancha tenis' },
  { id: 50, nombre: 'Cancha básquet' }, { id: 51, nombre: 'Estudio' }, { id: 52, nombre: 'Dúplex' },
  { id: 53, nombre: 'Último piso' }, { id: 54, nombre: 'Planta baja' }, { id: 55, nombre: 'Urbanizado' },
  { id: 56, nombre: 'Pavimentado' }, { id: 57, nombre: 'Perimetrado' }
]

export interface CaracteristicaExtra {
  id_caracteristica: number
  titulo: string
  detalle: string
}

export interface DescripcionFormValues {
  descripcion: string
  caracteristicas: CaracteristicaExtra[]
}

export interface DescripcionFormErrors {
  descripcion?: string
}

const INITIAL_VALUES: DescripcionFormValues = {
  descripcion: '',
  caracteristicas: [],
}

function validate(values: DescripcionFormValues): DescripcionFormErrors {
  const errors: DescripcionFormErrors = {}
  const desc = values.descripcion.trim()
  if (!desc) {
    errors.descripcion = 'La descripción es obligatoria.'
  } else if (desc.length < MIN_DESCRIPCION) {
    errors.descripcion = `Mínimo ${MIN_DESCRIPCION} caracteres.`
  }
  return errors
}

export function useDescripcionForm() {
  const [values, setValues] = useState<DescripcionFormValues>(() => {
    if (typeof window === 'undefined') return INITIAL_VALUES
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : INITIAL_VALUES
    } catch { return INITIAL_VALUES }
  })

  const [errors, setErrors] = useState<DescripcionFormErrors>({})
  const [touched, setTouched] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [caracteristicaError, setCaracteristicaError] = useState<string | null>(null)

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(values))
  }, [values])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const sugerencias = useMemo(() => {
    if (!debouncedTerm.trim()) return []
    const term = debouncedTerm.toLowerCase()
    return PREDEFINED_FEATURES
      .filter(f => f.nombre.toLowerCase().startsWith(term))
      .map(f => f.nombre)
  }, [debouncedTerm])

  const handleChange = useCallback((value: string) => {
    setValues(prev => {
      const updated = { ...prev, descripcion: value }
      if (touched) setErrors(validate(updated))
      return updated
    })
  }, [touched])

  const handleBlur = useCallback(() => {
    setTouched(true)
    setErrors(validate(values))
  }, [values])

  const handleSubmit = useCallback((onSuccess: (values: DescripcionFormValues) => void) => {
    setTouched(true)
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) onSuccess(values)
  }, [values])

  const agregarCaracteristica = useCallback((nombre: string) => {
  const nombreLimpio = nombre.trim();
  if (!nombreLimpio) return;

  const feature = PREDEFINED_FEATURES.find(
    (f) => f.nombre.toLowerCase() === nombreLimpio.toLowerCase()
  );

  setValues((prev) => ({
    ...prev,
    caracteristicas: [
      ...prev.caracteristicas,
      { 
        id_caracteristica: feature ? feature.id : 0, 
        titulo: feature ? feature.nombre : nombreLimpio, // DEBE LLAMARSE 'titulo'
        detalle: '' 
      }
    ]
  }));
}, [setValues]);

  const eliminarCaracteristica = useCallback((titulo: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter(c => c.titulo !== titulo),
    }))
  }, [])

  const actualizarDetalle = useCallback((titulo: string, nuevoDetalle: string) => {
    setValues(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map(c =>
        c.titulo === titulo ? { ...c, detalle: nuevoDetalle } : c
      ),
    }))
  }, [])

  const actualizarTitulo = useCallback((tituloActual: string, nuevoTitulo: string) => {
  const feature = PREDEFINED_FEATURES.find(
    (f) => f.nombre.toLowerCase() === nuevoTitulo.toLowerCase()
  )

  setValues((prev) => ({
    ...prev,
    caracteristicas: prev.caracteristicas.map((c) =>
      c.titulo === tituloActual
        ? { 
            ...c, 
            id_caracteristica: feature ? feature.id : 0, 
            titulo: feature ? feature.nombre : nuevoTitulo,
            // CORRECCIÓN: Limpiamos el detalle al cambiar el título
            detalle: '' 
          }
        : c
    ),
  }))

  // Opcional: Si tienes un estado que controla el texto del TextArea actual, 
  // asegúrate de resetearlo también aquí si es necesario.
}, [setValues])

  return {
    values, errors, touched, handleChange, handleBlur, handleSubmit,
    searchTerm, setSearchTerm, sugerencias, caracteristicaError,
    agregarCaracteristica, eliminarCaracteristica, actualizarDetalle, actualizarTitulo
  }
}