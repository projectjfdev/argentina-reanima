import { LegalPage, LegalSection } from "@/components/Legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Argentina Reanima",
  description:
    "Política de Privacidad de Asociación Civil Argentina Reanima.",
};

const contactEmail = "argentinareanima.ac@gmail.com";

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      updatedAt="19 de agosto de 2026"
      intro={
        <>
          <p>
            Esta Política de Privacidad describe cómo Asociación Civil Argentina
            Reanima, Matrícula Nro. 48014, trata los datos personales vinculados
            con este sitio web, sus cuentas de usuario, certificados,
            formularios de contacto, noticias, cursos y campañas de donación.
          </p>
        </>
      }
    >
      {/* TODO: Falta incorporar el domicilio legal o sede administrativa de la Asociación. Es necesario para identificar de forma completa al responsable de la base de datos y para canalizar reclamos formales de titulares de datos. */}
      <LegalSection title="Responsable y contacto">
        <p>
          El responsable del tratamiento es Asociación Civil Argentina Reanima.
          Para ejercer derechos o realizar consultas sobre datos personales, el
          canal disponible en el sitio es{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
          . El sitio también informa el teléfono institucional (0221) 418-1611.
        </p>
      </LegalSection>

      <LegalSection title="Datos que recopila el sitio">
        <p>
          El sitio recopila datos personales cuando la persona los informa en
          formularios, al crear o usar una cuenta, al consultar o recibir
          certificados, o al informar una donación. En concreto:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            En el formulario de contacto: nombre, apellido, email, asunto y
            mensaje.
          </li>
          <li>
            En el registro de cuenta: nombre y apellido, email y contraseña.
          </li>
          <li>
            En el inicio de sesión con Google: nombre, email y estado de
            verificación del email recibidos del proveedor de autenticación.
          </li>
          <li>
            En recuperación y verificación de cuenta: email asociado a la cuenta
            y datos necesarios para gestionar la solicitud.
          </li>
          <li>
            En certificados: nombre de la persona destinataria, email, DNI
            cuando se carga, datos necesarios para emitir y validar el
            certificado, y fecha de vencimiento cuando corresponda.
          </li>
          <li>
            En donaciones: campaña elegida, email del donante, comprobante de
            transferencia, nombre y apellido si el donante decide figurar
            públicamente, monto verificado y fechas vinculadas con la donación.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalidades del tratamiento">
        <p>
          Los datos personales se usan para responder consultas, registrar usuarios,
          permitir el inicio de sesión, verificar emails, restablecer
          contraseñas, asociar certificados a cuentas por email, validar
          públicamente certificados, recibir y revisar comprobantes de donación,
          publicar el avance de campañas DEA con la información visible que
          corresponda y administrar las solicitudes recibidas por el sitio.
        </p>
        <p>
          El sitio publica datos personales solamente en casos concretos:
          certificados públicos accesibles por su identificador y listado público
          de donantes aprobados cuando el donante eligió aparecer. Si el donante
          eligió anonimato, el listado público muestra la donación como anónima,
          aunque Argentina Reanima conserva el email y comprobante para control
          interno.
        </p>
      </LegalSection>

      <LegalSection title="Servicios de terceros">
        <p>
          Para prestar las funcionalidades del sitio, Argentina Reanima puede
          utilizar proveedores externos que tratan datos por su cuenta y según
          sus instrucciones. Estos servicios se utilizan únicamente para operar
          el sitio y gestionar las solicitudes, cuentas, comunicaciones,
          certificados y donaciones.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Los mensajes enviados desde el formulario de contacto pueden ser
            procesados mediante un servicio externo de envío de comunicaciones.
          </li>
          <li>
            Los emails de confirmación de cuenta y recuperación de contraseña se
            envían mediante un proveedor externo de correo.
          </li>
          <li>
            Google se utiliza como proveedor opcional de inicio de sesión.
          </li>
          <li>
            Los archivos e imágenes vinculados con el sitio, incluyendo
            comprobantes de donación cuando corresponda, pueden almacenarse en un
            proveedor externo de almacenamiento. Los comprobantes se consultan
            para revisar la donación.
          </li>
          <li>
            Podemos utilizar servicios de terceros para enviar notificaciones
            internas relacionadas con la administración del sitio.
          </li>
          <li>
            El sitio puede mostrar o enlazar contenido audiovisual,
            publicaciones sociales y mapas provistos por plataformas externas.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies y almacenamiento local">
        <p>
          El sitio utiliza cookies técnicas necesarias para mantener la sesión
          de usuario y permitir el funcionamiento de las cuentas. Actualmente no
          utiliza cookies de analítica, publicidad comportamental o remarketing.
        </p>
      </LegalSection>

      <LegalSection title="Conservación y seguridad">
        <p>
          Los datos se conservan mientras sean necesarios para operar las
          funcionalidades del sitio, mantener cuentas, acreditar certificados,
          revisar donaciones, documentar campañas y cumplir obligaciones legales
          o necesidades institucionales vinculadas con esas finalidades.
        </p>
        <p>
          Argentina Reanima adopta medidas técnicas y organizativas razonables
          para proteger la información personal contra accesos no autorizados,
          pérdida, alteración o divulgación indebida.
        </p>
      </LegalSection>

      <LegalSection title="Derechos de las personas titulares">
        <p>
          Conforme la Ley 25.326 de Protección de los Datos Personales, toda
          persona puede solicitar acceso, rectificación, actualización o
          supresión de sus datos cuando corresponda. El derecho de supresión
          puede no proceder cuando exista una obligación legal de conservar
          información o cuando la eliminación afecte derechos de terceros o
          registros necesarios, por ejemplo registros vinculados con certificados
          emitidos o comprobantes de donaciones.
        </p>
        <p>
          Las solicitudes pueden enviarse a{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>
          . La autoridad de control en Argentina es la Agencia de Acceso a la
          Información Pública.
        </p>
      </LegalSection>

      <LegalSection title="Cambios a esta política">
        <p>
          Argentina Reanima podrá actualizar esta Política de Privacidad para
          reflejar cambios normativos o modificaciones en el funcionamiento del
          sitio. La versión vigente será siempre la publicada en esta página.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
