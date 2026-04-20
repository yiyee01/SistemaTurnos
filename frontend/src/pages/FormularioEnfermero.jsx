// src/pages/FormularioEnfermero.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { ChevronLeft } from 'lucide-react'
import { PantallaCarga } from '../components/PantallaCarga'

const campoVacio = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  password: '',
  matricula: '',
  especialidad: '',
  rol: 'enfermero',
  hospital_id: '',
  sector_id: '',
  id_jefe: '',
}

export default function FormularioEnfermero() {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState(campoVacio)
  const [hospitales, setHospitales] = useState([])
  const [sectores, setSectores] = useState([])
  const [jefes, setJefes] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarOpciones()
    if (esEdicion) cargarEnfermero()
  }, [id])

  async function cargarOpciones() {
    const [{ data: hosp }, { data: sect }, { data: jef }] = await Promise.all([
      supabase.from('hospitales').select('id, nombre'),
      supabase.from('sectores').select('id, nombre'),
      supabase.from('enfermeros').select('id, nombre, apellido').eq('rol', 'jefe').eq('estado', 'activo'),
    ])
    if (hosp) setHospitales(hosp)
    if (sect) setSectores(sect)
    if (jef) setJefes(jef)
  }

  async function cargarEnfermero() {
    setCargando(true)
    const { data, error } = await supabase
      .from('enfermeros')
      .select(`
        id, nombre, apellido, dni, matricula, especialidad, rol, id_jefe,
        trabaja_en ( hospital_id, sector_id )
      `)
      .eq('id', id)
      .single()

    if (error) {
      setError('No se pudo cargar el enfermero.')
    } else {
      setForm({
        nombre: data.nombre ?? '',
        apellido: data.apellido ?? '',
        dni: data.dni ?? '',
        email: '',
        password: '',
        matricula: data.matricula ?? '',
        especialidad: data.especialidad ?? '',
        rol: data.rol ?? 'enfermero',
        hospital_id: String(data.trabaja_en?.[0]?.hospital_id ?? ''),
        sector_id: String(data.trabaja_en?.[0]?.sector_id ?? ''),
        id_jefe: data.id_jefe ?? '',
      })
    }
    setCargando(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Validación del lado del cliente
  function validar() {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.'
    if (!form.apellido.trim()) return 'El apellido es obligatorio.'
    if (!form.dni.trim()) return 'El DNI es obligatorio.'
    if (!form.hospital_id) return 'Seleccioná un hospital.'
    if (!form.sector_id) return 'Seleccioná un sector.'
    if (form.rol === 'enfermero' && !form.id_jefe)
      return 'Un enfermero debe tener un jefe asignado.'
    if (!esEdicion) {
      if (!form.email.trim()) return 'El email es obligatorio.'
      if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const errValidacion = validar()
    if (errValidacion) { setError(errValidacion); return }

    setGuardando(true)

    const funcion = esEdicion ? 'actualizar-enfermero' : 'crear-enfermero'

    const body = esEdicion
      ? {
        id,
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        matricula: form.matricula,
        especialidad: form.especialidad,
        rol: form.rol,
        hospital_id: Number(form.hospital_id),
        sector_id: Number(form.sector_id),
        id_jefe: form.id_jefe || null,
      }
      : {
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        email: form.email,
        password: form.password,
        matricula: form.matricula,
        especialidad: form.especialidad,
        rol: form.rol,
        hospital_id: Number(form.hospital_id),
        sector_id: Number(form.sector_id),
        id_jefe: form.id_jefe || null,
      }

    const { data, error } = await supabase.functions.invoke(funcion, { body })

    if (error) {
      setError(data?.error ?? error.message ?? 'Ocurrió un error.')
    } else {
      navigate('/jefe/equipo')
    }

    setGuardando(false)
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-marca-bg flex items-center justify-center">
        <PantallaCarga mensaje="Verificando sesión..." />;
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-marca-bg p-4 lg:p-8">
      <div className="max-w-xl mx-auto">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/jefe/equipo')}
          className="inline-flex items-center gap-2 text-sm text-marca-muted
                     bg-marca-surface border border-marca-border2 rounded-lg
                     px-3 py-1.5 mb-6 hover:text-marca-light
                     hover:border-marca-base transition-colors"
        >
          <ChevronLeft size={16} />
          Mi equipo
        </button>

        {/* Título */}
        <h1 className="text-xl font-medium text-marca-pale mb-1">
          {esEdicion ? 'Editar enfermero' : 'Nuevo enfermero'}
        </h1>
        <p className="text-sm text-marca-muted mb-6">
          {esEdicion
            ? `Modificá los datos de ${form.nombre} ${form.apellido}`
            : 'Completá los datos para dar de alta al enfermero'}
        </p>

        <form onSubmit={handleSubmit}
          className="bg-marca-surface border border-marca-border rounded-2xl p-6 flex flex-col gap-5">

          {/* Datos personales */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-marca-muted mb-4">
              Datos personales
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: María" />
              <Campo label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required placeholder="Ej: González" />
              <Campo label="DNI" name="dni" value={form.dni} onChange={handleChange} required placeholder="Ej: 30.441.882" />
              <Campo label="Matrícula" name="matricula" value={form.matricula} onChange={handleChange} placeholder="Ej: MP-4821" />
            </div>
            <div className="mt-4">
              <Campo label="Especialidad" name="especialidad" value={form.especialidad}
                onChange={handleChange} placeholder="Ej: UCI, Guardia, Neonatología..." />
            </div>
          </div>

          {/* Acceso — solo en alta */}
          {!esEdicion && (
            <div className="border-t border-marca-border pt-4">
              <p className="text-xs font-medium uppercase tracking-widest text-marca-muted mb-4">
                Acceso al sistema
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Email institucional" name="email" type="email"
                  value={form.email} onChange={handleChange} required
                  placeholder="maria@hospital.com" />
                <Campo label="Contraseña inicial" name="password" type="password"
                  value={form.password} onChange={handleChange} required
                  placeholder="Mínimo 6 caracteres" />
              </div>
              <p className="text-xs text-marca-muted mt-3 p-3 bg-marca-bg
                            border border-marca-border rounded-lg">
                El enfermero recibirá acceso con estas credenciales.
              </p>
            </div>
          )}

          {/* Asignación */}
          <div className="border-t border-marca-border pt-4">
            <p className="text-xs font-medium uppercase tracking-widest text-marca-muted mb-4">
              Asignación
            </p>
            <div className="grid grid-cols-2 gap-4">

              {/* Hospital */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest
                                   text-marca-light mb-1.5">
                  Hospital
                </label>
                <select
                  name="hospital_id"
                  value={form.hospital_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm
                             bg-marca-bg border border-marca-border2 text-marca-pale
                             outline-none focus:border-marca-mid transition-colors cursor-pointer"
                >
                  <option value="">Seleccioná...</option>
                  {hospitales.map(h => (
                    <option key={h.id} value={h.id}>{h.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest
                                   text-marca-light mb-1.5">
                  Sector
                </label>
                <select
                  name="sector_id"
                  value={form.sector_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm
                             bg-marca-bg border border-marca-border2 text-marca-pale
                             outline-none focus:border-marca-mid transition-colors cursor-pointer"
                >
                  <option value="">Seleccioná...</option>
                  {sectores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Jefe */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest
                                   text-marca-light mb-1.5">
                  Jefe a cargo
                </label>
                <select
                  name="id_jefe"
                  value={form.id_jefe}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-sm
                             bg-marca-bg border border-marca-border2 text-marca-pale
                             outline-none focus:border-marca-mid transition-colors cursor-pointer"
                >
                  <option value="">Sin jefe (es jefe)</option>
                  {jefes.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} {j.apellido}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest
                                   text-marca-light mb-1.5">
                  Rol
                </label>
                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-sm
                             bg-marca-bg border border-marca-border2 text-marca-pale
                             outline-none focus:border-marca-mid transition-colors cursor-pointer"
                >
                  <option value="enfermero">Enfermero/a</option>
                </select>
              </div>

            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-3 py-2.5 text-sm
                            bg-red-950 border border-red-800 text-red-300">
              {error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => navigate('/jefe/equipo')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium
                         border border-marca-border2 text-marca-muted
                         hover:text-marca-light hover:border-marca-base transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium
                         text-marca-border 
                        bg-marca-muted
                        hover:text-marca-pale
                        hover:bg-marca-border2 transition-colors"
            >
              {guardando
                ? 'Guardando…'
                : esEdicion ? 'Guardar cambios' : 'Crear enfermero'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// Campo de texto reutilizable
function Campo({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-marca-light mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg text-sm
                   bg-marca-bg border border-marca-border2 text-marca-pale
                   placeholder:text-marca-muted2 outline-none
                   focus:border-marca-mid transition-colors"
      />
    </div>
  )
}
