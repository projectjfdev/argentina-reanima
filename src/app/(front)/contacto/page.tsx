import BannerHero from "@/components/BannerHero/BannerHero";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import React from "react";

const ContactoPage = () => {
  return (
    <div className="flex flex-col gap-7 md:gap-16 mt-10">
      <BannerHero
        imgClassname={"object-cover"}
        // imgClassname="object-fit md:object-cover object-[right_0px] md:object-[center_0px] "
        src={
          "https://res.cloudinary.com/dtbryiptz/image/upload/v1748027840/banner-contacto_iukk0c.png"
        }
        srcMobile={
          "https://res.cloudinary.com/dtbryiptz/image/upload/v1748027840/banner-contacto_iukk0c.png"
        }
        title="Contacto"
        description="Comunicate con nosotros para consultas institucionales, alianzas estratégicas o información sobre nuestras actividades"
      />
      <div className="px-4 md:px-0 flex flex-col gap-7 md:gap-16">
        <ContactForm />
      </div>
    </div>
  );
};

export default ContactoPage;
