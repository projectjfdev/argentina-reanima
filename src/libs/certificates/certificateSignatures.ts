export const CERTIFICATE_PRESIDENT_SIGNATURE = {
  name: "Sergio Felice",
  role: "Presidente",
  imageSrc: "/firmas/Sergio-felice.png",
} as const;

export const CERTIFICATE_INSTRUCTORS = [
  {
    key: "emir",
    name: "Emir",
    imageSrc: "/firmas/Emir.png",
  },
  {
    key: "diego-lafalce",
    name: "Diego Lafalce",
    imageSrc: "/firmas/Diego-Lafalce.png",
  },
  {
    key: "santiago-gonzalez-goller",
    name: "Santiago González Goller",
    imageSrc: "/firmas/Santiago_Gonzalez_Goller.png",
  },
  {
    key: "leonardo-hariyo",
    name: "Leonardo Hariyo",
    imageSrc: "/firmas/Leonardo-Hariyo.png",
  },
] as const;

export type CertificateInstructorKey =
  (typeof CERTIFICATE_INSTRUCTORS)[number]["key"];

export function getCertificateInstructorByKey(key: string | null | undefined) {
  return CERTIFICATE_INSTRUCTORS.find((instructor) => instructor.key === key);
}
