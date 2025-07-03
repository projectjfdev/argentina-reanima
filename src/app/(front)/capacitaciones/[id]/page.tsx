"use client"

import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, PlayCircle } from "lucide-react"
import type { ICourse } from "@/interfaces/courses"

const VideoPlayer = dynamic(() => import("@/components/Video/video-player"), {
  ssr: false,
})

const CapacitacionPorId = () => {
  const { id } = useParams()

  // Estado para el video seleccionado
  const [course, setCourse] = useState<ICourse | null>(null)
  const [currentLesson, setCurrentLesson] = useState(course?.lessons[0])

  useEffect(() => {
    if (!id) return

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        const data = await res.json()

        if (res.ok) {
          setCourse(data.course)
          setCurrentLesson(data.course.lessons[0] || null)
        } else {
          console.error("Error al obtener curso:", data.message)
        }
      } catch (error) {
        console.error("Error de red:", error)
      }
    }

    fetchCourse()
  }, [id])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-muted-foreground">Cargando curso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Barra de navegación superior mejorada */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto px-6 py-4">
          <Link href="/capacitaciones">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Volver a capacitaciones
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenido principal con más espaciado */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Video section - más ancho en desktop */}
          <section className="lg:col-span-2 space-y-6">
            <div className="h-full rounded-xl overflow-hidden shadow-2xl bg-black">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-slate-600">Cargando video...</p>
                    </div>
                  </div>
                }
              >
                <VideoPlayer src={currentLesson?.href} />
              </Suspense>
            </div>

            {/* Información de la lección actual */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{currentLesson.title}</h3>
                    <p className="text-slate-600 leading-relaxed">Lección actual del curso {course.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Sidebar con información del curso */}
          <aside className="space-y-8">
            {/* Información del curso */}
            <Card className="border-0 shadow-lg p-6">
              <CardHeader className="pb-6">
                <div className="space-y-4  hover:bg-none">
                  <Badge  className="w-fit text-sm px-3 py-1 text-white bg-[#FC2D2B]  hover:bg-none">
                    {course.category}
                  </Badge>
                  <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">{course.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4  ">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Creado: {formatDate(course.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Actualizado: {formatDate(course.updatedAt)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total de lecciones</span>
                  <Badge variant="outline" className="font-semibold">
                    {course.lessons.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Lista de lecciones mejorada */}
            <Card className="border-0 shadow-lg p-6 space-y-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Contenido del curso</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2 p-6 pt-0">
                    {course.lessons.map((lesson, index) => {
                      const isActive = lesson.title === currentLesson.title
                      return (
                        <div
                          key={lesson.title}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`group cursor-pointer rounded-lg  p-4 transition-all duration-200 ${
                            isActive
                              ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                              : "hover:bg-slate-50 border-2 border-transparent hover:border-slate-200"
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") setCurrentLesson(lesson)
                          }}
                          aria-current={isActive ? "true" : "false"}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-medium text-sm leading-relaxed ${
                                  isActive ? "text-blue-900" : "text-slate-900"
                                }`}
                              >
                                {lesson.title}
                              </h4>
                            </div>
                            {isActive && <PlayCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default CapacitacionPorId
