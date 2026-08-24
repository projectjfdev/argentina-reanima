import { LegalPage, LegalSection } from "@/components/Legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Donaciones | Argentina Reanima",
  description:
    "Política de Donaciones de las campañas DEA de Asociación Civil Argentina Reanima.",
};

const contactEmail = "argentinareanima.ac@gmail.com";

export default function PoliticaDeDonacionesPage() {
  return (
    <LegalPage
      title="Política de Donaciones"
      updatedAt="19 de agosto de 2026"
      intro={
        <>
          <p>
            Argentina Reanima administra las campañas con fines solidarios y
            procura brindar información clara sobre el destino de los fondos y el
            avance de cada campaña.
          </p>
          <p>
            Esta Política de Donaciones establece las condiciones aplicables a
            los aportes realizados para campañas DEA publicadas por Asociación
            Civil Argentina Reanima.
          </p>
          <p>
            El sitio no procesa pagos en línea. Las donaciones se realizan por
            transferencia bancaria y el comprobante se utiliza para verificar el
            aporte informado.
          </p>
        </>
      }
    >
      {/* TODO: Falta confirmar el tratamiento fiscal de las donaciones, incluyendo si la Asociación emite certificados o recibos con efectos impositivos y si las donaciones resultan deducibles para el donante. Esa información no surge del código y es necesaria para una cláusula tributaria definitiva. */}
      <LegalSection title="Destino de las campañas">
        <p>
          Las campañas DEA tienen por finalidad reunir fondos para la adquisición
          e instalación de un desfibrilador externo automático en una institución
          o espacio identificado en la campaña. Cuando corresponda, Argentina
          Reanima podrá brindar capacitación gratuita vinculada con el uso del
          DEA y publicar información sobre el objetivo, avance y destino de los
          fondos.
        </p>
      </LegalSection>

      <LegalSection title="Meta económica">
        <p>
          La meta económica de cada campaña se calcula en función de los costos
          estimados para concretar la adquisición e instalación del DEA. Dicha
          meta podrá actualizarse si esos costos varían antes de realizar la
          compra, incluyendo variaciones de precios, disponibilidad de equipos,
          costos asociados o cualquier otro cambio que impacte en el valor final.
        </p>
      </LegalSection>

      <LegalSection title="Transferencias bancarias">
        <p>
          Las donaciones se realizan mediante transferencia a la cuenta bancaria
          informada en cada campaña.
        </p>
      </LegalSection>

      <LegalSection title="Verificación y publicación">
        <p>
          La carga de un comprobante no implica la aceptación automática de la
          donación ni su incorporación inmediata al avance publicado. Para que un
          aporte sea computado, Argentina Reanima debe poder verificar el
          comprobante recibido, vincularlo con la campaña correspondiente y
          confirmar el monto a computar.
        </p>
        <p>
          El donante puede optar por figurar públicamente en el listado de
          donantes o realizar su aporte de manera anónima. Cuando elija figurar
          públicamente, podrá publicarse su nombre junto con la fecha y el monto
          verificado de la donación. El email y el comprobante no se publican en
          el listado.
        </p>
      </LegalSection>

      <LegalSection title="Comprobantes y documentación">
        <p>
          Los comprobantes de donación se conservan para verificar los aportes y
          gestionar consultas, correcciones o reclamos vinculados con la donación
          informada.
        </p>
        <p>
          Argentina Reanima podrá publicar documentación vinculada con el destino
          de los fondos, incluyendo comprobantes o facturas de compra cuando
          corresponda.
        </p>
      </LegalSection>

      <LegalSection title="Excedentes y transferencia entre campañas">
        <p>
          Si una campaña supera su objetivo, Argentina Reanima puede destinar el
          excedente a una campaña posterior vinculada con la misma finalidad
          solidaria. Cuando corresponda, el sitio podrá informar esos movimientos
          para mantener la trazabilidad de los fondos.
        </p>
      </LegalSection>

      <LegalSection title="Recibos y consultas">
        <p>
          Para solicitar un recibo, informar un error, pedir una corrección o
          realizar una consulta sobre una donación, la persona interesada puede
          escribir a{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {contactEmail}
          </a>{" "}
          indicando la campaña correspondiente y, si corresponde, adjuntando el
          comprobante de su donación.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
