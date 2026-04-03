import { Suspense } from "react"
import PerfilContent from "./PerfilContent"

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-500">Cargando perfil...</div>}>
      <PerfilContent />
    </Suspense>
  )
}