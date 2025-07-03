import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function TextOneImage() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto flex justify-center">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:items-center mx-4">
          <Image
            src="/images/desfibrilador.jpg"
            alt="desfibrilador"
            width={100}
            height={100}
            className="rounded-md h-[500px] w-[450px] "
          />
          <div className="flex gap-4 pl-0 lg:pl-20 flex-col  flex-1">
            <div>
              <Badge>DEA</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-xl md:text-3xl tracking-tighter lg:max-w-xl font-regular text-left">
                Actividades cardioasistidas
              </h2>
              <p className="text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left">
                Gracias al aporte mensual de nuestros socios y a las
                capacitaciones brindadas a instituciones privadas, comercios y
                empresas, en Argentina Reanima pudimos adquirir nuestro propio
                desfibrilador externo automático (DEA).
              </p>
              <p className="text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left">
                Este equipo forma parte activa de nuestras jornadas,
                convirtiendo cada espacio donde capacitamos —y sus alrededores—
                en un entorno cardioasistido, preparado para responder ante
                emergencias.
              </p>
              <p className="text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left">
                No solo promovemos el acceso a herramientas vitales: las
                integramos en nuestras actividades, reafirmando nuestro
                compromiso con una comunidad más segura y preparada
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TextOneImage };
