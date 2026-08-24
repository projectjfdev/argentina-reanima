import { LegalPage, LegalSection } from "@/components/Legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Argentina Reanima",
  description:
    "Términos y Condiciones de uso del sitio de Asociación Civil Argentina Reanima.",
};

const contactEmail = "argentinareanima.ac@gmail.com";

export default function TerminosYCondicionesPage() {
  return (
    <LegalPage
      title="Términos y Condiciones"
      updatedAt="19 de agosto de 2026"
      intro={
        <>
          <p>
            Estos Términos y Condiciones regulan el uso del sitio web de
            Asociación Civil Argentina Reanima, Matrícula Nro. 48014. El uso del
            sitio implica la aceptación de los presentes Términos y Condiciones
            en la medida en que resulten aplicables a las funcionalidades
            utilizadas.
          </p>
          <p>
            El sitio tiene finalidad institucional, educativa, informativa y de
            gestión de campañas DEA.
          </p>
        </>
      }
    >
      {/* TODO: Falta incorporar el domicilio legal o sede administrativa de la Asociación. Ese dato es necesario para completar la identificación legal del titular del sitio en una versión final de términos. */}
      <LegalSection title="Alcance del sitio">
        <p>
          El sitio permite acceder a contenidos institucionales y educativos de
          Argentina Reanima, consultar certificados emitidos, crear una cuenta,
          enviar consultas y participar en campañas de donación para instalar
          DEA.
        </p>
      </LegalSection>

      <LegalSection title="Cuentas de usuario">
        <p>
          Las personas pueden crear una cuenta con nombre, email y contraseña, o
          iniciar sesión con Google. Para iniciar sesión con credenciales locales
          es necesario confirmar el email. La cuenta de usuario permite consultar
          información del perfil y certificados asociados al email o al usuario.
        </p>
        <p>
          La persona usuaria debe cargar información veraz, mantener la
          confidencialidad de sus credenciales y no usar cuentas ajenas.
        </p>
      </LegalSection>

      <LegalSection title="Certificados">
        <p>
          Argentina Reanima puede emitir certificados vinculados con sus
          capacitaciones o actividades. Cada certificado cuenta con datos de
          identificación que permiten verificar su autenticidad.
        </p>
        <p>
          La validación pública muestra los datos necesarios para comprobar la
          autenticidad del certificado. Si un certificado fue desactivado, el
          sitio informa ese estado y no ofrece descarga activa. La existencia de
          una cuenta no garantiza la emisión de certificados; los certificados se
          vinculan cuando Argentina Reanima los otorga.
        </p>
      </LegalSection>

      <LegalSection title="Contenido educativo e institucional">
        <p>
          Los textos, videos, noticias y materiales sobre RCP, DEA, maniobra de
          Heimlich, actividades y marco normativo tienen finalidad educativa e
          informativa. No reemplazan la atención médica, la asistencia de
          emergencias ni la capacitación presencial o habilitación formal cuando
          corresponda por normativa aplicable.
        </p>
        <p>
          La persona usuaria debe actuar ante emergencias conforme su formación,
          las instrucciones de los servicios de emergencia y la normativa
          vigente.
        </p>
      </LegalSection>

      <LegalSection title="Formulario de contacto">
        <p>
          El formulario de contacto debe utilizarse para consultas sobre
          capacitaciones, actividades institucionales, alianzas o mensajes
          relacionados con Argentina Reanima. No debe usarse para enviar
          contenido ilícito, ofensivo, datos de terceros sin autorización o
          información falsa.
        </p>
      </LegalSection>

      <LegalSection title="Donaciones">
        <p>
          Las donaciones publicadas en el sitio se realizan por transferencia
          bancaria a la cuenta informada en la campaña. El sitio solo permite
          cargar el comprobante para revisión; no procesa pagos con tarjeta, no
          almacena datos bancarios del donante y no confirma automáticamente el
          monto.
        </p>
        <p>
          Argentina Reanima revisa el comprobante recibido y puede aprobar o
          rechazar la donación informada. La participación en una campaña no
          otorga contraprestación, propiedad sobre el DEA ni derechos sobre la
          institución beneficiaria.
        </p>
      </LegalSection>

      <LegalSection title="Uso permitido del sitio">
        <p>
          No está permitido interferir con la seguridad del sitio, intentar
          acceder a áreas o funciones restringidas sin autorización, cargar
          archivos maliciosos, utilizar datos obtenidos del sitio para fines
          abusivos, suplantar identidades o afectar la disponibilidad del
          servicio.
        </p>
      </LegalSection>

      <LegalSection title="Servicios y enlaces externos">
        <p>
          El sitio puede integrar o enlazar servicios externos para mostrar
          contenido audiovisual, publicaciones sociales, mapas, formularios,
          emails transaccionales o inicio de sesión con terceros. Al interactuar
          con contenidos embebidos o enlaces externos, pueden aplicarse
          condiciones y políticas propias de esos terceros.
        </p>
      </LegalSection>

      <LegalSection title="Disponibilidad y cambios">
        <p>
          Argentina Reanima podrá modificar el sitio, sus contenidos y
          funcionalidades cuando resulte necesario por razones técnicas,
          organizativas o institucionales.
        </p>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>
          Para consultas sobre estos términos, escribir a{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
