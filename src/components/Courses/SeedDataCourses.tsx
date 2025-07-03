export const seedDataCourses = [
  {
    id: "1",
    title: "Curso Básico de RCP",
    category: "Primeros Auxilios",
    createdAt: new Date("2025-05-21T12:36:49.804Z"),
    updatedAt: new Date("2025-05-21T12:48:32.206Z"),
    lessons: [
      {
        id: 1,
        title: "¿Qué es la RCP?",
        href: "/cursos/1/leccion-1",
        courseId: 1,
      },
      {
        id: 2,
        title: "Cadena de supervivencia",
        href: "/cursos/1/leccion-2",
        courseId: 1,
      },
    ],
  },
  {
    id: "2",
    title: "RCP Avanzado para Profesionales de la Salud",
    category: "Salud",
    createdAt: new Date("2025-05-19T10:15:00.000Z"),
    updatedAt: new Date("2025-05-19T10:16:00.000Z"),
    lessons: [
      {
        id: 3,
        title: "Vía aérea avanzada",
        href: "/cursos/2/leccion-1",
        courseId: 2,
      },
      {
        id: 4,
        title: "Protocolos en hospitales",
        href: "/cursos/2/leccion-2",
        courseId: 2,
      },
    ],
  },
  {
    id: "3",
    title: "Primeros Auxilios en el Hogar",
    category: "Educación",
    createdAt: new Date("2025-05-18T14:00:00.000Z"),
    updatedAt: new Date("2025-05-18T14:05:00.000Z"),
    lessons: [
      {
        id: 5,
        title: "Cortes y quemaduras",
        href: "/cursos/3/leccion-1",
        courseId: 3,
      },
      {
        id: 6,
        title: "Manejo de asfixias",
        href: "/cursos/3/leccion-2",
        courseId: 3,
      },
    ],
  },
  {
    id: "4",
    title: "RCP para Instituciones Educativas",
    category: "Escuelas",
    createdAt: new Date("2025-05-17T08:30:00.000Z"),
    updatedAt: new Date("2025-05-17T08:32:00.000Z"),
    lessons: [
      {
        id: 7,
        title: "Emergencias en el aula",
        href: "/cursos/4/leccion-1",
        courseId: 4,
      },
      {
        id: 8,
        title: "Protocolos escolares",
        href: "/cursos/4/leccion-2",
        courseId: 4,
      },
    ],
  },
  {
    id: "5",
    title: "Desfibrilador Externo Automático (DEA)",
    category: "Tecnología Médica",
    createdAt: new Date("2025-05-16T11:20:00.000Z"),
    updatedAt: new Date("2025-05-16T11:22:00.000Z"),
    lessons: [
      {
        id: 9,
        title: "Funcionamiento del DEA",
        href: "/cursos/5/leccion-1",
        courseId: 5,
      },
      {
        id: 10,
        title: "Uso práctico paso a paso",
        href: "/cursos/5/leccion-2",
        courseId: 5,
      },
    ],
  },
  {
    id: "6",
    title: "Capacitación en Soporte Vital Básico",
    category: "Emergencias",
    redirect: "curso-soporte-vital",
    createdAt: new Date("2025-05-15T09:10:00.000Z"),
    updatedAt: new Date("2025-05-15T09:15:00.000Z"),
    lessons: [
      {
        id: 11,
        title: "Evaluación primaria del paciente",
        href: "/cursos/6/leccion-1",
        courseId: 6,
      },
      {
        id: 12,
        title: "Ventilaciones con barrera",
        href: "/cursos/6/leccion-2",
        courseId: 6,
      },
    ],
  },
  {
    id: "7",
    title: "RCP y Primeros Auxilios para Empresas",
    category: "Empresas",
    createdAt: new Date("2025-05-14T17:00:00.000Z"),
    updatedAt: new Date("2025-05-14T17:10:00.000Z"),
    lessons: [
      {
        id: 13,
        title: "Organización de primeros auxilios en la oficina",
        href: "/cursos/7/leccion-1",
        courseId: 7,
      },
      {
        id: 14,
        title: "Simulacros y equipos de emergencia",
        href: "/cursos/7/leccion-2",
        courseId: 7,
      },
    ],
  },
];
